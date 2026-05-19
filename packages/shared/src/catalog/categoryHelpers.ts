import type { Category } from '../types';

/** Produce a conservative URL-safe slug (ASCII-ish). Prefer storing explicit `slug` on categories for localized names. */
export function slugifyCategoryName(raw: string): string {
  const s = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'category';
}

/** Public slug displayed in `/shop?category=` */
export function resolveCategorySlug(cat: Pick<Category, 'name' | 'slug'>): string {
  const manual = cat.slug?.trim();
  if (manual) return manual;
  return slugifyCategoryName(cat.name);
}

function ensureUniqueOrderedSlugs(categories: Category[]): Category[] {
  const used = new Set<string>();
  return categories.map((c) => {
    let slug = resolveCategorySlug(c);
    let candidate = slug;
    let i = 2;
    while (used.has(candidate)) {
      candidate = `${slug}-${i++}`;
    }
    used.add(candidate);
    return { ...c, slug: candidate };
  });
}

/** Normalize category records from API / seed (ordering, slug stability, storefront visibility default). */
export function hydrateCategories(input: Category[] | unknown): Category[] {
  const list = Array.isArray(input) ? (input as Category[]) : [];
  if (!list.length) return [];

  const normalized = [...list].map((c, idx) => {
    const sortOrder = typeof c.sortOrder === 'number' && Number.isFinite(c.sortOrder) ? c.sortOrder : idx;
    return {
      ...c,
      name: typeof c.name === 'string' ? c.name : 'Untitled',
      description: typeof c.description === 'string' ? c.description : '',
      image: typeof c.image === 'string' ? c.image : undefined,
      sortOrder,
      published: c.published !== false,
    } satisfies Category;
  });

  normalized.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const withSlug = normalized.map((c) => ({
    ...c,
    slug: resolveCategorySlug({ name: c.name, slug: c.slug }),
  }));

  return ensureUniqueOrderedSlugs(withSlug);
}
