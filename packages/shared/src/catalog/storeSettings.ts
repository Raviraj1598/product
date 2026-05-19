import type {
  CheckoutPaymentGateway,
  PaymentMethodConfig,
  ShippingMethodConfig,
  StorefrontNavLink,
  StoreSettings,
  StoreSocialLink,
  StoreThemeTokens,
} from '../types';

export function defaultThemeTokens(): StoreThemeTokens {
  return {
    primary: '#7a1c1c',
    accent: '#c9a961',
    surface: '#faf8f5',
    bandDark: '#1a0f0a',
    pageBackground: '#ffffff',
    foreground: '#1a0f0a',
    border: 'rgba(0, 0, 0, 0.1)',
    radius: 'md',
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
    { id: 'hdr_women', label: 'Women', href: '/shop' },
    { id: 'hdr_men', label: 'Men', href: '/shop' },
    { id: 'hdr_wedding', label: 'Wedding', href: '/shop' },
    { id: 'hdr_navratri', label: 'Navratri', href: '/shop' },
    { id: 'hdr_new', label: 'New Arrivals', href: '/shop' },
    { id: 'hdr_sale', label: 'Sale', href: '/shop', variant: 'cta' },
    { id: 'hdr_admin', label: 'Admin', href: '/', openInAdmin: true },
  ];
}

export function defaultFooterShopLinks(): StorefrontNavLink[] {
  return [
    { id: 'ft_all', label: 'All collections', href: '/shop' },
    { id: 'ft_chaniya', label: 'Chaniya Choli', href: '/shop' },
    { id: 'ft_lehenga', label: 'Lehenga', href: '/shop' },
    { id: 'ft_wed', label: 'Wedding', href: '/shop' },
  ];
}

export function defaultFooterMiddleLinks(): StorefrontNavLink[] {
  return [
    { id: 'ft_orders', label: 'Orders', href: '/orders', openInAdmin: true },
    { id: 'ft_products', label: 'Products', href: '/products', openInAdmin: true },
    { id: 'ft_pages', label: 'Pages', href: '/pages', openInAdmin: true },
    { id: 'ft_settings', label: 'Store settings', href: '/settings', openInAdmin: true },
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
    { id: 'leg_privacy', label: 'Privacy', href: '/shop' },
    { id: 'leg_terms', label: 'Terms', href: '/shop' },
    { id: 'leg_ship', label: 'Shipping', href: '/shop' },
  ];
}

export const defaultStoreSettings: StoreSettings = {
  siteName: 'Sanskriti',
  storefrontTitle: 'Shop the latest',
  storefrontSubtitle:
    'Premium ethnic couture—from festive chaniya edits to bridal lehengas—with live inventory from your admin.',
  footerText: '© 2026 Sanskriti Ethnic Couture. All rights reserved.',
  announcementBar: 'Festive edits • Mirrors & zari • Made for movement',
  freeShippingMin: 50,
  shippingFlatRate: 10,
  taxPercent: 10,
  productPolicyLines: [
    '30-day return policy.',
    '1-year warranty included on eligible items.',
  ],
  shippingMethods: defaultShippingMethods(),
  paymentMethods: defaultPaymentMethods(),
  theme: defaultThemeTokens(),
  headerTagline: 'Ethnic couture',
  headerLogoGlyph: 'સ',
  headerNavLinks: defaultHeaderNavLinks(),
  footerBrandBlurb:
    'Premium fabrics, heirloom silhouettes, and festive palettes—crafted for movement and mirrored light.',
  footerShopColumnTitle: 'Shop',
  footerShopLinks: defaultFooterShopLinks(),
  footerMiddleColumnTitle: 'Manage',
  footerMiddleLinks: defaultFooterMiddleLinks(),
  footerContactColumnTitle: 'Contact',
  footerContactAddress: 'Serving customers worldwide • Ethnic couture HQ',
  footerContactPhone: '+1 (555) 010-9988',
  footerContactEmail: 'hello@boutique.example.com',
  footerSocialLinks: defaultFooterSocialLinks(),
  footerLegalLinks: defaultFooterLegalLinks(),
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
