import fs from 'fs';
import path from 'path';

import type { BuiltPage, Category, Coupon, Order, Product, Review, StoreSettings } from '../packages/shared/src/types';
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
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: StoreSettings;
  builtPages: BuiltPage[];
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
  const orders = Array.isArray(p.orders) ? (p.orders as Order[]) : [];
  const reviews = Array.isArray(p.reviews) ? (p.reviews as Review[]) : [...defaultReviews];
  const coupons = Array.isArray(p.coupons) ? (p.coupons as Coupon[]) : [...defaultCoupons];
  const settings = mergeStoreSettings(isRecord(p.settings) ? (p.settings as Partial<StoreSettings>) : undefined);
  const builtPages = normalizeBuiltPages(p.builtPages);

  return { products, categories, orders, reviews, coupons, settings, builtPages };
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
