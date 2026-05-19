import {
  slugifyCategoryName,
  resolveCategorySlug,
  type Category,
  type Product,
} from '@boutique/shared';

export type ShopCategoryFilter =
  | { mode: 'all' }
  | { mode: 'one'; categoryName: string };

function normalizeSlugParam(raw: string): string {
  const trimmed = raw.trim();
  try {
    return decodeURIComponent(trimmed).trim();
  } catch {
    return trimmed;
  }
}

/** Match storefront `?category=` against catalog rows then fallback to product aisle names. */
export function resolveShopCategoryFilter(opts: {
  categoryParam: string | null | undefined;
  publishedCategories: Category[];
  allCategories: Category[];
  products: Product[];
}): ShopCategoryFilter {
  const raw = opts.categoryParam?.trim();
  if (!raw) return { mode: 'all' };
  const needle = normalizeSlugParam(raw);

  const tryPick = (list: Category[]): Category | undefined =>
    list.find((c) => resolveCategorySlug(c) === needle) ||
    list.find((c) => c.name === needle) ||
    list.find((c) => slugifyCategoryName(c.name) === needle);

  const publishHit = tryPick(opts.publishedCategories);
  if (publishHit) return { mode: 'one', categoryName: publishHit.name };

  /** Deep links still work even if an admin hides a category temporarily. */
  const anyCat = tryPick(opts.allCategories);
  if (anyCat) return { mode: 'one', categoryName: anyCat.name };

  const distinctAisles = [...new Set(opts.products.map((p) => p.category.trim()).filter(Boolean))];
  const orphanMatch = distinctAisles.find(
    (name) =>
      name === needle ||
      slugifyCategoryName(name) === needle ||
      resolveCategorySlug({ name }) === needle,
  );
  if (orphanMatch) return { mode: 'one', categoryName: orphanMatch };

  return { mode: 'all' };
}

export function shopSearch(
  existing: URLSearchParams,
  patch: Partial<{ category: string | null }>,
): string {
  const next = new URLSearchParams(existing);
  if ('category' in patch) {
    const v = patch.category;
    if (v === null || v === '') next.delete('category');
    else if (typeof v === 'string') next.set('category', v);
  }
  const qs = next.toString();
  return qs ? `?${qs}` : '';
}

/** Omit generic `/shop` header rows when catalogue categories drive the navbar. */
export function isBareShopHref(href: string): boolean {
  const base = href.split('?')[0].trim().toLowerCase();
  return base === '/shop' || base === 'shop' || base === '/shop/' || base === 'shop/';
}
