import './loadEnv.js';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'node:crypto';
import { emailProviderStatus, sendOrderNotification } from './email/notify.js';

import type { BuiltPage, Order, StoreSettings, AffiliateReferral } from '../packages/shared/src/types';
import { normalizeBuiltPages } from '../packages/shared/src/cms/normalizeBuiltPages';
import { mergeStoreSettings } from '../packages/shared/src/catalog/storeSettings';
import { createRequireAdmin } from './auth/middleware';
import {
  clearSessionCookie,
  loginWithPassword,
  logoutSession,
  changeAdminPassword,
  revokeOtherAdminSessions,
  adminSecuritySnapshot,
  resolveAdminUser,
  setSessionCookie,
} from './auth/session';
import type { CatalogJson } from './catalogService';
import { seedCatalog } from './catalogService';
import { couponsSafeForStorefront, createCatalogRepository } from './catalogRepository';
import { createAuthRepository } from './authRepository';
import { createCustomerRepository } from './customerRepository';
import { mountCustomerAuthRoutes, attachCustomerToOrder } from './customerAuth/routes';
import { fetchAffiliatePreview as fetchAffiliatePreviewFromUrl } from './affiliatePreview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3001;
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
const JSON_LIMIT_MAX = process.env.CATALOG_JSON_LIMIT?.trim() || '5mb';
const isProduction = process.env.NODE_ENV === 'production';

const repo = createCatalogRepository({ dirname: __dirname });
const authRepo = createAuthRepository({ dirname: __dirname });
const customerRepo = createCustomerRepository({ dirname: __dirname });
const requireAdmin = createRequireAdmin(authRepo);

function readFullCatalog(): CatalogJson {
  try {
    return repo.read();
  } catch {
    return seedCatalog();
  }
}

function persistFullCatalog(next: CatalogJson): void {
  repo.write(next);
}

function storefrontBundle(full: CatalogJson) {
  return {
    products: full.products,
    categories: full.categories,
    reviews: full.reviews,
    coupons: couponsSafeForStorefront(full.coupons.filter((c) => c.active)),
    settings: full.settings,
    builtPages: full.builtPages.filter((p) => p.published),
    orders: [] satisfies Order[],
  };
}

const app = express();

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

if (isProduction && (!corsOrigins || corsOrigins.length === 0)) {
  console.warn(
    '[catalog] CORS_ORIGINS is empty in production — browsers will reject cross-origin admin/storefront fetch. Set explicit origins.',
  );
}

app.use(
  cors({
    origin:
      corsOrigins && corsOrigins.length > 0
        ? corsOrigins
        : /* dev default: permissive */ true,
    credentials: true,
  }),
);
app.use(express.json({ limit: JSON_LIMIT_MAX }));

mountCustomerAuthRoutes(app, customerRepo, {
  read: readFullCatalog,
  write: persistFullCatalog,
});

const catalogReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.PUBLIC_CATALOG_RATE_LIMIT_MAX) || 600,
});

const adminCatalogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.ADMIN_CATALOG_RATE_LIMIT_MAX) || 200,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 20,
  message: { error: 'Too many login attempts. Try again later.' },
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.ORDER_RATE_LIMIT_MAX) || 80,
});

const affiliatePreviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AFFILIATE_PREVIEW_RATE_LIMIT_MAX) || 40,
  message: { error: 'Too many import attempts. Try again later.' },
});

const affiliateClickLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AFFILIATE_CLICK_RATE_LIMIT_MAX) || 300,
  message: { error: 'Too many requests. Try again later.' },
});

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: 'sqlite', auth: 'session' }));

app.get('/api/auth/me', (req, res) => {
  const user = resolveAdminUser(req, authRepo);
  if (!user) {
    res.status(401).json({ error: 'Not signed in', code: 'AUTH_REQUIRED' });
    return;
  }
  res.json({ user });
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const result = await loginWithPassword(authRepo, email, password);
  if ('error' in result) {
    res.status(401).json({ error: result.error });
    return;
  }

  setSessionCookie(res, result.token);
  res.json({ user: result.user });
});

app.post('/api/auth/logout', (req, res) => {
  logoutSession(authRepo, req);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/security', requireAdmin, (req, res) => {
  const snapshot = adminSecuritySnapshot(authRepo, req);
  if (!snapshot) {
    res.status(401).json({ error: 'Not signed in', code: 'AUTH_REQUIRED' });
    return;
  }
  const mail = emailProviderStatus();
  res.json({
    ...snapshot,
    emailProviderConfigured: mail.resend || mail.smtp,
  });
});

app.post('/api/auth/change-password', requireAdmin, async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password are required' });
    return;
  }
  const result = await changeAdminPassword(authRepo, req, currentPassword, newPassword);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ ok: true });
});

app.post('/api/auth/revoke-sessions', requireAdmin, (req, res) => {
  const result = revokeOtherAdminSessions(authRepo, req);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ ok: true, revoked: result.revoked });
});

/** Record outbound affiliate link click (purchase completes on partner site). */
app.post('/api/store/affiliate-click', affiliateClickLimiter, (req, res) => {
  const productId = typeof req.body?.productId === 'string' ? req.body.productId.trim() : '';
  const productName = typeof req.body?.productName === 'string' ? req.body.productName.trim() : '';
  const destinationUrl = typeof req.body?.destinationUrl === 'string' ? req.body.destinationUrl.trim() : '';
  if (!productId || !productName || !destinationUrl) {
    res.status(400).json({ error: 'productId, productName, and destinationUrl are required' });
    return;
  }
  try {
    const current = readFullCatalog();
    const referral: AffiliateReferral = {
      id: `ref_${crypto.randomUUID()}`,
      productId,
      productName,
      platformId: typeof req.body?.platformId === 'string' ? req.body.platformId.trim() : undefined,
      platformName: typeof req.body?.platformName === 'string' ? req.body.platformName.trim() : undefined,
      destinationUrl,
      clickedAt: new Date().toISOString(),
    };
    const affiliateReferrals = [referral, ...(current.affiliateReferrals ?? [])].slice(0, 2000);
    persistFullCatalog({ ...current, affiliateReferrals });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not record affiliate click' });
  }
});

/** Public storefront read — no draft CMS pages / no historical orders data. */
app.get(
  ['/api/store/catalog', '/api/catalog'],
  catalogReadLimiter,
  (_req, res) => {
    try {
      const full = readFullCatalog();
      res.json(storefrontBundle(full));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Could not load catalog' });
    }
  },
);

/** Authenticated payload for the admin SPA (session cookie or legacy token). */
app.get('/api/admin/catalog', adminCatalogLimiter, requireAdmin, (_req, res) => {
  try {
    res.json(readFullCatalog());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load catalog' });
  }
});

/** Replace catalog envelope (writes SQLite transaction). */
app.put('/api/admin/catalog', adminCatalogLimiter, requireAdmin, (req, res) => {
  try {
    const current = readFullCatalog();
    const body = req.body as Partial<CatalogJson>;

    let nextSettings = current.settings;
    if (body.settings !== undefined && body.settings !== null && typeof body.settings === 'object') {
      nextSettings = mergeStoreSettings({
        ...(current.settings as Partial<StoreSettings>),
        ...(body.settings as Partial<StoreSettings>),
      });
    }

    const merged: CatalogJson = {
      products: Array.isArray(body.products) ? body.products : current.products,
      categories: Array.isArray(body.categories) ? body.categories : current.categories,
      customers: Array.isArray(body.customers) ? body.customers : current.customers,
      orders:
        Array.isArray(body.orders) && (body.orders.length > 0 || current.orders.length === 0)
          ? body.orders
          : current.orders,
      reviews: Array.isArray(body.reviews) ? body.reviews : current.reviews,
      coupons: Array.isArray(body.coupons) ? body.coupons : current.coupons,
      settings: nextSettings,
      builtPages: Array.isArray(body.builtPages)
        ? (normalizeBuiltPages(body.builtPages) as BuiltPage[])
        : current.builtPages,
      affiliateReferrals: Array.isArray(body.affiliateReferrals)
        ? (body.affiliateReferrals as AffiliateReferral[])
        : (current.affiliateReferrals ?? []),
    };

    persistFullCatalog(merged);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save catalog' });
  }
});

/** Import partner product metadata from an affiliate URL (admin only). */
app.post('/api/admin/affiliate/preview', affiliatePreviewLimiter, requireAdmin, async (req, res) => {
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  const amazonAffiliateTag =
    typeof req.body?.amazonAffiliateTag === 'string' ? req.body.amazonAffiliateTag.trim() : undefined;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }
  try {
    const preview = await fetchAffiliatePreviewFromUrl(url, { amazonAffiliateTag });
    res.json(preview);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not import product details';
    res.status(422).json({ error: message });
  }
});

/** Legacy unsecured PUT retained as explicit redirect hint */
app.put('/api/catalog', (_req, res) => {
  res.status(410).json({
    error: 'This endpoint moved. Sign in via POST /api/auth/login and use PUT /api/admin/catalog with session cookie.',
  });
});

app.post('/api/orders', orderLimiter, (req, res) => {
  try {
    const order = req.body?.order as Order | undefined;
    if (!order || typeof order !== 'object' || !Array.isArray(order.items)) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const catalog = readFullCatalog();
    const customerId = resolveCustomerId(req, customerRepo);
    const enriched = attachCustomerToOrder(order, customerId, catalog);
    catalog.orders.push(enriched);

    const code = enriched.couponCode;
    if (code) {
      const upper = code.toUpperCase();
      const couponIndex = catalog.coupons.findIndex(
        (c) => c.code.toUpperCase() === upper && c.active,
      );
      if (couponIndex >= 0) {
        const c = catalog.coupons[couponIndex];
        catalog.coupons[couponIndex] = { ...c, usageCount: (c.usageCount ?? 0) + 1 };
      }
    }

    persistFullCatalog(catalog);
    void sendOrderNotification(enriched, catalog.settings).then((r) => {
      if (!r.sent && r.reason) console.log(`[email] ${r.reason}`);
    });
    res.status(201).json({
      ok: true,
      orderId: enriched.id,
      invoiceNumber: enriched.invoiceNumber,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not place order' });
  }
});

const server = app.listen(PORT, () => {
  console.log(
    `[catalog] API http://127.0.0.1:${PORT} · SQLite · session auth · rate limits`,
  );
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`[catalog] ${signal}: closing HTTP + SQLite`);
  server.close(() => {
    try {
      authRepo.close();
      customerRepo.close();
      repo.close();
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
