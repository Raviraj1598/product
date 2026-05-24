import type { Category } from '../types';
import { resolveCategorySlug } from './categoryHelpers';

/** Homepage “Collection spotlight” carousel — configured in Admin → Configuration → Homepage. */
export interface HomepageCollectionSpotlight {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  /** Ordered category IDs to feature. Empty = auto-pick published categories. */
  categoryIds: string[];
  /** Seconds between slides; 0 disables autoplay. */
  autoplaySeconds: number;
  slideSubtitle: string;
  buttonLabel: string;
}

export type ResolvedSpotlightSlide = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  shopHref: string;
  buttonLabel: string;
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&q=80&fit=crop',
  'https://images.unsplash.com/photo-1549465220-1a8b923823cd?w=900&q=80&fit=crop',
  'https://images.unsplash.com/photo-1512909006721-3d0158887362?w=900&q=80&fit=crop',
  'https://images.unsplash.com/photo-1607083206869-4c7672f72a7a?w=900&q=80&fit=crop',
];

export function defaultHomepageCollectionSpotlight(): HomepageCollectionSpotlight {
  return {
    enabled: true,
    eyebrow: 'Collection spotlight',
    title: 'Shop by category',
    description: 'Browse curated aisles—each collection links straight to the storefront shop filter.',
    categoryIds: [],
    autoplaySeconds: 6,
    slideSubtitle: 'Collection spotlight',
    buttonLabel: 'Explore collection',
  };
}

export function resolveHomepageSpotlightSlides(
  spotlight: HomepageCollectionSpotlight,
  categories: Category[],
): ResolvedSpotlightSlide[] {
  if (!spotlight.enabled) return [];

  const visible = categories.filter((c) => c.published !== false);

  let picked: Category[];
  const manualIds = spotlight.categoryIds.filter(Boolean);
  if (manualIds.length > 0) {
    picked = manualIds
      .map((id) => visible.find((c) => c.id === id) ?? categories.find((c) => c.id === id))
      .filter((c): c is Category => !!c);
  } else {
    picked = [...visible]
      .filter((c) => c.image?.trim() || c.description?.trim())
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  if (picked.length === 0) {
    picked = [...visible].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).slice(0, 4);
  }

  return picked.map((c, idx) => ({
    id: c.id,
    categoryId: c.id,
    title: c.name,
    subtitle: spotlight.slideSubtitle?.trim() || 'Collection spotlight',
    description: c.description?.trim() || `Browse ${c.name} on the shop.`,
    image: c.image?.trim() || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
    shopHref: `/shop?category=${encodeURIComponent(resolveCategorySlug(c))}`,
    buttonLabel: spotlight.buttonLabel?.trim() || 'Explore collection',
  }));
}
