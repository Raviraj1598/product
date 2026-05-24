export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export type ProductPurchaseMode = 'internal' | 'affiliate';

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
  /** When `affiliate`, product links out via affiliateUrl instead of cart/checkout. */
  purchaseMode?: ProductPurchaseMode;
  /** External purchase URL (Amazon, Flipkart, etc.) with affiliate tracking params. */
  affiliateUrl?: string;
  /** Partner name shown in CTA, e.g. "Amazon". */
  affiliateVendor?: string;
  /** Override default "Shop now" / "Buy on {vendor}" button text. */
  affiliateButtonLabel?: string;
  /** Links to StoreSettings.affiliatePlatforms[].id */
  affiliatePlatformId?: string;
  /** Display currency for affiliate/imported prices (INR, USD, …). */
  priceCurrency?: string;
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

/** Registered storefront shopper (profile in catalog; password in server SQLite). */
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  addressLine1: string;
  city: string;
  zipCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  /** Links order to a registered customer when checkout was authenticated. */
  customerId?: string;
  /** Human-readable invoice reference shown on receipts. */
  invoiceNumber?: string;
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

/** Outbound affiliate link click — not a store order; purchase completes on partner site. */
export interface AffiliateReferral {
  id: string;
  productId: string;
  productName: string;
  platformId?: string;
  platformName?: string;
  destinationUrl: string;
  clickedAt: string;
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

export interface AffiliatePlatformConfig {
  id: string;
  name: string;
  /** Matched against link hostname, e.g. amazon.in */
  domainPattern: string;
  affiliateParamName: string;
  affiliateParamValue: string;
  buttonLabel: string;
  currency: string;
  importEnabled: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface HeaderLogoDesign {
  glyph: string;
  primary: string;
  accent: string;
  shape: 'rounded' | 'circle';
  /** When true, badge builder adds store name text beside the initial. */
  includeName?: boolean;
  /** Optional label beside the badge (defaults to store name). */
  nameText?: string;
}

/** Admin SPA branding & workflow defaults (persisted with catalog settings). */
export interface AdminPanelSettings {
  /** Sidebar title, e.g. "GiftJoy Admin". */
  panelTitle: string;
  /** Small line under title in sidebar. */
  panelSubtitle: string;
  /** Highlight color for active nav (hex). */
  accentColor: string;
  /** Skip type picker when adding products if not "picker". */
  defaultProductMode: 'picker' | 'internal' | 'affiliate';
  /** Show "View storefront" in sidebar footer. */
  showStorefrontLink: boolean;
  /** Shown on Admin Settings + dashboard help. */
  supportEmail: string;
  /** Optional note on dashboard welcome card. */
  dashboardNote: string;
  /** Email store owner when a new checkout order is placed (requires server .env mail config). */
  orderNotifyEnabled: boolean;
  /** Recipient for new-order alerts; defaults to supportEmail when empty. */
  orderNotifyEmail: string;
  /** Optional note shown on Order alerts config (your mail setup instructions). */
  orderNotifyHelpNote: string;
}

export interface AdminSecuritySnapshot {
  email: string;
  displayName: string;
  sessionTtlHours: number;
  activeSessions: number;
  loginRequired: boolean;
  cookieHttpOnly: boolean;
  cookieSecure: boolean;
  cookieSameSite: string;
  emailProviderConfigured?: boolean;
}

/** Homepage “Collection spotlight” carousel settings. */
export interface HomepageCollectionSpotlight {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  /** Ordered category IDs; empty = auto-pick published categories. */
  categoryIds: string[];
  autoplaySeconds: number;
  slideSubtitle: string;
  buttonLabel: string;
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
  /** Optional image logo URL; when set, replaces the glyph diamond in the header. */
  headerLogoUrl?: string;
  /** Badge designer state for re-editing in admin. */
  headerLogoDesign?: HeaderLogoDesign;
  /** FTC-style disclosure shown on affiliate product pages and cards. */
  affiliateDisclosure?: string;
  /** Amazon Associates tracking id (legacy — prefer affiliatePlatforms). */
  amazonAffiliateTag?: string;
  /** Configured affiliate partner platforms (Amazon, Flipkart, …). */
  affiliatePlatforms: AffiliatePlatformConfig[];
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
  /** Homepage category carousel (Collection spotlight). */
  homepageCollectionSpotlight: HomepageCollectionSpotlight;
  /** Admin panel branding & preferences. */
  adminPanel: AdminPanelSettings;
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
