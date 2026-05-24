import type {
  CheckoutPaymentGateway,
  PaymentMethodConfig,
  ShippingMethodConfig,
  StorefrontNavLink,
  StoreSettings,
  StoreSocialLink,
  StoreThemeTokens,
} from '../types';
import { defaultAffiliatePlatforms } from './affiliatePlatforms';
import { defaultAdminPanelSettings } from './adminPanelSettings';
import { defaultHomepageCollectionSpotlight } from './homepageSpotlight';

export function defaultThemeTokens(): StoreThemeTokens {
  return {
    primary: '#6B2D8C',
    accent: '#E8725C',
    surface: '#FEF7F3',
    bandDark: '#2D1B4E',
    pageBackground: '#ffffff',
    foreground: '#2D1B4E',
    border: 'rgba(45, 27, 78, 0.12)',
    radius: 'lg',
  };
}

export function defaultShippingMethods(): ShippingMethodConfig[] {
  return [
    {
      id: 'standard',
      label: 'Standard · 5–7 business days',
      amount: 10,
      qualifyForFreeShippingTier: true,
    },
    {
      id: 'express',
      label: 'Express · 2–3 business days',
      amount: 25,
      qualifyForFreeShippingTier: false,
    },
  ];
}

export function defaultPaymentMethods(): PaymentMethodConfig[] {
  return [
    {
      id: 'cod',
      label: 'Cash / card on delivery (COD)',
      enabled: true,
    },
    {
      id: 'stripe_sandbox_placeholder',
      label: 'Pay online · Stripe-ready (sandbox placeholder)',
      enabled: false,
    },
    {
      id: 'card_collect_demo',
      label: 'Debit / credit collected at warehouse (demo form)',
      enabled: false,
    },
  ];
}

export function defaultHeaderNavLinks(): StorefrontNavLink[] {
  return [
    { id: 'hdr_her', label: 'For Her', href: '/shop' },
    { id: 'hdr_him', label: 'For Him', href: '/shop' },
    { id: 'hdr_bday', label: 'Birthdays', href: '/shop' },
    { id: 'hdr_occasions', label: 'Occasions', href: '/shop' },
    { id: 'hdr_under50', label: 'Under $50', href: '/shop' },
    { id: 'hdr_deals', label: 'Deals', href: '/shop', variant: 'cta' },
    { id: 'hdr_admin', label: 'Admin', href: '/', openInAdmin: true },
  ];
}

export function defaultFooterShopLinks(): StorefrontNavLink[] {
  return [
    { id: 'ft_all', label: 'All gifts', href: '/shop' },
    { id: 'ft_her', label: 'For Her', href: '/shop' },
    { id: 'ft_him', label: 'For Him', href: '/shop' },
    { id: 'ft_occasions', label: 'Occasions', href: '/shop' },
  ];
}

export function defaultFooterMiddleLinks(): StorefrontNavLink[] {
  return [
    { id: 'ft_about', label: 'About us', href: '/p/about' },
    { id: 'ft_contact', label: 'Contact', href: '/p/contact' },
    { id: 'ft_faq', label: 'FAQ', href: '/p/faq' },
    { id: 'ft_shipping', label: 'Shipping & returns', href: '/p/shipping' },
  ];
}

export function defaultFooterSocialLinks(): StoreSocialLink[] {
  return [
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'twitter', url: '' },
    { platform: 'youtube', url: '' },
  ];
}

export function defaultFooterLegalLinks(): StorefrontNavLink[] {
  return [
    { id: 'leg_privacy', label: 'Privacy', href: '/p/privacy' },
    { id: 'leg_terms', label: 'Terms', href: '/p/terms' },
    { id: 'leg_affiliate', label: 'Affiliate disclosure', href: '/p/affiliate-disclosure' },
  ];
}

export const defaultStoreSettings: StoreSettings = {
  siteName: 'GiftJoy',
  storefrontTitle: 'Curated gifts for every moment',
  storefrontSubtitle:
    'Handpicked presents for birthdays, anniversaries, and celebrations—shop our own collection or discover partner picks via affiliate links.',
  footerText: '© 2026 GiftJoy. All rights reserved.',
  announcementBar: 'Free gift wrap on orders $50+ • Curated affiliate picks • Same-day dispatch on in-stock items',
  freeShippingMin: 50,
  shippingFlatRate: 10,
  taxPercent: 10,
  productPolicyLines: [
    '30-day return policy on in-store items.',
    'Affiliate partner purchases follow the partner store return policy.',
  ],
  shippingMethods: defaultShippingMethods(),
  paymentMethods: defaultPaymentMethods(),
  theme: defaultThemeTokens(),
  headerTagline: 'Thoughtful gifting',
  headerLogoGlyph: 'G',
  affiliateDisclosure:
    'As an affiliate, we may earn a commission when you purchase through our links—at no extra cost to you.',
  amazonAffiliateTag: 'aaravitech-21',
  affiliatePlatforms: defaultAffiliatePlatforms(),
  headerNavLinks: defaultHeaderNavLinks(),
  footerBrandBlurb:
    'Curated gift ideas for every occasion. Mix in-house favourites with trusted partner picks—all in one place.',
  footerShopColumnTitle: 'Shop',
  footerShopLinks: defaultFooterShopLinks(),
  footerMiddleColumnTitle: 'Help & info',
  footerMiddleLinks: defaultFooterMiddleLinks(),
  footerContactColumnTitle: 'Contact',
  footerContactAddress: 'Serving gift lovers worldwide • GiftJoy HQ',
  footerContactPhone: '+1 (555) 010-9988',
  footerContactEmail: 'hello@giftjoy.example.com',
  footerSocialLinks: defaultFooterSocialLinks(),
  footerLegalLinks: defaultFooterLegalLinks(),
  homepageCollectionSpotlight: defaultHomepageCollectionSpotlight(),
  adminPanel: defaultAdminPanelSettings(),
};

export function mergeStoreSettings(partial?: Partial<StoreSettings> | null): StoreSettings {
  const base = defaultStoreSettings;
  const theme = { ...defaultThemeTokens(), ...(partial?.theme ?? {}) };
  const shippingMethods =
    partial?.shippingMethods !== undefined
      ? [...partial.shippingMethods]
      : [...defaultShippingMethods()];
  const paymentMethods =
    partial?.paymentMethods !== undefined
      ? [...partial.paymentMethods]
      : [...defaultPaymentMethods()];
  const headerNavLinks =
    partial?.headerNavLinks !== undefined
      ? [...partial.headerNavLinks]
      : [...defaultHeaderNavLinks()];
  const footerShopLinks =
    partial?.footerShopLinks !== undefined
      ? [...partial.footerShopLinks]
      : [...defaultFooterShopLinks()];
  const footerMiddleLinks =
    partial?.footerMiddleLinks !== undefined
      ? [...partial.footerMiddleLinks]
      : [...defaultFooterMiddleLinks()];
  const footerSocialLinks =
    partial?.footerSocialLinks !== undefined
      ? [...partial.footerSocialLinks]
      : [...defaultFooterSocialLinks()];
  const footerLegalLinks =
    partial?.footerLegalLinks !== undefined
      ? [...partial.footerLegalLinks]
      : [...defaultFooterLegalLinks()];
  const affiliatePlatforms =
    partial?.affiliatePlatforms !== undefined
      ? [...partial.affiliatePlatforms]
      : [...defaultAffiliatePlatforms()];
  const adminPanel = {
    ...defaultAdminPanelSettings(),
    ...(partial?.adminPanel ?? {}),
  };
  const homepageCollectionSpotlight = {
    ...defaultHomepageCollectionSpotlight(),
    ...(partial?.homepageCollectionSpotlight ?? {}),
    categoryIds:
      partial?.homepageCollectionSpotlight?.categoryIds !== undefined
        ? [...partial.homepageCollectionSpotlight.categoryIds]
        : defaultHomepageCollectionSpotlight().categoryIds,
  };

  return {
    ...base,
    ...partial,
    productPolicyLines:
      partial?.productPolicyLines !== undefined && partial.productPolicyLines.length > 0
        ? [...partial.productPolicyLines]
        : [...base.productPolicyLines],
    theme,
    shippingMethods,
    paymentMethods,
    headerNavLinks,
    footerShopLinks,
    footerMiddleLinks,
    footerSocialLinks,
    footerLegalLinks,
    stripePublishableKey:
      partial?.stripePublishableKey !== undefined ? partial.stripePublishableKey : base.stripePublishableKey,
    headerLogoUrl:
      partial?.headerLogoUrl !== undefined ? partial.headerLogoUrl : base.headerLogoUrl,
    headerLogoDesign:
      partial?.headerLogoDesign !== undefined ? partial.headerLogoDesign : base.headerLogoDesign,
    affiliateDisclosure:
      partial?.affiliateDisclosure !== undefined ? partial.affiliateDisclosure : base.affiliateDisclosure,
    amazonAffiliateTag:
      partial?.amazonAffiliateTag !== undefined ? partial.amazonAffiliateTag : base.amazonAffiliateTag,
    affiliatePlatforms,
    adminPanel,
    homepageCollectionSpotlight,
  };
}

/** Apply storefront appearance tokens onto :root (+ legacy aliases). */
export function applyStoreTheme(theme: StoreThemeTokens) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const radiusPx: Record<StoreThemeTokens['radius'], string> = {
    none: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  };
  root.style.setProperty('--boutique-primary', theme.primary);
  root.style.setProperty('--boutique-accent', theme.accent);
  root.style.setProperty('--boutique-surface', theme.surface);
  root.style.setProperty('--boutique-band-dark', theme.bandDark);
  root.style.setProperty('--boutique-page-bg', theme.pageBackground);
  root.style.setProperty('--boutique-foreground', theme.foreground);
  root.style.setProperty('--boutique-border', theme.border);
  root.style.setProperty('--boutique-radius', radiusPx[theme.radius] ?? radiusPx.md);
  /** Legacy fashion tokens referenced across components */
  root.style.setProperty('--luxury-maroon', theme.primary);
  root.style.setProperty('--luxury-gold', theme.accent);
  root.style.setProperty('--luxury-cream', theme.surface);
  root.style.setProperty('--luxury-black', theme.bandDark);
  root.style.setProperty('--luxury-red', theme.accent);
}

export function coercePaymentGateway(raw: unknown): CheckoutPaymentGateway {
  if (
    raw === 'cod' ||
    raw === 'stripe_sandbox_placeholder' ||
    raw === 'card_collect_demo'
  ) {
    return raw;
  }
  return 'cod';
}
