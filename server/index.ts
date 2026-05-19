import crypto from 'node:crypto';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import type { BuiltPage, Order, StoreSettings } from '../packages/shared/src/types';
import { normalizeBuiltPages } from '../packages/shared/src/cms/normalizeBuiltPages';
import { mergeStoreSettings } from '../packages/shared/src/catalog/storeSettings';
import { fileURLToPath } from 'url';
import path from 'path';

import type { CatalogJson } from './catalogService';
import { seedCatalog } from './catalogService';
import { couponsSafeForStorefront, createCatalogRepository } from './catalogRepository';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3001;
const ADMIN_SECRET = process.env.ADMIN_API_SECRET?.trim();

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);

const JSON_LIMIT_MAX = process.env.CATALOG_JSON_LIMIT?.trim() || '5mb';
const isProduction = process.env.NODE_ENV === 'production';

/** Hash before comparison so timings do not leak token length hints. */
function adminTokenMatches(secret: string, presentedRaw: unknown): boolean {
  if (typeof presentedRaw !== 'string' || !presentedRaw.trim()) return false;
  const presented = presentedRaw.trim();
  try {
    const hSecret = crypto.createHash('sha256').update(secret, 'utf8').digest();
    const hTok = crypto.createHash('sha256').update(presented, 'utf8').digest();
    return crypto.timingSafeEqual(hSecret, hTok);
  } catch {
    return false;
  }
}

const repo = createCatalogRepository({ dirname: __dirname });

/** Admin routes require ADMIN_API_SECRET in production; in dev omitting it allows unsecured admin (explicit). */
function enforceAdminCatalog(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!ADMIN_SECRET) {
    if (isProduction) {
      console.error('[catalog] Set ADMIN_API_SECRET to enable admin APIs');
      res.status(503).json({ error: 'Admin API disabled until ADMIN_API_SECRET is configured' });
      return;
    }
    console.warn('[catalog] ADMIN_API_SECRET missing — catalog admin routes accept any caller (development only)');
    next();
    return;
  }

  const token = req.headers['x-admin-token'];
  if (!adminTokenMatches(ADMIN_SECRET, token)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

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
    /** JSON REST API consumed cross-origin via CORS; default same-origin CORP blocks some fetch modes. */
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

const catalogReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.PUBLIC_CATALOG_RATE_LIMIT_MAX) || 600,
});

const adminCatalogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.ADMIN_CATALOG_RATE_LIMIT_MAX) || 200,
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.ORDER_RATE_LIMIT_MAX) || 80,
});

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: 'sqlite' }));

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

/** Authenticated payload for the admin SPA (requires ADMIN_API_SECRET in production). */
app.get('/api/admin/catalog', adminCatalogLimiter, enforceAdminCatalog, (_req, res) => {
  try {
    res.json(readFullCatalog());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load catalog' });
  }
});

/** Replace catalog envelope (writes SQLite transaction). */
app.put('/api/admin/catalog', adminCatalogLimiter, enforceAdminCatalog, (req, res) => {
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
      orders: Array.isArray(body.orders) ? body.orders : current.orders,
      reviews: Array.isArray(body.reviews) ? body.reviews : current.reviews,
      coupons: Array.isArray(body.coupons) ? body.coupons : current.coupons,
      settings: nextSettings,
      builtPages: Array.isArray(body.builtPages)
        ? (normalizeBuiltPages(body.builtPages) as BuiltPage[])
        : current.builtPages,
    };

    persistFullCatalog(merged);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save catalog' });
  }
});

/** Legacy unsecured PUT retained as explicit redirect hint */
app.put('/api/catalog', (_req, res) => {
  res.status(410).json({
    error: 'This endpoint moved. PUT /api/admin/catalog with ADMIN_API_SECRET and x-admin-token header.',
  });
});

app.post('/api/orders', orderLimiter, (req, res) => {
  try {
    const order = req.body?.order as Order | undefined;
    if (!order || typeof order !== 'object' || !Array.isArray(order.items)) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const catalog = readFullCatalog();
    catalog.orders.push(order);

    const code = order.couponCode;
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
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not place order' });
  }
});

const server = app.listen(PORT, () => {
  console.log(
    `[catalog] API http://127.0.0.1:${PORT} · SQLite WAL · helmet · rate limits (catalog read / admin / orders)`,
  );
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`[catalog] ${signal}: closing HTTP + SQLite`);
  server.close(() => {
    try {
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
