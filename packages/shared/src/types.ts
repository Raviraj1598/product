export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  stock: number;
  sku: string;
  tags: string[];
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount?: number;
  /** URL query value for `/shop?category=` (unique). */
  slug?: string;
  /** Lower sorts first when listing storefront chips. */
  sortOrder?: number;
  /** When false, omitted from storefront category navigation. */
  published?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  expiresAt?: string;
  usageLimit?: number;
  /** Admin truth; storefront API may omit in favor of usageRemaining. */
  usageCount?: number;
  /** Storefront-safe API only — remaining redemptions vs usageLimit when set */
  usageRemaining?: number;
  active: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    selectedVariants?: Record<string, string>;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shippingMethodId?: string;
  shippingMethodLabel?: string;
  paymentMethodId?: string;
  paymentMethodLabel?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

/** Theme tokens exposed as CSS vars on storefront (edited in admin Settings). */
export interface StoreThemeTokens {
  /** Primary brand / headings (maps + --luxury-maroon). */
  primary: string;
  /** Secondary accent (--luxury-gold). */
  accent: string;
  /** Warm page backdrop (--luxury-cream where used). */
  surface: string;
  /** Navbar / footer dark band (--luxury-black). */
  bandDark: string;
  /** Main page background (#fff or cream). */
  pageBackground: string;
  /** Base body text contrast on light surfaces */
  foreground: string;
  /** Overlay border / ruler tone */
  border: string;
  /** Buttons & links rounding (Tailwind-ish: sm | md | lg | xl ) */
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export type CheckoutPaymentGateway = 'cod' | 'stripe_sandbox_placeholder' | 'card_collect_demo';

/** Admin-configurable delivery option */
export interface ShippingMethodConfig {
  id: string;
  label: string;
  /** Flat-rate charge for this lane (ignored when waived by tier). */
  amount: number;
  /** Shipping becomes $0 when cart subtotal (pre-tax) clears freeShippingMin store threshold. */
  qualifyForFreeShippingTier: boolean;
}

export interface PaymentMethodConfig {
  id: CheckoutPaymentGateway;
  label: string;
  enabled: boolean;
}

/** Main nav or footer link (internal path or https://…). */
export interface StorefrontNavLink {
  id: string;
  label: string;
  href: string;
  variant?: 'default' | 'cta';
  /** Opens admin app base + href (e.g. href "/orders" → admin…/orders). */
  openInAdmin?: boolean;
}

export type StoreSocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'youtube';

export interface StoreSocialLink {
  platform: StoreSocialPlatform;
  /** Full URL; empty hides icon */
  url: string;
}

/** CMS-style fields consumed by storefront + admin Settings. Persisted via /api/catalog. */
export interface StoreSettings {
  siteName: string;
  storefrontTitle: string;
  storefrontSubtitle: string;
  footerText: string;
  /** Optional slim banner shown under the storefront header. */
  announcementBar: string;
  freeShippingMin: number;
  shippingFlatRate: number;
  taxPercent: number;
  productPolicyLines: string[];
  /** Overrides flat math when populated; otherwise legacy threshold + shippingFlatRate only. */
  shippingMethods: ShippingMethodConfig[];
  paymentMethods: PaymentMethodConfig[];
  theme: StoreThemeTokens;
  /**
   * Optional Stripe publishable key for future hosted checkout integrations.
   * Live secret keys must NEVER be committed or passed to the storefront here.
   */
  stripePublishableKey?: string;

  /** Small line under storefront logo (was hardcoded “ETHNIC COUTURE”). */
  headerTagline: string;
  /** Single character or short glyph in logo diamond */
  headerLogoGlyph: string;
  /** Desktop main navigation */
  headerNavLinks: StorefrontNavLink[];

  /** Intro paragraph in footer column 1 */
  footerBrandBlurb: string;
  footerShopColumnTitle: string;
  footerShopLinks: StorefrontNavLink[];
  footerMiddleColumnTitle: string;
  footerMiddleLinks: StorefrontNavLink[];
  footerContactColumnTitle: string;
  footerContactAddress: string;
  footerContactPhone: string;
  footerContactEmail: string;
  footerSocialLinks: StoreSocialLink[];
  /** Bottom bar beside copyright */
  footerLegalLinks: StorefrontNavLink[];
}

/** Block in admin page builder → rendered at `/p/:slug` when published */
export interface HeroPageBlock {
  id: string;
  type: 'hero';
  headline: string;
  subheadline: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  align: 'left' | 'center';
}

export interface TextPageBlock {
  id: string;
  type: 'text';
  heading: string;
  body: string;
}

export interface ImagePageBlock {
  id: string;
  type: 'image';
  imageUrl: string;
  alt: string;
  caption: string;
  linkHref: string;
}

export interface ProductGridPageBlock {
  id: string;
  type: 'productGrid';
  title: string;
  source: 'featured' | 'category' | 'all';
  /** When source is category, matched against Product.category string */
  categoryName: string;
  maxItems: number;
}

export interface CtaStripePageBlock {
  id: string;
  type: 'ctaStripe';
  text: string;
  buttonLabel: string;
  href: string;
  variant: 'gold' | 'maroon';
}

export interface SpacerPageBlock {
  id: string;
  type: 'spacer';
  heightPx: number;
}

export interface QuotePageBlock {
  id: string;
  type: 'quote';
  quote: string;
  attribution: string;
}

export interface DividerPageBlock {
  id: string;
  type: 'divider';
  variant: 'line' | 'ornament';
}

export type PageBlock =
  | HeroPageBlock
  | TextPageBlock
  | ImagePageBlock
  | ProductGridPageBlock
  | CtaStripePageBlock
  | SpacerPageBlock
  | QuotePageBlock
  | DividerPageBlock;

export type PageTemplateId = 'campaign' | 'story' | 'commerce' | 'policy';

/** Vertical “band” width for a row container (similar to Magento page-builder section widths). */
export type PageBandWidth = 'full' | 'content' | 'narrow';

export interface PageBuilderColumn {
  id: string;
  /** Desktop spans in a 12-column grid (Tailwind-compatible). Sum should be 12. */
  span: number;
  blocks: PageBlock[];
}

export interface PageBuilderRow {
  id: string;
  /** Row title shown above the grid when non-empty */
  title: string;
  bandWidth: PageBandWidth;
  gutter: 'comfortable' | 'compact';
  columns: PageBuilderColumn[];
}

export interface BuiltPage {
  id: string;
  slug: string;
  title: string;
  seoDescription: string;
  published: boolean;
  /** Determines overall chrome + spacing cues on storefront. */
  templateId: PageTemplateId;
  /** Magento/Page Builder-like stack of rows containing 12‑column grids */
  rows: PageBuilderRow[];
}
