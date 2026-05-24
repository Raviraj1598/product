import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Truck,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import type { StoreSocialPlatform, StorefrontNavLink } from '@boutique/shared';
import { Link } from 'react-router';
import { adminSiteHref } from '../../lib/externalUrls';
import { StorefrontNavAnchor } from '../../lib/navLinks';
import { StoreBrandLogo } from './StoreBrandLogo';
import { cn } from '../ui/utils';

const socialIcon: Record<StoreSocialPlatform, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

const socialLabel: Record<StoreSocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  youtube: 'YouTube',
};

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--luxury-maroon)] mb-3">
      {children}
    </h4>
  );
}

function FooterTextLink({
  to,
  href,
  children,
  className,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    'text-sm text-gray-600 hover:text-[var(--luxury-maroon)] transition-colors leading-snug';
  if (to) {
    return (
      <Link to={to} className={cn(base, className)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cn(base, className)}>
      {children}
    </a>
  );
}

function NavLinkRow({ link }: { link: StorefrontNavLink }) {
  return (
    <StorefrontNavAnchor
      link={link}
      adminHref={adminSiteHref}
      className="text-sm text-gray-600 hover:text-[var(--luxury-maroon)] transition-colors"
    />
  );
}

export function FashionFooter() {
  const { settings, builtPages } = useStore();
  const merged = mergeStoreSettings(settings);

  const publishedPages = [...builtPages]
    .filter((p) => p.published)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 8);

  const activeSocial = merged.footerSocialLinks.filter((s) => s.url?.trim());

  const perks = [
    {
      icon: Truck,
      label: `Free shipping over $${merged.freeShippingMin.toFixed(0)}`,
    },
    { icon: Gift, label: 'Gift wrap on eligible orders' },
    { icon: ShieldCheck, label: 'Curated in-store & partner picks' },
  ];

  return (
    <footer className="mt-auto">
      {/* Perks ribbon */}
      <div className="border-t border-[var(--luxury-maroon)]/10 bg-gradient-to-r from-[var(--luxury-cream)] via-white to-[var(--luxury-cream)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <ul className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-center gap-3 sm:gap-x-8 sm:gap-y-2">
            {perks.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--luxury-maroon)]/10 text-[var(--luxury-maroon)] shrink-0">
                  <item.icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main link grid — light surface */}
      <div className="bg-white border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-11">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-4">
              <StoreBrandLogo settings={merged} variant="footer-light" className="mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mb-4">
                {merged.footerBrandBlurb}
              </p>
              {activeSocial.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeSocial.map((s) => {
                    const Icon = socialIcon[s.platform];
                    return (
                      <a
                        key={s.platform}
                        href={s.url!.trim()}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={socialLabel[s.platform]}
                        className="h-9 w-9 rounded-full border border-[var(--luxury-maroon)]/15 flex items-center justify-center text-[var(--luxury-maroon)] hover:bg-[var(--luxury-maroon)] hover:text-white hover:border-[var(--luxury-maroon)] transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shop */}
            <div className="lg:col-span-2 lg:col-start-6">
              <FooterHeading>{merged.footerShopColumnTitle}</FooterHeading>
              <ul className="space-y-2">
                {merged.footerShopLinks.map((link) => (
                  <li key={link.id}>
                    <NavLinkRow link={link} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Help + pages */}
            <div className="lg:col-span-2">
              <FooterHeading>{merged.footerMiddleColumnTitle}</FooterHeading>
              <ul className="space-y-2">
                {merged.footerMiddleLinks.map((link) => (
                  <li key={link.id}>
                    <NavLinkRow link={link} />
                  </li>
                ))}
                {publishedPages.map((p) => (
                  <li key={p.id}>
                    <FooterTextLink to={`/p/${p.slug}`}>{p.title}</FooterTextLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="sm:col-span-2 lg:col-span-3">
              <FooterHeading>{merged.footerContactColumnTitle}</FooterHeading>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--luxury-gold)] shrink-0 mt-0.5" aria-hidden />
                  <span className="leading-relaxed">{merged.footerContactAddress}</span>
                </li>
                <li className="flex gap-2.5 items-center">
                  <Phone className="h-4 w-4 text-[var(--luxury-gold)] shrink-0" aria-hidden />
                  <a
                    href={`tel:${merged.footerContactPhone.replace(/\s/g, '')}`}
                    className="hover:text-[var(--luxury-maroon)] transition-colors"
                  >
                    {merged.footerContactPhone}
                  </a>
                </li>
                <li className="flex gap-2.5 items-center min-w-0">
                  <Mail className="h-4 w-4 text-[var(--luxury-gold)] shrink-0" aria-hidden />
                  <a
                    href={`mailto:${merged.footerContactEmail}`}
                    className="hover:text-[var(--luxury-maroon)] transition-colors truncate"
                  >
                    {merged.footerContactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[var(--luxury-black)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-white/50 text-center sm:text-left">{merged.footerText}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1" aria-label="Legal">
            {merged.footerLegalLinks.map((link) => (
              <StorefrontNavAnchor
                key={link.id}
                link={link}
                adminHref={adminSiteHref}
                className="text-[11px] uppercase tracking-wider text-white/55 hover:text-[var(--luxury-gold)] transition-colors"
              />
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
