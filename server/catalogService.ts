import fs from 'fs';
import path from 'path';

import type {
  BuiltPage,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  Review,
  StoreSettings,
} from '../packages/shared/src/types';
import {
  defaultCategories,
  defaultCoupons,
  defaultProducts,
  defaultReviews,
} from '../packages/shared/src/catalog/seedCatalog';
import { mergeStoreSettings } from '../packages/shared/src/catalog/storeSettings';
import { normalizeBuiltPages } from '../packages/shared/src/cms/normalizeBuiltPages';
import { hydrateCategories } from '../packages/shared/src/catalog/categoryHelpers';

export interface CatalogJson {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  builtPages: BuiltPage[];
}

function normalizeCustomers(raw: unknown): Customer[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c): c is Customer => typeof c === 'object' && c !== null && typeof (c as Customer).email === 'string')
    .map((c) => ({
      id: typeof c.id === 'string' && c.id ? c.id : `cus_${Date.now()}`,
      email: c.email.trim().toLowerCase(),
      name: typeof c.name === 'string' ? c.name : '',
      phone: typeof c.phone === 'string' ? c.phone : '',
      addressLine1: typeof c.addressLine1 === 'string' ? c.addressLine1 : '',
      city: typeof c.city === 'string' ? c.city : '',
      zipCode: typeof c.zipCode === 'string' ? c.zipCode : '',
      country: typeof c.country === 'string' ? c.country : '',
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
      updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
    }));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Normalize loosely-typed persisted JSON → canonical catalog envelope. */
export function normalizeParsedCatalog(parsed: unknown): CatalogJson {
  const p = isRecord(parsed) ? parsed : {};

  const products = Array.isArray(p.products)
    ? (p.products as Product[])
    : (JSON.parse(JSON.stringify(defaultProducts)) as Product[]);
  const categories = hydrateCategories(
    Array.isArray(p.categories) && (p.categories as Category[]).length > 0
      ? (p.categories as Category[])
      : [...defaultCategories],
  );
  const customers = normalizeCustomers(p.customers);
  const orders = Array.isArray(p.orders) ? (p.orders as Order[]) : [];
  const reviews = Array.isArray(p.reviews) ? (p.reviews as Review[]) : [...defaultReviews];
  const coupons = Array.isArray(p.coupons) ? (p.coupons as Coupon[]) : [...defaultCoupons];
  const settings = mergeStoreSettings(isRecord(p.settings) ? (p.settings as Partial<StoreSettings>) : undefined);
  const builtPages = normalizeBuiltPages(p.builtPages);

  return { products, categories, customers, orders, reviews, coupons, settings, builtPages };
}

/** Legacy single-file fallback / seed baseline. */
export function seedCatalog(): CatalogJson {
  return normalizeParsedCatalog({});
}

export function readLegacyCatalogJsonSync(legacyPath: string): CatalogJson | null {
  try {
    if (!fs.existsSync(legacyPath)) return null;
    const raw = fs.readFileSync(legacyPath, 'utf-8');
    return normalizeParsedCatalog(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function catalogLegacyDefaultPath(dirname: string) {
  return path.join(dirname, 'data', 'catalog.json');
}
