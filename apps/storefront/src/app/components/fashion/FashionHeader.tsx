import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router';
import { Search, Heart, ShoppingBag, User, Menu, X, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '../../auth/CustomerAuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import { adminSiteHref } from '../../lib/externalUrls';
import { StorefrontNavAnchor } from '../../lib/navLinks';
import { cn } from '../ui/utils';
import { StoreBrandLogo } from './StoreBrandLogo';

/** Premium storefront header — announcement, logo, settings nav links, search, utilities. */
export function FashionHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { cart, wishlist, settings } = useStore();
  const { user } = useCustomerAuth();
  const merged = mergeStoreSettings(settings);
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerLinks = merged.headerNavLinks ?? [];

  useEffect(() => {
    const param = searchParams.get('q');
    if (param != null && param !== '') setQ(param);
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const promo =
    merged.announcementBar?.trim() ||
    `Thoughtful gifting • Free shipping on orders over $${merged.freeShippingMin.toFixed(0)}`;

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmed) nextParams.set('q', trimmed);
    else nextParams.delete('q');
    const qs = nextParams.toString();
    navigate({ pathname: '/shop', search: qs ? `?${qs}` : '' });
    setMobileOpen(false);
  };

  const ctaLink = headerLinks.find((l) => l.variant === 'cta');
  const regularLinks = headerLinks.filter((l) => l.variant !== 'cta');

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement ribbon */}
      <div className="relative overflow-hidden bg-[var(--luxury-black)] text-white">
        <div
          className="absolute inset-0 opacity-40 bg-[length:200%_100%] animate-[shimmer_8s_linear_infinite]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, transparent 0%, var(--luxury-gold) 25%, var(--luxury-maroon) 50%, var(--luxury-gold) 75%, transparent 100%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Sparkles className="w-3.5 h-3.5 text-[var(--luxury-gold)] shrink-0" aria-hidden />
          <span className="font-medium tracking-wide text-center">{promo}</span>
          <Sparkles className="w-3.5 h-3.5 text-[var(--luxury-gold)] shrink-0 hidden sm:block" aria-hidden />
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          'border-b transition-all duration-500',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-black/5 shadow-[0_8px_32px_-12px_rgba(45,27,78,0.18)]'
            : 'bg-white/95 backdrop-blur-md border-black/[0.06]',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6 min-h-[4.5rem] lg:min-h-[5rem]">
            <button
              type="button"
              className="lg:hidden p-2.5 -ml-1 rounded-xl text-[var(--luxury-maroon)] hover:bg-[var(--luxury-cream)] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <StoreBrandLogo settings={merged} variant="header" />

            {/* Desktop nav — settings links only (no categories) */}
            <nav
              aria-label="Main"
              className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-1"
            >
              {regularLinks.map((link) => (
                <StorefrontNavAnchor
                  key={link.id}
                  link={link}
                  adminHref={adminSiteHref}
                  className="px-3.5 py-2 text-sm font-medium text-[var(--luxury-black)]/80 hover:text-[var(--luxury-maroon)] rounded-full hover:bg-[var(--luxury-cream)] transition-all shrink-0"
                />
              ))}
              {ctaLink && (
                <StorefrontNavAnchor
                  link={ctaLink}
                  adminHref={adminSiteHref}
                  className="ml-2 px-5 py-2.5 bg-gradient-to-r from-[var(--luxury-maroon)] to-[var(--luxury-red)] text-white text-sm font-semibold rounded-full shadow-lg shadow-[var(--luxury-maroon)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
                />
              )}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <form onSubmit={onSearchSubmit} className="relative hidden md:block">
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search gifts…"
                  className="w-44 lg:w-52 xl:w-60 pl-10 pr-4 py-2.5 text-sm bg-[var(--luxury-cream)]/80 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[var(--luxury-gold)]/50 focus:ring-2 focus:ring-[var(--luxury-maroon)]/10 transition-all placeholder:text-gray-400"
                />
                <Search className="w-4 h-4 text-[var(--luxury-maroon)]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              <Link
                to="/shop"
                className="relative hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[var(--luxury-maroon)] hover:bg-[var(--luxury-cream)] transition-all hover:scale-105"
                title="Wishlist"
              >
                <Heart className="w-[1.15rem] h-[1.15rem]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center bg-[var(--luxury-red)] text-white text-[10px] font-bold rounded-full ring-2 ring-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to={user ? '/account' : '/login'}
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[var(--luxury-maroon)] hover:bg-[var(--luxury-cream)] transition-all hover:scale-105"
                title={user ? `Account (${user.name})` : 'Sign in'}
              >
                <User className="w-[1.15rem] h-[1.15rem]" />
              </Link>

              <Link
                to="/cart"
                className="relative flex items-center gap-2 pl-3 pr-4 py-2 sm:pl-3.5 sm:pr-5 sm:py-2.5 bg-gradient-to-r from-[var(--luxury-maroon)] to-[var(--luxury-red)] text-white rounded-full hover:shadow-lg hover:shadow-[var(--luxury-maroon)]/35 hover:-translate-y-0.5 transition-all"
              >
                <ShoppingBag className="w-[1.15rem] h-[1.15rem]" />
                <span className="hidden sm:inline text-sm font-semibold">Bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:static sm:ml-0 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center bg-[var(--luxury-gold)] text-[var(--luxury-black)] text-[10px] font-bold rounded-full sm:ring-0 ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute left-0 right-0 top-full z-50 lg:hidden bg-white border-b border-black/5 shadow-2xl max-h-[min(85vh,520px)] overflow-y-auto"
            >
              <div className="p-5 space-y-5">
                <form onSubmit={onSearchSubmit} className="relative">
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search gifts…"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-[var(--luxury-cream)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--luxury-maroon)]/20"
                  />
                  <Search className="w-4 h-4 text-[var(--luxury-maroon)] absolute left-4 top-1/2 -translate-y-1/2" />
                </form>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={user ? '/account' : '/login'}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--luxury-cream)] text-sm font-medium text-[var(--luxury-maroon)]"
                  >
                    <User className="w-4 h-4" /> {user ? 'Account' : 'Sign in'}
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--luxury-cream)] text-sm font-medium text-[var(--luxury-maroon)]"
                  >
                    <Heart className="w-4 h-4" /> Wishlist
                    {wishlist.length > 0 ? ` (${wishlist.length})` : ''}
                  </Link>
                </div>

                <nav className="space-y-1" aria-label="Mobile main">
                  {regularLinks.map((link) => (
                    <StorefrontNavAnchor
                      key={link.id}
                      link={link}
                      adminHref={adminSiteHref}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--luxury-black)]/80 hover:bg-[var(--luxury-cream)]"
                    />
                  ))}
                </nav>

                {ctaLink && (
                  <StorefrontNavAnchor
                    link={ctaLink}
                    adminHref={adminSiteHref}
                    className="block w-full text-center py-3.5 rounded-2xl bg-gradient-to-r from-[var(--luxury-maroon)] to-[var(--luxury-red)] text-white font-semibold shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
