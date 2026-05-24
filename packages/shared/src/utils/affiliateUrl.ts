/** Append or replace Amazon Associates `tag` on product URLs. */

export function isAmazonUrl(raw: string): boolean {
  try {
    return new URL(raw.trim()).hostname.toLowerCase().includes('amazon.');
  } catch {
    return false;
  }
}

/** Apply store-wide Amazon affiliate tag when the URL is an Amazon product link. */
export function applyAmazonAffiliateTag(rawUrl: string, tag?: string | null): string {
  const affiliateTag = tag?.trim();
  if (!affiliateTag) return rawUrl.trim();

  try {
    const url = new URL(rawUrl.trim());
    if (!url.hostname.toLowerCase().includes('amazon.')) return rawUrl.trim();
    url.searchParams.set('tag', affiliateTag);
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}
