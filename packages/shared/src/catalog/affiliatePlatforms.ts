import type { AffiliatePlatformConfig, Product, StoreSettings } from '../types';

export function defaultAffiliatePlatforms(): AffiliatePlatformConfig[] {
  return [
    {
      id: 'amazon-in',
      name: 'Amazon India',
      domainPattern: 'amazon.in',
      affiliateParamName: 'tag',
      affiliateParamValue: 'aaravitech-21',
      buttonLabel: 'Buy on Amazon',
      currency: 'INR',
      importEnabled: true,
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'amazon-com',
      name: 'Amazon.com',
      domainPattern: 'amazon.com',
      affiliateParamName: 'tag',
      affiliateParamValue: '',
      buttonLabel: 'Buy on Amazon',
      currency: 'USD',
      importEnabled: true,
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'flipkart',
      name: 'Flipkart',
      domainPattern: 'flipkart.com',
      affiliateParamName: 'affid',
      affiliateParamValue: '',
      buttonLabel: 'Buy on Flipkart',
      currency: 'INR',
      importEnabled: false,
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'myntra',
      name: 'Myntra',
      domainPattern: 'myntra.com',
      affiliateParamName: 'utm_source',
      affiliateParamValue: 'affiliate',
      buttonLabel: 'Buy on Myntra',
      currency: 'INR',
      importEnabled: false,
      enabled: true,
      sortOrder: 3,
    },
    {
      id: 'meesho',
      name: 'Meesho',
      domainPattern: 'meesho.com',
      affiliateParamName: 'external_id',
      affiliateParamValue: '',
      buttonLabel: 'Buy on Meesho',
      currency: 'INR',
      importEnabled: false,
      enabled: true,
      sortOrder: 4,
    },
    {
      id: 'other',
      name: 'Other partner',
      domainPattern: '',
      affiliateParamName: '',
      affiliateParamValue: '',
      buttonLabel: 'Shop now',
      currency: 'INR',
      importEnabled: false,
      enabled: true,
      sortOrder: 99,
    },
  ];
}

export function sortedAffiliatePlatforms(
  platforms?: AffiliatePlatformConfig[] | null,
): AffiliatePlatformConfig[] {
  const rows = platforms?.length ? [...platforms] : defaultAffiliatePlatforms();
  return rows
    .filter((p) => p.enabled)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function allAffiliatePlatforms(
  platforms?: AffiliatePlatformConfig[] | null,
): AffiliatePlatformConfig[] {
  const rows = platforms?.length ? [...platforms] : defaultAffiliatePlatforms();
  return [...rows].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function matchPlatformByUrl(
  rawUrl: string,
  platforms?: AffiliatePlatformConfig[] | null,
): AffiliatePlatformConfig | undefined {
  try {
    const host = new URL(rawUrl.trim()).hostname.toLowerCase();
    const rows = allAffiliatePlatforms(platforms).filter((p) => p.domainPattern.trim());
    return rows.find((p) => host.includes(p.domainPattern.trim().toLowerCase()));
  } catch {
    return undefined;
  }
}

export function resolveProductAffiliatePlatform(
  product: Product,
  settings?: Partial<StoreSettings> | null,
): AffiliatePlatformConfig | undefined {
  const platforms = allAffiliatePlatforms(settings?.affiliatePlatforms);
  if (product.affiliatePlatformId) {
    const picked = platforms.find((p) => p.id === product.affiliatePlatformId);
    if (picked) return picked;
  }
  if (product.affiliateUrl) {
    return matchPlatformByUrl(product.affiliateUrl, platforms);
  }
  return undefined;
}

export function applyPlatformAffiliateParams(
  rawUrl: string,
  platform?: AffiliatePlatformConfig | null,
): string {
  if (!platform) return rawUrl.trim();
  const param = platform.affiliateParamName?.trim();
  const value = platform.affiliateParamValue?.trim();
  if (!param || !value) return rawUrl.trim();
  try {
    const url = new URL(rawUrl.trim());
    url.searchParams.set(param, value);
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

export function amazonTagFromSettings(settings?: Partial<StoreSettings> | null): string | undefined {
  const platforms = allAffiliatePlatforms(settings?.affiliatePlatforms);
  const amazon = platforms.find((p) => p.id === 'amazon-in' || p.domainPattern.includes('amazon.in'));
  const fromPlatform = amazon?.affiliateParamValue?.trim();
  if (fromPlatform) return fromPlatform;
  return settings?.amazonAffiliateTag?.trim() || undefined;
}

export function formatProductPrice(price: number, currency?: string | null): string {
  const cur = currency?.trim().toUpperCase();
  if (cur === 'INR') return `₹${price.toLocaleString('en-IN')}`;
  if (cur === 'EUR') return `€${price.toFixed(2)}`;
  if (cur === 'GBP') return `£${price.toFixed(2)}`;
  if (cur === 'USD') return `$${price.toFixed(2)}`;
  if (price >= 200 && Number.isInteger(price)) return `₹${price.toLocaleString('en-IN')}`;
  return `$${price.toFixed(2)}`;
}

export function affiliatePlatformButtonLabel(
  product: Product,
  settings?: Partial<StoreSettings> | null,
): string {
  const custom = product.affiliateButtonLabel?.trim();
  if (custom) return custom;
  const platform = resolveProductAffiliatePlatform(product, settings);
  if (platform?.buttonLabel?.trim()) return platform.buttonLabel.trim();
  const vendor = product.affiliateVendor?.trim();
  if (vendor) return `Buy on ${vendor}`;
  return 'Shop now';
}

export function truncateDescription(text: string, max = 280): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}
