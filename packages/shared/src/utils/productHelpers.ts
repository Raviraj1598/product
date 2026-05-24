import type { Product, StoreSettings } from '../types';
import {
  applyPlatformAffiliateParams,
  amazonTagFromSettings,
  affiliatePlatformButtonLabel,
  resolveProductAffiliatePlatform,
} from '../catalog/affiliatePlatforms';
import { applyAmazonAffiliateTag } from './affiliateUrl';

export type ProductPurchaseMode = 'internal' | 'affiliate';

/** True when the product should link out instead of using cart/checkout. */
export function isAffiliateProduct(product: Product): boolean {
  return product.purchaseMode === 'affiliate' && Boolean(product.affiliateUrl?.trim());
}

export function resolvePurchaseMode(product: Product): ProductPurchaseMode {
  return isAffiliateProduct(product) ? 'affiliate' : 'internal';
}

export function getAffiliateHref(
  product: Product,
  settings?: Partial<StoreSettings> | null,
): string | undefined {
  const url = product.affiliateUrl?.trim();
  if (!url) return undefined;
  const platform = resolveProductAffiliatePlatform(product, settings);
  if (platform) return applyPlatformAffiliateParams(url, platform);
  return applyAmazonAffiliateTag(url, amazonTagFromSettings(settings));
}

export function affiliateButtonLabel(
  product: Product,
  settings?: Partial<StoreSettings> | null,
): string {
  return affiliatePlatformButtonLabel(product, settings);
}

export const AFFILIATE_LINK_REL = 'noopener noreferrer sponsored nofollow';
