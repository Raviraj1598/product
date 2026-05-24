import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  Product,
  Category,
  Customer,
  Order,
  CartItem,
  Review,
  Coupon,
  WishlistItem,
  StoreSettings,
  BuiltPage,
  AffiliateReferral,
} from '../types';
import { fetchCatalog, isAdminCatalogClient, putCatalog, postOrder } from '../api/catalogApi';
import {
  defaultCategories,
  defaultCoupons,
  defaultProducts,
  defaultReviews,
} from '../catalog/seedCatalog';
import { defaultStoreSettings, mergeStoreSettings } from '../catalog/storeSettings';
import { hydrateCategories } from '../catalog/categoryHelpers';

interface StoreContextType {
  products: Product[];
  setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  categories: Category[];
  setCategories: (categories: Category[] | ((prev: Category[]) => Category[])) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((prev: Customer[]) => Customer[])) => void;
  orders: Order[];
  setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  reviews: Review[];
  setReviews: (reviews: Review[] | ((prev: Review[]) => Review[])) => void;
  coupons: Coupon[];
  setCoupons: (coupons: Coupon[] | ((prev: Coupon[]) => Coupon[])) => void;
  wishlist: WishlistItem[];
  setWishlist: (wishlist: WishlistItem[] | ((prev: WishlistItem[]) => WishlistItem[])) => void;
  settings: StoreSettings;
  setSettings: (settings: StoreSettings | ((prev: StoreSettings) => StoreSettings)) => void;
  builtPages: BuiltPage[];
  setBuiltPages: (pages: BuiltPage[] | ((prev: BuiltPage[]) => BuiltPage[])) => void;
  affiliateReferrals: AffiliateReferral[];
  setAffiliateReferrals: (
    refs: AffiliateReferral[] | ((prev: AffiliateReferral[]) => AffiliateReferral[]),
  ) => void;
  addToCart: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; discount: number; message: string };
  /** True after catalog has been fetched from API at least once (success or fallback). */
  catalogReady: boolean;
  reloadCatalogFromServer: () => Promise<void>;
  submitOrderToServer: (order: Order) => Promise<{ orderId?: string; invoiceNumber?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => [...defaultProducts]);
  const [categories, setCategories] = useState<Category[]>(() => hydrateCategories([...defaultCategories]));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>(() => [...defaultReviews]);
  const [coupons, setCoupons] = useState<Coupon[]>(() => [...defaultCoupons]);
  const [settings, setSettings] = useState<StoreSettings>(() => mergeStoreSettings(undefined));
  const [builtPages, setBuiltPages] = useState<BuiltPage[]>([]);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);

  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogSyncEnabled, setCatalogSyncEnabled] = useState(false);

  const persistGenRef = useRef(0);

  const bumpPersistGeneration = () => {
    persistGenRef.current += 1;
  };

  const [cart, setCart] = useLocalStorage<CartItem[]>('ecommerce_cart_v2', []);
  const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>('ecommerce_wishlist', []);

  const reloadCatalogFromServer = useCallback(async () => {
    bumpPersistGeneration();
    const data = await fetchCatalog();
    setProducts(data.products);
    setCategories(data.categories);
    setCustomers(data.customers ?? []);
    setOrders(data.orders);
    setReviews(data.reviews);
    setCoupons(data.coupons);
    setSettings(mergeStoreSettings(data.settings));
    setBuiltPages(data.builtPages ?? []);
    setAffiliateReferrals(data.affiliateReferrals ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reloadCatalogFromServer();
        if (!cancelled) setCatalogSyncEnabled(true);
      } catch {
        if (!cancelled) {
          setCatalogSyncEnabled(false);
          setSettings(defaultStoreSettings);
          setCategories(hydrateCategories([...defaultCategories]));
          console.warn(
            '[store] Catalog API unreachable — using built-in demo data locally. Admin saves will not persist until the API runs.',
          );
        }
      } finally {
        if (!cancelled) setCatalogReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadCatalogFromServer]);

  useEffect(() => {
    if (!catalogSyncEnabled || !isAdminCatalogClient()) return;

    const scheduledAtGen = persistGenRef.current;
    const t = window.setTimeout(() => {
      if (scheduledAtGen !== persistGenRef.current) return;

      putCatalog({
        products,
        categories,
        customers,
        orders,
        reviews,
        coupons,
        settings: mergeStoreSettings(settings),
        builtPages,
        affiliateReferrals,
      }).catch((err) => {
        console.error('[store] Failed to persist catalog:', err);
      });
    }, 480);

    return () => window.clearTimeout(t);
  }, [products, categories, customers, orders, reviews, coupons, settings, builtPages, affiliateReferrals, catalogSyncEnabled]);

  const addToCart = (productId: string, quantity: number, selectedVariants?: Record<string, string>) => {
    const product = products.find((p) => p.id === productId);
    if (product && product.purchaseMode === 'affiliate' && product.affiliateUrl?.trim()) {
      console.warn('[store] Affiliate products cannot be added to cart:', productId);
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity, selectedVariants }
            : item,
        );
      }
      return [...prevCart, { productId, quantity, selectedVariants }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.productId === productId);
      if (exists) {
        return prev.filter((item) => item.productId !== productId);
      }
      return [...prev, { productId, addedAt: new Date().toISOString() }];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((item) => item.productId === productId);

  const validateCoupon = (code: string, subtotal: number) => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit != null) {
      const remaining =
        coupon.usageRemaining !== undefined && coupon.usageRemaining !== null
          ? coupon.usageRemaining
          : coupon.usageLimit - (coupon.usageCount ?? 0);
      if (remaining <= 0) {
        return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
      }
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of $${coupon.minOrderValue} required`,
      };
    }

    const discount =
      coupon.discountType === 'percentage'
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    return { valid: true, discount, message: 'Coupon applied successfully!' };
  };

  const submitOrderToServer = async (order: Order) => {
    const result = await postOrder(order);
    bumpPersistGeneration();
    if (isAdminCatalogClient()) {
      await reloadCatalogFromServer();
    }
    return { orderId: result.orderId, invoiceNumber: result.invoiceNumber };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        categories,
        setCategories,
        customers,
        setCustomers,
        orders,
        setOrders,
        cart,
        setCart,
        reviews,
        setReviews,
        coupons,
        setCoupons,
        wishlist,
        setWishlist,
        settings,
        setSettings,
        builtPages,
        setBuiltPages,
        affiliateReferrals,
        setAffiliateReferrals,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        validateCoupon,
        catalogReady,
        reloadCatalogFromServer,
        submitOrderToServer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
