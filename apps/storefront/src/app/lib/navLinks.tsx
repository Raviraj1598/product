import type { StorefrontNavLink } from '@boutique/shared';
import { Link } from 'react-router';

/** Internal route, outbound https, or admin SPA (when {@link StorefrontNavLink.openInAdmin}). */
export function StorefrontNavAnchor({
  link,
  adminHref,
  className,
}: {
  link: StorefrontNavLink;
  adminHref: (path: string) => string;
  className?: string;
}) {
  const cls = className ?? '';
  if (link.openInAdmin) {
    return (
      <a href={adminHref(link.href || '/')} className={cls}>
        {link.label}
      </a>
    );
  }
  if (/^https?:\/\//i.test(link.href)) {
    return (
      <a href={link.href} className={cls} target="_blank" rel="noreferrer noopener">
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.href || '/'} className={cls}>
      {link.label}
    </Link>
  );
}
