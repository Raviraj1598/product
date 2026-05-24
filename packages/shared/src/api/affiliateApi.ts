import type { AffiliateReferral } from '../types';

declare const __ADMIN_BUILD__: boolean;

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

function isAdminClient(): boolean {
  return typeof __ADMIN_BUILD__ !== 'undefined' && __ADMIN_BUILD__ === true;
}

function adminHeaders(): Record<string, string> {
  const token = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;
  if (token) return { 'x-admin-token': token };
  return {};
}

export interface AffiliatePreviewResult {
  name: string;
  description: string;
  imageUrl: string;
  price?: number;
  compareAtPrice?: number;
  vendor: string;
  sourceUrl: string;
  currency?: string;
  asin?: string;
  rating?: number;
  reviewCount?: number;
  platformId?: string;
}

export async function fetchAffiliatePreview(
  url: string,
  opts?: { amazonAffiliateTag?: string },
): Promise<AffiliatePreviewResult> {
  const res = await fetch(`${apiBase()}/api/admin/affiliate/preview`, {
    method: 'POST',
    credentials: isAdminClient() ? 'include' : 'omit',
    headers: { 'Content-Type': 'application/json', ...adminHeaders() },
    body: JSON.stringify({ url, amazonAffiliateTag: opts?.amazonAffiliateTag }),
  });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  const body = (await res.json()) as AffiliatePreviewResult & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Import failed (${res.status})`);
  return body;
}

export type RecordAffiliateClickInput = {
  productId: string;
  productName: string;
  platformId?: string;
  platformName?: string;
  destinationUrl: string;
};

/** Fire-and-forget outbound affiliate click (partner checkout happens off-site). */
export function recordAffiliateClick(input: RecordAffiliateClickInput): void {
  const body = JSON.stringify(input);
  void fetch(`${apiBase()}/api/store/affiliate-click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    /* non-blocking */
  });
}

export type { AffiliateReferral };
