import type {
  AffiliateReferral,
  BuiltPage,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  Review,
  StoreSettings,
} from '../types';
import { mergeStoreSettings } from '../catalog/storeSettings';
import { hydrateCategories } from '../catalog/categoryHelpers';
import { defaultCategories } from '../catalog/seedCatalog';
import { normalizeBuiltPages } from '../cms/normalizeBuiltPages';

export interface ServerCatalog {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  /** CMS pages rendered at storefront `/p/:slug` when `published`. */
  builtPages: BuiltPage[];
  /** Outbound affiliate clicks (admin catalog only). */
  affiliateReferrals?: AffiliateReferral[];
}

declare const __ADMIN_BUILD__: boolean;

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

/** Replaced per-Vite-bundle: storefront=false, admin=true. */
export function isAdminCatalogClient(): boolean {
  return typeof __ADMIN_BUILD__ !== 'undefined' && __ADMIN_BUILD__ === true;
}

const CATALOG_READ_PATH = isAdminCatalogClient() ? '/api/admin/catalog' : '/api/store/catalog';

/** Legacy automation header — prefer session cookie from `/api/auth/login`. */
function adminHeaders(): Record<string, string> {
  const token = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;
  if (token) return { 'x-admin-token': token };
  return {};
}

function adminFetchInit(): RequestInit {
  if (!isAdminCatalogClient()) return {};
  return { credentials: 'include', headers: adminHeaders() };
}

export async function fetchCatalog(): Promise<ServerCatalog> {
  const res = await fetch(`${apiBase()}${CATALOG_READ_PATH}`, adminFetchInit());
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const raw = (await res.json()) as Partial<ServerCatalog>;
  const incomingCats = Array.isArray(raw.categories) ? (raw.categories as Category[]) : defaultCategories;

  return {
    products: raw.products ?? [],
    categories: hydrateCategories(incomingCats),
    customers: raw.customers ?? [],
    orders: raw.orders ?? [],
    reviews: raw.reviews ?? [],
    coupons: raw.coupons ?? [],
    settings: mergeStoreSettings(raw.settings ?? undefined),
    builtPages: normalizeBuiltPages(raw.builtPages),
    affiliateReferrals: raw.affiliateReferrals ?? [],
  };
}

export async function putCatalog(slice: ServerCatalog): Promise<void> {
  const res = await fetch(`${apiBase()}/api/admin/catalog`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...adminHeaders() },
    body: JSON.stringify({
      ...slice,
      settings: mergeStoreSettings(slice.settings),
    }),
  });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Catalog save failed: ${res.status} ${err}`);
  }
}

export { postOrder, type PlaceOrderResult } from './customerApi';
