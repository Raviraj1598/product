export type { AdminUser, CustomerUser } from './types/auth';

export type {
  ProductVariant,
  Product,
  Category,
  Customer,
  Review,
  CartItem,
  Coupon,
  Order,
  WishlistItem,
  StoreSettings,
  BuiltPage,
  PageBlock,
  PageBandWidth,
  PageBuilderRow,
  PageBuilderColumn,
  PageTemplateId,
  HeroPageBlock,
  TextPageBlock,
  ImagePageBlock,
  ProductGridPageBlock,
  CtaStripePageBlock,
  SpacerPageBlock,
  QuotePageBlock,
  DividerPageBlock,
  StoreThemeTokens,
  ShippingMethodConfig,
  PaymentMethodConfig,
  CheckoutPaymentGateway,
  StorefrontNavLink,
  StoreSocialLink,
  StoreSocialPlatform,
  ProductPurchaseMode,
  AffiliatePlatformConfig,
  HeaderLogoDesign,
  AdminPanelSettings,
  HomepageCollectionSpotlight,
} from './types';

export {
  sanitizePageSlug,
  normalizeBuiltPages,
  dedupeBuiltPagesBySlug,
  createBlankBuiltPage,
  createNewBuiltPage,
  createPageBlock,
} from './cms/normalizeBuiltPages';

export {
  clampSpan,
  ensureColumnSpansSumTwelve,
  assignColumnDesktopSpan,
  createEmptyPageBuilderRow,
  halveIntoTwoSixSpanColumns,
  coercePageBand,
  coerceGutter,
} from './cms/pageBuilderRows';

export { PAGE_TEMPLATE_IDS, PAGE_TEMPLATE_META, createPageFromTemplate } from './cms/pageTemplates';
export { defaultBuiltPages, DEFAULT_PAGE_SLUGS } from './cms/defaultBuiltPages';
export { ensureDefaultBuiltPages } from './cms/catalogDefaults';

export type { ServerCatalog } from './api/catalogApi';
export { fetchCatalog, putCatalog, postOrder, isAdminCatalogClient } from './api/catalogApi';
export type { AffiliatePreviewResult } from './api/affiliateApi';
export { fetchAffiliatePreview, recordAffiliateClick } from './api/affiliateApi';
export type { AffiliateReferral } from './types';
export type { PlaceOrderResult } from './api/customerApi';
export type { AdminSecuritySnapshot } from './types';
export {
  fetchAuthMe,
  loginAdmin,
  logoutAdmin,
  fetchAdminSecurity,
  changeAdminPassword,
  revokeOtherAdminSessions,
} from './api/authApi';
export {
  fetchCustomerMe,
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  updateCustomerProfile,
  fetchMyOrders,
  fetchMyOrder,
} from './api/customerApi';

export { formatInvoiceNumber } from './utils/invoice';

export { defaultCategories, defaultProducts, defaultReviews, defaultCoupons } from './catalog/seedCatalog';
export {
  hydrateCategories,
  slugifyCategoryName,
  resolveCategorySlug,
} from './catalog/categoryHelpers';
export {
  defaultStoreSettings,
  mergeStoreSettings,
  defaultThemeTokens,
  defaultShippingMethods,
  defaultPaymentMethods,
  defaultHeaderNavLinks,
  defaultFooterShopLinks,
  defaultFooterMiddleLinks,
  defaultFooterSocialLinks,
  defaultFooterLegalLinks,
  applyStoreTheme,
  coercePaymentGateway,
} from './catalog/storeSettings';

export { defaultAdminPanelSettings } from './catalog/adminPanelSettings';
export {
  defaultHomepageCollectionSpotlight,
  resolveHomepageSpotlightSlides,
  type ResolvedSpotlightSlide,
} from './catalog/homepageSpotlight';
export {
  CATALOG_BACKUP_VERSION,
  CATALOG_BACKUP_SECTIONS,
  buildCatalogBackup,
  downloadCatalogBackup,
  parseCatalogBackupFile,
  mergeCatalogImport,
  type CatalogBackupSection,
  type CatalogBackupFile,
} from './catalog/catalogBackup';

export {
  checkoutTotals,
  orderTotalsFromSubtotal,
  resolveShippingCharge,
  primaryShippingMethodId,
} from './utils/pricing';

export {
  isAffiliateProduct,
  resolvePurchaseMode,
  getAffiliateHref,
  affiliateButtonLabel,
  AFFILIATE_LINK_REL,
} from './utils/productHelpers';

export {
  defaultAffiliatePlatforms,
  sortedAffiliatePlatforms,
  allAffiliatePlatforms,
  matchPlatformByUrl,
  resolveProductAffiliatePlatform,
  applyPlatformAffiliateParams,
  amazonTagFromSettings,
  formatProductPrice,
  affiliatePlatformButtonLabel,
  truncateDescription,
} from './catalog/affiliatePlatforms';

export { applyAmazonAffiliateTag, isAmazonUrl } from './utils/affiliateUrl';

export {
  hasStoreLogo,
  generateBadgeLogoDataUrl,
  generateBadgeWithNameLogoDataUrl,
  generateWordmarkLogoDataUrl,
  readImageFileAsDataUrl,
  validateLogoDataUrl,
  LOGO_UPLOAD_MAX_BYTES,
} from './utils/storeLogo';

export { useLocalStorage } from './hooks/useLocalStorage';

export { StoreProvider, useStore } from './store/StoreContext';
