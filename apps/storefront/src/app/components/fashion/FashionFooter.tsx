import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import type { StoreSocialPlatform } from '@boutique/shared';
import { Link } from 'react-router';
import { adminSiteHref } from '../../lib/externalUrls';
import { StorefrontNavAnchor } from '../../lib/navLinks';

const socialIcon: Record<StoreSocialPlatform, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

export function FashionFooter() {
  const { settings, builtPages } = useStore();
  const merged = mergeStoreSettings(settings);
  const publishedPages = [...builtPages]
    .filter((p) => p.published)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 12);

  return (
    <footer className="bg-[var(--luxury-maroon)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[var(--luxury-gold)] rounded-full flex items-center justify-center">
                <span className="text-[var(--luxury-maroon)] text-xl">✦</span>
              </div>
              <h3 className="text-xl font-semibold">{merged.siteName}</h3>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">{merged.footerBrandBlurb}</p>
            <div className="flex gap-3 flex-wrap">
              {merged.footerSocialLinks.map((s) => {
                const href = s.url?.trim();
                if (!href) return null;
                const Icon = socialIcon[s.platform];
                return (
                  <a
                    key={s.platform}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2 bg-white/10 rounded-full hover:bg-[var(--luxury-gold)] transition-colors"
                    aria-label={s.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-[var(--luxury-gold)]">{merged.footerShopColumnTitle}</h4>
            <ul className="space-y-2">
              {merged.footerShopLinks.map((link) => (
                <li key={link.id}>
                  <StorefrontNavAnchor
                    link={link}
                    adminHref={adminSiteHref}
                    className="text-white/70 hover:text-[var(--luxury-gold)] transition-colors"
                  />
                </li>
              ))}
              {publishedPages.length > 0 ? (
                <>
                  <li className="pt-3 mt-2 border-t border-white/15 text-[10px] uppercase tracking-wider text-[var(--luxury-gold)]">
                    Custom pages
                  </li>
                  {publishedPages.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/p/${p.slug}`}
                        className="text-white/70 hover:text-[var(--luxury-gold)] transition-colors"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </>
              ) : null}
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-[var(--luxury-gold)]">{merged.footerMiddleColumnTitle}</h4>
            <ul className="space-y-2">
              {merged.footerMiddleLinks.map((link) => (
                <li key={link.id}>
                  <StorefrontNavAnchor
                    link={link}
                    adminHref={adminSiteHref}
                    className="text-white/70 hover:text-[var(--luxury-gold)] transition-colors"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 text-[var(--luxury-gold)]">{merged.footerContactColumnTitle}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--luxury-gold)] mt-1 shrink-0" />
                <span className="text-white/70">{merged.footerContactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--luxury-gold)] shrink-0" />
                <span className="text-white/70">{merged.footerContactPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--luxury-gold)] shrink-0" />
                <a href={`mailto:${merged.footerContactEmail}`} className="text-white/70 hover:text-[var(--luxury-gold)]">
                  {merged.footerContactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm text-center md:text-left">{merged.footerText}</p>
            <nav className="flex gap-6 text-sm flex-wrap justify-center items-center">
              {merged.footerLegalLinks.map((link) => (
                <StorefrontNavAnchor
                  key={link.id}
                  link={link}
                  adminHref={adminSiteHref}
                  className="text-white/50 hover:text-[var(--luxury-gold)] transition-colors"
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
