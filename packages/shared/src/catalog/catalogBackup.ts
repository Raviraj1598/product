import type { ServerCatalog } from '../api/catalogApi';
import { normalizeBuiltPages } from '../cms/normalizeBuiltPages';
import { mergeStoreSettings } from './storeSettings';
import type { Product } from '../types';

export const CATALOG_BACKUP_VERSION = 1;

export type CatalogBackupSection = keyof Pick<
  ServerCatalog,
  | 'products'
  | 'categories'
  | 'customers'
  | 'orders'
  | 'reviews'
  | 'coupons'
  | 'settings'
  | 'builtPages'
  | 'affiliateReferrals'
>;

export const CATALOG_BACKUP_SECTIONS: {
  id: CatalogBackupSection;
  label: string;
  hint: string;
}[] = [
  { id: 'products', label: 'Products', hint: 'Catalog SKUs, affiliate + in-store' },
  { id: 'categories', label: 'Categories', hint: 'Storefront category chips' },
  { id: 'orders', label: 'Orders', hint: 'Checkout history & invoices' },
  { id: 'customers', label: 'Customers', hint: 'Registered shopper profiles' },
  { id: 'reviews', label: 'Reviews', hint: 'Product reviews' },
  { id: 'coupons', label: 'Coupons', hint: 'Discount codes' },
  { id: 'settings', label: 'Store settings', hint: 'Branding, shipping, affiliate platforms' },
  { id: 'builtPages', label: 'CMS pages', hint: 'Page builder content' },
  { id: 'affiliateReferrals', label: 'Affiliate clicks', hint: 'Outbound partner link log' },
];

export interface CatalogBackupFile {
  version: number;
  exportedAt: string;
  siteName: string;
  sections: CatalogBackupSection[];
  data: Partial<ServerCatalog>;
}

export function buildCatalogBackup(
  catalog: ServerCatalog,
  sections: CatalogBackupSection[],
): CatalogBackupFile {
  const data: Partial<ServerCatalog> = {};
  for (const key of sections) {
    (data as Record<string, unknown>)[key] = catalog[key];
  }
  return {
    version: CATALOG_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    siteName: mergeStoreSettings(catalog.settings).siteName,
    sections: [...sections],
    data,
  };
}

export function downloadCatalogBackup(backup: CatalogBackupFile, filename?: string): void {
  const stamp = backup.exportedAt.split('T')[0];
  const slug = backup.siteName.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || 'store';
  const name = filename ?? `giftjoy-backup-${slug}-${stamp}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export type CatalogImportResult = {
  applied: CatalogBackupSection[];
  warnings: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function parseCatalogBackupFile(raw: unknown): CatalogBackupFile {
  if (!isRecord(raw)) throw new Error('Invalid backup file.');
  const version = raw.version;
  if (version !== CATALOG_BACKUP_VERSION) {
    throw new Error(`Unsupported backup version (${String(version)}). Expected ${CATALOG_BACKUP_VERSION}.`);
  }
  if (!isRecord(raw.data)) throw new Error('Backup is missing data.');
  if (!Array.isArray(raw.sections)) throw new Error('Backup is missing sections list.');
  return raw as CatalogBackupFile;
}

export function mergeCatalogImport(
  current: ServerCatalog,
  backup: CatalogBackupFile,
  selected: CatalogBackupSection[],
): { next: ServerCatalog; result: CatalogImportResult } {
  const warnings: string[] = [];
  const applied: CatalogBackupSection[] = [];
  const next: ServerCatalog = { ...current };

  for (const section of selected) {
    const incoming = backup.data[section];
    if (incoming === undefined) {
      warnings.push(`Section “${section}” not found in backup — skipped.`);
      continue;
    }
    applied.push(section);
    switch (section) {
      case 'products':
        next.products = incoming as Product[];
        break;
      case 'categories':
        next.categories = incoming as ServerCatalog['categories'];
        break;
      case 'orders':
        next.orders = incoming as ServerCatalog['orders'];
        break;
      case 'customers':
        next.customers = incoming as ServerCatalog['customers'];
        break;
      case 'reviews':
        next.reviews = incoming as ServerCatalog['reviews'];
        break;
      case 'coupons':
        next.coupons = incoming as ServerCatalog['coupons'];
        break;
      case 'settings':
        next.settings = mergeStoreSettings(incoming as Partial<ServerCatalog['settings']>);
        break;
      case 'builtPages':
        next.builtPages = normalizeBuiltPages(incoming);
        break;
      case 'affiliateReferrals':
        next.affiliateReferrals = (incoming as ServerCatalog['affiliateReferrals']) ?? [];
        break;
      default:
        break;
    }
  }

  return { next, result: { applied, warnings } };
}
