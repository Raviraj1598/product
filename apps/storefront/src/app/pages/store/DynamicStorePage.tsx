import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import type { PageBuilderRow } from '@boutique/shared';
import { useStore } from '@boutique/shared';
import { StorefrontPageBlocks } from '../../components/cms/StorefrontPageBlocks';

const LG_COL_SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
 10: 'lg:col-span-10',
 11: 'lg:col-span-11',
 12: 'lg:col-span-12',
};

function shellClass(templateId: string) {
  switch (templateId) {
    case 'story':
      return 'cms-page cms-page-story bg-gradient-to-b from-stone-100/80 via-white to-white pb-24';
    case 'commerce':
      return 'cms-page cms-page-commerce bg-[var(--luxury-cream)]/35 pb-20';
    case 'policy':
      return 'cms-page cms-page-policy bg-neutral-50/90 pb-20';
    default:
      return 'cms-page cms-page-campaign bg-white pb-16';
  }
}

function rowBandOuterClass(band: PageBuilderRow['bandWidth']) {
  switch (band) {
    case 'narrow':
      return 'max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-10';
    case 'content':
      return 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8';
    default:
      return '';
  }
}

function rowGridGap(g: PageBuilderRow['gutter']) {
  return g === 'compact' ? 'gap-y-10 gap-x-6 lg:gap-x-10' : 'gap-y-12 gap-x-6 lg:gap-x-12';
}

function headingsFor(templateId: string, rowBand: PageBuilderRow['bandWidth']) {
  if (templateId === 'policy') return 'text-neutral-900 text-xl font-semibold tracking-tight';
  if (templateId === 'story') return 'text-stone-900 text-[11px] uppercase tracking-[0.32em] font-semibold';
  if (templateId === 'commerce') return 'text-[var(--luxury-maroon)] text-[11px] font-bold uppercase tracking-[0.3em]';
  return rowBand === 'full'
    ? 'text-[var(--luxury-maroon)] text-2xl md:text-3xl font-bold'
    : 'text-[var(--luxury-maroon)] text-xl md:text-2xl font-semibold';
}

function renderRowTitle(title: string, templateId: string, band: PageBuilderRow['bandWidth'], fullBleedHeading: boolean) {
  const t = title.trim();
  if (!t) return null;
  if (fullBleedHeading) {
    return (
      <header className="max-w-7xl mx-auto px-4 pt-14 pb-6 sm:px-6 lg:px-8">
        <h2 className={`text-center ${headingsFor(templateId, band)}`}>{t}</h2>
      </header>
    );
  }
  return (
    <header className="mb-10">
      <h2 className={`${headingsFor(templateId, band)} ${templateId === 'policy' ? 'border-b border-neutral-200 pb-3' : ''}`}>{t}</h2>
    </header>
  );
}
export default function DynamicStorePage() {
  const { slug } = useParams();
  const { builtPages, products, catalogReady, settings } = useStore();

  const page = useMemo(
    () => builtPages.find((p) => p.slug === slug && p.published),
    [builtPages, slug],
  );

  useEffect(() => {
    if (!page) return;
    document.title = `${page.title} · ${settings.siteName}`;
    const prev = settings.siteName ? `${settings.siteName}` : 'Storefront';
    return () => {
      document.title = prev;
    };
  }, [page, settings.siteName]);

  if (!catalogReady) return null;

  if (!page) {
    return (
      <div className="max-w-xl mx-auto py-28 px-4 text-center">
        <p className="text-sm uppercase tracking-wider text-[var(--luxury-maroon)] mb-2">Page</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Not available</h1>
        <p className="text-gray-600 mb-8">
          This slug is not linked to a published page yet — compose it under Admin → Page builder.
        </p>
        <Link
          to="/shop"
          className="inline-flex px-6 py-3 rounded-full bg-[var(--luxury-maroon)] text-white hover:bg-[var(--luxury-red)] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const tpl = page.templateId;

  return (
    <div className={shellClass(tpl)}>
      {page.seoDescription ? <p className="sr-only">{page.seoDescription}</p> : null}

      {page.rows.map((row) => {
        const isFullBleed = row.bandWidth === 'full';
        const bandShell = rowBandOuterClass(row.bandWidth);

        const gridInner = (
          <div className={`grid grid-cols-12 ${rowGridGap(row.gutter)}`}>
            {row.columns.map((col) => {
              const span = Math.min(12, Math.max(1, col.span || 12));
              return (
                <div key={col.id} className={`col-span-12 min-w-0 ${LG_COL_SPAN[span]}`}>
                  {col.blocks.length === 0 ? (
                    <p className="text-sm text-neutral-400 border border-dashed border-neutral-300 rounded-lg p-6 text-center mb-10">
                      Empty column
                    </p>
                  ) : (
                    <StorefrontPageBlocks blocks={col.blocks} products={products} pageVariant={tpl} />
                  )}
                </div>
              );
            })}
          </div>
        );

        return (
          <section key={row.id} aria-label={row.title || 'Page builder row'}>
            {isFullBleed ? (
              <>
                {renderRowTitle(row.title ?? '', tpl, row.bandWidth, true)}
                <div>{gridInner}</div>
              </>
            ) : (
              <div className={`py-14 ${bandShell}`}>
                {renderRowTitle(row.title ?? '', tpl, row.bandWidth, false)}
                {gridInner}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
