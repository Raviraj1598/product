import { Link } from 'react-router';
import { hasStoreLogo, mergeStoreSettings, type StoreSettings } from '@boutique/shared';
import { cn } from '../ui/utils';

type Variant = 'header' | 'footer' | 'footer-light';

type Props = {
  settings: StoreSettings;
  variant?: Variant;
  className?: string;
  asLink?: boolean;
};

function taglineClass(variant: Variant) {
  return cn(
    'uppercase font-semibold leading-snug',
    variant === 'header' &&
      'text-[10px] sm:text-[11px] text-[var(--luxury-maroon)]/70 tracking-[0.2em] mt-1',
    variant === 'footer' && 'text-[10px] tracking-[0.18em] text-[var(--luxury-gold)]/90 mt-1',
    variant === 'footer-light' &&
      'text-[10px] tracking-[0.18em] text-[var(--luxury-maroon)]/60 mt-1',
  );
}

export function StoreBrandLogo({ settings, variant = 'header', className, asLink = true }: Props) {
  const merged = mergeStoreSettings(settings);
  const logo = hasStoreLogo(merged);
  const tagline = merged.headerTagline?.trim();

  const imageClass =
    variant === 'header'
      ? 'h-11 sm:h-12 md:h-14 w-auto max-w-[min(200px,42vw)] object-contain'
      : variant === 'footer-light'
        ? 'h-9 sm:h-10 w-auto max-w-[180px] object-contain'
        : 'h-10 sm:h-11 w-auto max-w-[200px] object-contain';

  const inner = (
    <div
      className={cn(
        'min-w-0 flex flex-col',
        variant === 'footer' && !logo && 'text-white',
        variant === 'footer-light' && !logo && 'text-[var(--luxury-black)]',
      )}
    >
      {logo ? (
        <img src={merged.headerLogoUrl!.trim()} alt={merged.siteName} className={imageClass} />
      ) : (
        <>
          <p
            className={cn(
              'font-bold tracking-tight leading-none',
              variant === 'header' &&
                'text-lg sm:text-xl text-[var(--luxury-black)] group-hover:text-[var(--luxury-maroon)] transition-colors',
              variant === 'footer' && 'text-xl text-white',
              variant === 'footer-light' &&
                'text-lg text-[var(--luxury-black)] group-hover:text-[var(--luxury-maroon)] transition-colors',
            )}
          >
            {merged.siteName}
          </p>
          {tagline ? <p className={taglineClass(variant)}>{tagline}</p> : null}
        </>
      )}
      {logo && tagline ? <p className={taglineClass(variant)}>{tagline}</p> : null}
    </div>
  );

  const wrapClass = cn('flex items-center shrink-0 group', className);

  if (asLink) {
    return (
      <Link to="/" className={wrapClass}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}
