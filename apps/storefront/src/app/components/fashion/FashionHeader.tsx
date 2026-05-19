import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { motion } from 'motion/react';
import { mergeStoreSettings, resolveCategorySlug, useStore } from '@boutique/shared';
import { toast } from 'sonner';
import { adminSiteHref } from '../../lib/externalUrls';
import { StorefrontNavAnchor } from '../../lib/navLinks';
import { cn } from '../ui/utils';
import { resolveShopCategoryFilter, shopSearch, isBareShopHref } from '../../lib/shopNavigation';

/** Header: announcement bar, logo, dynamic shop categories (+ settings links), utilities. */
export function FashionHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { cart, wishlist, settings, categories, products } = useStore();
  const merged = mergeStoreSettings(settings);
  const [q, setQ] = useState('');

  useEffect(() => {
    const param = searchParams.get('q');
    if (param != null && param !== '') setQ(param);
  }, [searchParams]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const promo =
    merged.announcementBar?.trim() ||
    `Ethnic couture • Free shipping on orders over $${merged.freeShippingMin.toFixed(0)}`;

  const sortedShopCategories = useMemo(() => {
    const rows = [...categories].filter((c) => c.published !== false);
    rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return rows;
  }, [categories]);

  const activeShopCategory = useMemo(
    () =>
      resolveShopCategoryFilter({
        categoryParam: searchParams.get('category'),
        publishedCategories: sortedShopCategories,
        allCategories: categories,
        products,
      }),
    [categories, sortedShopCategories, products, searchParams],
  );

  const extraHeaderLinks = useMemo(
    () => (merged.headerNavLinks ?? []).filter((l) => !isBareShopHref(l.href)),
    [merged.headerNavLinks],
  );

  const shopPathActive = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmed) {
      nextParams.set('q', trimmed);
    } else {
      nextParams.delete('q');
    }
    const qs = nextParams.toString();
    navigate({ pathname: '/shop', search: qs ? `?${qs}` : '' });
  };

  const baseNav = 'text-sm font-medium text-[var(--luxury-maroon)] hover:text-[var(--luxury-gold)] transition-colors';
  const ctaNav =
    'px-4 py-2 bg-[var(--luxury-red)] text-white rounded-lg hover:bg-[var(--luxury-maroon)] transition-colors text-sm font-medium';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-maroon)] text-white py-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <span>{promo}</span>
        </div>
      </motion.div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-18 min-h-[4.25rem]">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--luxury-maroon)] via-[var(--luxury-red)] to-[var(--luxury-gold)] rounded-lg flex items-center justify-center transform rotate-45">
                  <span className="text-white text-2xl transform -rotate-45 leading-none">
                    {merged.headerLogoGlyph?.trim() || 'સ'}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--luxury-maroon)] to-[var(--luxury-gold)] bg-clip-text text-transparent leading-tight">
                  {merged.siteName}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 tracking-widest uppercase">
                  {merged.headerTagline}
                </p>
              </div>
            </Link>

            <nav
              aria-label="Main"
              className="hidden md:flex flex-1 min-w-0 items-center gap-5 xl:gap-8 justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap"
            >
              {sortedShopCategories.length === 0 ? (
                (merged.headerNavLinks ?? []).map((link) => (
                  <StorefrontNavAnchor
                    key={link.id}
                    link={link}
                    adminHref={adminSiteHref}
                    className={
                      link.variant === 'cta' ? `${ctaNav} shrink-0` : `${baseNav} shrink-0`
                    }
                  />
                ))
              ) : (
                <>
                  <Link
                    to={{ pathname: '/shop', search: shopSearch(searchParams, { category: null }) }}
                    className={cn(
                      baseNav,
                      'shrink-0',
                      shopPathActive &&
                        activeShopCategory.mode === 'all' &&
                        'text-[var(--luxury-maroon)] underline decoration-[var(--luxury-gold)] decoration-2 underline-offset-4',
                    )}
                  >
                    Shop all
                  </Link>
                  {sortedShopCategories.map((category) => {
                    const slug = resolveCategorySlug(category);
                    const search = shopSearch(searchParams, { category: slug });
                    const active =
                      shopPathActive &&
                      activeShopCategory.mode === 'one' &&
                      activeShopCategory.categoryName === category.name;
                    return (
                      <Link
                        key={category.id}
                        to={{ pathname: '/shop', search }}
                        className={cn(
                          baseNav,
                          'shrink-0',
                          active &&
                            'underline decoration-[var(--luxury-maroon)] decoration-2 underline-offset-4 font-semibold',
                        )}
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                  {extraHeaderLinks.map((link) => (
                    <StorefrontNavAnchor
                      key={link.id}
                      link={link}
                      adminHref={adminSiteHref}
                      className={
                        link.variant === 'cta'
                          ? `${ctaNav} shrink-0`
                          : `${baseNav} shrink-0`
                      }
                    />
                  ))}
                </>
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
              <form onSubmit={onSearchSubmit} className="relative hidden md:block">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[var(--luxury-gold)] w-48 xl:w-64 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              <Link
                to="/shop"
                className="relative p-2 hover:bg-[var(--luxury-cream)] rounded-full transition-colors hidden sm:flex"
                title="Wishlist count"
              >
                <Heart className="w-5 h-5 text-[var(--luxury-maroon)]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--luxury-red)] text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className="hidden sm:flex p-2 hover:bg-[var(--luxury-cream)] rounded-full transition-colors"
                title="Sign in coming soon"
                onClick={() => toast.message('Accounts coming soon')}
              >
                <User className="w-5 h-5 text-[var(--luxury-maroon)]" />
              </button>

              <Link
                to="/cart"
                className="relative p-2 bg-[var(--luxury-maroon)] text-white rounded-full hover:bg-[var(--luxury-red)] transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--luxury-gold)] text-[var(--luxury-maroon)] text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile category strip */}
          {sortedShopCategories.length > 0 && (
            <nav
              aria-label="Shop categories"
              className="md:hidden pb-3 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1"
            >
              <Link
                to={{ pathname: '/shop', search: shopSearch(searchParams, { category: null }) }}
                className={cn(
                  'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                  shopPathActive && activeShopCategory.mode === 'all'
                    ? 'bg-[var(--luxury-maroon)] text-white border-[var(--luxury-maroon)]'
                    : 'bg-[var(--luxury-cream)] text-[var(--luxury-maroon)] border-transparent',
                )}
              >
                All
              </Link>
              {sortedShopCategories.map((category) => {
                const slug = resolveCategorySlug(category);
                const search = shopSearch(searchParams, { category: slug });
                const active =
                  shopPathActive &&
                  activeShopCategory.mode === 'one' &&
                  activeShopCategory.categoryName === category.name;
                return (
                  <Link
                    key={`m-${category.id}`}
                    to={{ pathname: '/shop', search }}
                    className={cn(
                      'shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                      active
                        ? 'bg-[var(--luxury-maroon)] text-white border-[var(--luxury-maroon)]'
                        : 'bg-[var(--luxury-cream)] text-[var(--luxury-maroon)] border-transparent',
                    )}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
