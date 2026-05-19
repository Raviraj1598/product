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

export type { ServerCatalog } from './api/catalogApi';
export { fetchCatalog, putCatalog, postOrder, isAdminCatalogClient } from './api/catalogApi';
export type { PlaceOrderResult } from './api/customerApi';
export { fetchAuthMe, loginAdmin, logoutAdmin } from './api/authApi';
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

export {
  checkoutTotals,
  orderTotalsFromSubtotal,
  resolveShippingCharge,
  primaryShippingMethodId,
} from './utils/pricing';

export { useLocalStorage } from './hooks/useLocalStorage';

export { StoreProvider, useStore } from './store/StoreContext';
