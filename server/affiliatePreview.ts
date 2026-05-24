/** Best-effort product metadata from partner pages (Amazon.in optimized). */

export interface AffiliatePreviewResult {
  name: string;
  description: string;
  imageUrl: string;
  price?: number;
  compareAtPrice?: number;
  vendor: string;
  sourceUrl: string;
  /** ISO-ish currency when detected (e.g. INR, USD). */
  currency?: string;
  /** Amazon ASIN when applicable. */
  asin?: string;
  rating?: number;
  reviewCount?: number;
  platformId?: string;
}

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 2_000_000;

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function decodeEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/\\u0026/g, '&')
    .trim();
}

function metaContent(html: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return undefined;
}

function titleFromHtml(html: string): string | undefined {
  const og = metaContent(html, 'og:title') ?? metaContent(html, 'twitter:title');
  if (og) return cleanAmazonTitle(og);
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? cleanAmazonTitle(decodeEntities(match[1])) : undefined;
}

function cleanAmazonTitle(raw: string): string {
  return raw
    .replace(/\s*:\s*Amazon\.(in|com|co\.uk|de|fr|ca|com\.au)[^:]*$/i, '')
    .replace(/\s*:\s*Buy[^:]*Online at Low Prices in India[^:]*$/i, '')
    .replace(/\s*-\s*Amazon\.in\s*$/i, '')
    .trim();
}

function parsePrice(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function isAmazonHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.includes('amazon.') || h === 'amzn.to' || h === 'a.co' || h.endsWith('.amzn.to');
}

function isShortLinkHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === 'amzn.to' || h === 'a.co' || h.endsWith('.amzn.to');
}

function extractAmazonAsin(url: URL): string | undefined {
  const path = url.pathname;
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
  ];
  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }
  const asinParam = url.searchParams.get('asin');
  if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) return asinParam.toUpperCase();
  return undefined;
}

function amazonStorefrontOnly(url: URL): boolean {
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (extractAmazonAsin(url)) return false;
  return (
    path === '/' ||
    path === '' ||
    path.startsWith('/s') ||
    path.startsWith('/stores') ||
    path.startsWith('/b') ||
    path.startsWith('/gp/browse') ||
    path.startsWith('/gp/goldbox') ||
    path.startsWith('/deals')
  );
}

function assertAmazonProductUrl(url: URL, afterRedirect: boolean): void {
  if (!isAmazonHost(url.hostname)) return;
  if (isShortLinkHost(url.hostname)) return;
  if (extractAmazonAsin(url)) return;

  if (amazonStorefrontOnly(url)) {
    throw new Error(
      'This is an Amazon homepage or category page — not a product link. Open the product on Amazon, then copy the URL from the address bar. It must contain /dp/ and a 10-character code (ASIN). Example: https://www.amazon.in/dp/B0D8TMGYRQ?tag=aaravitech-21',
    );
  }

  if (afterRedirect) {
    throw new Error(
      'Could not find a product on this Amazon link. Use a direct product URL like https://www.amazon.in/dp/B0D8TMGYRQ?tag=aaravitech-21',
    );
  }
}

function amazonBaseFromHost(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, '');
  if (h.includes('amazon.in')) return 'https://www.amazon.in';
  if (h.includes('amazon.com')) return 'https://www.amazon.com';
  if (h.includes('amazon.co.uk')) return 'https://www.amazon.co.uk';
  if (h.includes('amazon.de')) return 'https://www.amazon.de';
  return `https://www.${h}`;
}

/** Clean affiliate URL — keeps tag, drops tracking noise. */
function normalizeAmazonAffiliateUrl(original: URL, final: URL, tagOverride?: string): string {
  const asin = extractAmazonAsin(final) ?? extractAmazonAsin(original);
  if (!asin) return final.toString();

  const tag =
    tagOverride?.trim() ||
    original.searchParams.get('tag') ||
    final.searchParams.get('tag') ||
    undefined;
  const base = amazonBaseFromHost(final.hostname);
  const clean = new URL(`${base}/dp/${asin}`);
  if (tag) clean.searchParams.set('tag', tag);
  return clean.toString();
}

function parseAmazonHtml(html: string): {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  compareAtPrice?: number;
  currency?: string;
  asin?: string;
  rating?: number;
  reviewCount?: number;
} {
  let name =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, '') ??
    html.match(/id="productTitle"[^>]*>([^<]+)/i)?.[1] ??
    titleFromHtml(html);

  if (name) name = decodeEntities(name.replace(/\s+/g, ' ').trim());

  let imageUrl =
    metaContent(html, 'og:image') ??
    html.match(/"landingImageUrl"\s*:\s*"([^"]+)"/)?.[1] ??
    html.match(/"hiRes"\s*:\s*"([^"]+)"/)?.[1] ??
    html.match(/"large"\s*:\s*"([^"]+)"/)?.[1];

  if (imageUrl) imageUrl = decodeEntities(imageUrl);

  let price: number | undefined;
  let compareAtPrice: number | undefined;
  let currency: string | undefined;

  const buyboxMatch = html.match(
    /"priceAmount"\s*:\s*([\d.]+)[^}]*"currencySymbol"\s*:\s*"([^"]+)"/,
  );
  if (buyboxMatch) {
    price = Number.parseFloat(buyboxMatch[1]);
    currency = buyboxMatch[2] === '₹' ? 'INR' : buyboxMatch[2];
  } else {
    const amountOnly = html.match(/"priceAmount"\s*:\s*([\d.]+)/);
    if (amountOnly) {
      price = Number.parseFloat(amountOnly[1]);
      currency = html.includes('amazon.in') || html.includes('₹') ? 'INR' : undefined;
    }
  }

  const basisMatch = html.match(/"basisPrice"\s*:\s*\{[^}]*"priceAmount"\s*:\s*([\d.]+)/);
  if (basisMatch) compareAtPrice = Number.parseFloat(basisMatch[1]);

  if (!price) {
    price =
      parsePrice(metaContent(html, 'product:price:amount')) ??
      parsePrice(metaContent(html, 'og:price:amount'));
  }

  let description =
    metaContent(html, 'og:description') ??
    metaContent(html, 'description') ??
    '';

  const bullets: string[] = [];
  const bulletRegex = /<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>\s*([^<]+)/gi;
  let bulletMatch: RegExpExecArray | null;
  while ((bulletMatch = bulletRegex.exec(html)) && bullets.length < 4) {
    const text = decodeEntities(bulletMatch[1].trim());
    if (text.length > 15 && !text.startsWith('›')) bullets.push(text);
  }
  if (bullets.length) description = bullets.join(' ');

  const productDesc = html.match(/id="productDescription"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (productDesc && !description) {
    description = decodeEntities(productDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  }

  const asin =
    html.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/i)?.[1]?.toUpperCase() ??
    html.match(/ASIN[^A-Z0-9]*([A-Z0-9]{10})/i)?.[1]?.toUpperCase();

  let rating: number | undefined;
  let reviewCount: number | undefined;

  const ratingMatch =
    html.match(/"averageStarRating"\s*:\s*([\d.]+)/) ??
    html.match(/"rating"\s*:\s*([\d.]+)/) ??
    html.match(/(\d+\.?\d*)\s+out of\s+5\s+stars/i);
  if (ratingMatch?.[1]) {
    const r = Number.parseFloat(ratingMatch[1]);
    if (Number.isFinite(r) && r >= 0 && r <= 5) rating = r;
  }

  const reviewMatch =
    html.match(/"totalReviewCount"\s*:\s*(\d+)/) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/) ??
    html.match(/([\d,]+)\s+(?:global\s+)?ratings/i);
  if (reviewMatch?.[1]) {
    const c = Number.parseInt(reviewMatch[1].replace(/,/g, ''), 10);
    if (Number.isFinite(c) && c >= 0) reviewCount = c;
  }

  return { name, description, imageUrl, price, compareAtPrice, currency, asin, rating, reviewCount };
}

function platformIdFromHost(hostname: string): string | undefined {
  const host = hostname.toLowerCase();
  if (host.includes('amazon.in')) return 'amazon-in';
  if (host.includes('amazon.com')) return 'amazon-com';
  if (host.includes('flipkart.')) return 'flipkart';
  if (host.includes('myntra.')) return 'myntra';
  if (host.includes('meesho.')) return 'meesho';
  return undefined;
}

function detectVendor(hostname: string): string {
  const host = hostname.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/amazon\./, 'Amazon'],
    [/flipkart\./, 'Flipkart'],
    [/etsy\./, 'Etsy'],
    [/ebay\./, 'eBay'],
    [/walmart\./, 'Walmart'],
    [/target\./, 'Target'],
    [/myntra\./, 'Myntra'],
    [/ajio\./, 'Ajio'],
    [/meesho\./, 'Meesho'],
    [/shopify\./, 'Shopify'],
  ];
  for (const [pattern, label] of map) {
    if (pattern.test(host)) return label;
  }
  const base = host.replace(/^www\./, '').split('.')[0] ?? host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function assertSafeUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error('Enter a valid URL starting with https://');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported');
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.endsWith('.local')) {
    throw new Error('Local URLs cannot be imported');
  }
  return parsed;
}

export async function fetchAffiliatePreview(
  rawUrl: string,
  options?: { amazonAffiliateTag?: string },
): Promise<AffiliatePreviewResult> {
  const original = assertSafeUrl(rawUrl);
  assertAmazonProductUrl(original, false);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html = '';
  let finalUrl = original;

  try {
    const res = await fetch(original.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (res.url) {
      try {
        finalUrl = new URL(res.url);
      } catch {
        finalUrl = original;
      }
    }

    assertAmazonProductUrl(finalUrl, true);

    if (!res.ok) {
      throw new Error(
        `Amazon returned ${res.status}. Try the clean product URL: https://www.amazon.in/dp/PRODUCT_ASIN?tag=aaravitech-21`,
      );
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      throw new Error('Partner page is too large to import automatically');
    }
    html = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Import timed out — try again or enter details manually');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const vendor = detectVendor(finalUrl.hostname);
  const isAmazon = isAmazonHost(finalUrl.hostname);

  let name = '';
  let description = '';
  let imageUrl = '';
  let price: number | undefined;
  let compareAtPrice: number | undefined;
  let currency: string | undefined;
  let asin: string | undefined;
  let rating: number | undefined;
  let reviewCount: number | undefined;

  if (isAmazon) {
    const amazon = parseAmazonHtml(html);
    name = amazon.name ?? '';
    description = amazon.description ?? '';
    imageUrl = amazon.imageUrl ?? '';
    price = amazon.price;
    compareAtPrice = amazon.compareAtPrice;
    currency = amazon.currency;
    asin = extractAmazonAsin(finalUrl) ?? amazon.asin;
    rating = amazon.rating;
    reviewCount = amazon.reviewCount;
  } else {
    name = titleFromHtml(html) ?? metaContent(html, 'title') ?? '';
    description =
      metaContent(html, 'og:description') ??
      metaContent(html, 'twitter:description') ??
      metaContent(html, 'description') ??
      '';
    imageUrl = metaContent(html, 'og:image') ?? metaContent(html, 'twitter:image') ?? '';
    price =
      parsePrice(metaContent(html, 'product:price:amount')) ??
      parsePrice(metaContent(html, 'og:price:amount')) ??
      parsePrice(metaContent(html, 'product:price'));
    compareAtPrice = parsePrice(metaContent(html, 'product:original_price:amount'));
  }

  const blocked =
    html.includes('Robot Check') ||
    html.includes('api-services-support@amazon.com') ||
    html.includes('Enter the characters you see below');

  if (blocked) {
    throw new Error(
      'Amazon blocked automated import (captcha). Paste the clean product URL and fill details manually, or try again later.',
    );
  }

  if (!name && !description && !imageUrl && price == null) {
    throw new Error(
      'Could not read product details from this link. Use a direct product URL with /dp/ASIN — not the Amazon homepage. Example: https://www.amazon.in/dp/B0D8TMGYRQ?tag=aaravitech-21',
    );
  }

  const sourceUrl = isAmazon
    ? normalizeAmazonAffiliateUrl(original, finalUrl, options?.amazonAffiliateTag)
    : finalUrl.toString();

  return {
    name: name || 'Imported partner product',
    description: description || `Curated pick from ${vendor}.`,
    imageUrl: imageUrl ?? '',
    price,
    compareAtPrice,
    vendor,
    sourceUrl,
    currency,
    asin,
    rating,
    reviewCount,
    platformId: platformIdFromHost(finalUrl.hostname),
  };
}
