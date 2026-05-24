import type { BuiltPage, StoreSettings, StorefrontNavLink } from '../types';
import {
  defaultFooterLegalLinks,
  defaultFooterMiddleLinks,
} from '../catalog/storeSettings';
import { dedupeBuiltPagesBySlug } from './normalizeBuiltPages';
import { DEFAULT_PAGE_SLUGS, defaultBuiltPages } from './defaultBuiltPages';

/** Add any missing standard CMS pages without overwriting custom slugs. */
export function ensureDefaultBuiltPages(existing: BuiltPage[]): BuiltPage[] {
  const defaults = defaultBuiltPages();
  const bySlug = new Map(existing.map((p) => [p.slug, p]));
  for (const page of defaults) {
    if (!bySlug.has(page.slug)) {
      bySlug.set(page.slug, page);
    }
  }
  return dedupeBuiltPagesBySlug([...bySlug.values()]);
}

function isLegacyAdminFooter(links: StorefrontNavLink[]): boolean {
  return links.length > 0 && links.every((l) => l.openInAdmin);
}

function patchLegalLinks(links: StorefrontNavLink[]): StorefrontNavLink[] {
  const mapHref: Record<string, string> = {
    leg_privacy: '/p/privacy',
    leg_terms: '/p/terms',
    leg_affiliate: '/p/affiliate-disclosure',
  };
  return links.map((l) => (mapHref[l.id] && l.href === '/shop' ? { ...l, href: mapHref[l.id] } : l));
}

/** Ensure footer links point at CMS pages for new installs and legacy configs. */
export function ensureStoreNavDefaults(settings: StoreSettings): StoreSettings {
  let footerMiddleLinks = settings.footerMiddleLinks;
  if (isLegacyAdminFooter(footerMiddleLinks)) {
    footerMiddleLinks = defaultFooterMiddleLinks();
  } else {
    const hrefs = new Set(footerMiddleLinks.map((l) => l.href));
    const merged = [...footerMiddleLinks];
    for (const link of defaultFooterMiddleLinks()) {
      if (!hrefs.has(link.href)) merged.push(link);
    }
    footerMiddleLinks = merged;
  }

  const footerLegalLinks = patchLegalLinks(settings.footerLegalLinks);

  const changed =
    footerMiddleLinks !== settings.footerMiddleLinks ||
    footerLegalLinks !== settings.footerLegalLinks;

  if (!changed) return settings;

  return {
    ...settings,
    footerMiddleColumnTitle:
      settings.footerMiddleColumnTitle === 'Manage' ? 'Help & info' : settings.footerMiddleColumnTitle,
    footerMiddleLinks,
    footerLegalLinks,
  };
}

export function catalogNeedsDefaultSeed(pages: BuiltPage[], settings: StoreSettings): boolean {
  const slugs = new Set(pages.map((p) => p.slug));
  const missingPage = DEFAULT_PAGE_SLUGS.some((s) => !slugs.has(s));
  const legacyFooter = isLegacyAdminFooter(settings.footerMiddleLinks);
  const legalOnShop = settings.footerLegalLinks.some(
    (l) => l.id === 'leg_privacy' && l.href === '/shop',
  );
  return missingPage || legacyFooter || legalOnShop;
}
