import { Link } from 'react-router';
import type { PageBlock, PageTemplateId } from '@boutique/shared';
import type { Product } from '@boutique/shared';
import { FashionProductCard } from '../fashion/FashionProductCard';

function productsForGrid(
  products: Product[],
  block: Extract<PageBlock, { type: 'productGrid' }>,
): Product[] {
  const max = Math.max(1, Math.min(block.maxItems || 8, 24));
  let pool: Product[];
  switch (block.source) {
    case 'featured':
      pool = products.filter((p) => p.featured);
      break;
    case 'category': {
      const name = block.categoryName.trim();
      pool = name ? products.filter((p) => p.category === name) : [...products];
      break;
    }
    default:
      pool = [...products];
  }
  return pool.slice(0, max);
}

function textBlockClasses(variant: PageTemplateId) {
  switch (variant) {
    case 'story':
      return 'space-y-5 text-lg text-stone-800 leading-[1.75] tracking-tight font-serif max-w-none';
    case 'policy':
      return 'space-y-4 text-neutral-700 text-[15px] leading-7 font-sans max-w-none';
    case 'commerce':
      return 'space-y-4 text-gray-700 text-[16px] leading-relaxed font-sans max-w-none';
    default:
      return 'space-y-4 text-gray-700 leading-relaxed max-w-none';
  }
}

function textHeadingClasses(variant: PageTemplateId) {
  switch (variant) {
    case 'story':
      return 'text-3xl sm:text-4xl font-serif text-stone-900 mb-8';
    case 'policy':
      return 'text-2xl font-semibold text-neutral-900 mb-5 mt-10 first:mt-0';
    case 'commerce':
      return 'text-2xl sm:text-3xl font-bold text-[var(--luxury-maroon)] mb-6';
    default:
      return 'text-2xl sm:text-3xl font-bold text-[var(--luxury-maroon)] mb-6';
  }
}

export function StorefrontPageBlocks({
  blocks,
  products,
  pageVariant,
}: {
  blocks: PageBlock[];
  products: Product[];
  pageVariant: PageTemplateId;
}) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'hero': {
            const minH =
              pageVariant === 'story' ? 'min-h-[min(600px,88vh)]' : 'min-h-[min(520px,80vh)]';
            const align =
              block.align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';
            return (
              <section key={block.id} className={`relative ${minH} overflow-hidden flex flex-col justify-end`}>
                {block.imageUrl ? (
                  <img src={block.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--luxury-maroon)] to-[var(--luxury-gold)]" />
                )}
                <div className="absolute inset-0 bg-black/35" aria-hidden />
                <div className={`relative max-w-4xl px-6 sm:px-10 pb-14 pt-28 flex flex-col gap-5 ${align}`}>
                  <h1
                    className={`text-white drop-shadow ${
                      pageVariant === 'story'
                        ? 'text-5xl sm:text-6xl font-serif md:text-7xl tracking-tight'
                        : 'text-4xl sm:text-5xl md:text-6xl font-bold'
                    }`}
                  >
                    {block.headline}
                  </h1>
                  {block.subheadline ? (
                    <p
                      className={`text-white/90 max-w-xl drop-shadow ${pageVariant === 'story' ? 'text-xl sm:text-2xl leading-relaxed font-light' : 'text-lg sm:text-xl leading-relaxed'}`}
                    >
                      {block.subheadline}
                    </p>
                  ) : null}
                  {block.ctaLabel && block.ctaHref ? (
                    block.ctaHref.startsWith('http') ? (
                      <a
                        href={block.ctaHref}
                        className="inline-flex mt-4 px-8 py-3 rounded-full bg-white text-[var(--luxury-maroon)] font-semibold hover:bg-[var(--luxury-gold)] hover:text-white transition-colors shadow-lg self-start max-sm:self-center"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {block.ctaLabel}
                      </a>
                    ) : (
                      <Link
                        to={block.ctaHref.startsWith('/') ? block.ctaHref : `/${block.ctaHref}`}
                        className="inline-flex mt-4 px-8 py-3 rounded-full bg-white text-[var(--luxury-maroon)] font-semibold hover:bg-[var(--luxury-gold)] hover:text-white transition-colors shadow-lg self-start max-sm:self-center"
                      >
                        {block.ctaLabel}
                      </Link>
                    )
                  ) : null}
                </div>
              </section>
            );
          }
          case 'text': {
            const paras = block.body.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
            const sectionPad =
              pageVariant === 'commerce' ? 'py-10 lg:py-12' : pageVariant === 'policy' ? 'py-8' : 'py-12 lg:py-16';
            const frame = pageVariant === 'policy' ? 'max-w-none' : 'max-w-4xl';
            return (
              <section key={block.id} className={`${frame} mx-auto px-4 sm:px-6 lg:px-8 ${sectionPad}`}>
                {block.heading ? <h2 className={textHeadingClasses(pageVariant)}>{block.heading}</h2> : null}
                <div className={textBlockClasses(pageVariant)}>
                  {paras.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            );
          }
          case 'image': {
            const inner = (
              <figure className={`overflow-hidden border border-black/5 shadow-lg ${pageVariant === 'story' ? 'rounded-none sm:rounded-3xl' : 'rounded-3xl'}`}>
                {block.imageUrl ? (
                  <img src={block.imageUrl} alt={block.alt} className="w-full h-auto object-cover max-h-[70vh]" />
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Missing image URL
                  </div>
                )}
                {block.caption ? (
                  <figcaption className={`px-4 py-3 text-sm text-gray-600 ${pageVariant === 'story' ? 'bg-stone-100' : 'bg-[var(--luxury-cream)]'}`}>{block.caption}</figcaption>
                ) : null}
              </figure>
            );
            const href = block.linkHref.trim();
            return (
              <section key={block.id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {href ? (
                  href.startsWith('http') ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <Link to={href.startsWith('/') ? href : `/${href}`}>{inner}</Link>
                  )
                ) : (
                  inner
                )}
              </section>
            );
          }
          case 'productGrid': {
            const list = productsForGrid(products, block);
            const wrap =
              pageVariant === 'commerce'
                ? 'bg-white/95 py-12 border-y border-[var(--luxury-gold)]/30 shadow-inner'
                : 'bg-[var(--luxury-cream)]/35 py-14 border-y border-[var(--luxury-gold)]/20';
            return (
              <section key={block.id} className={wrap}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2
                    className={
                      pageVariant === 'commerce'
                        ? 'text-center mb-10 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--luxury-maroon)]'
                        : 'text-center text-2xl sm:text-3xl font-bold text-[var(--luxury-maroon)] mb-10'
                    }
                  >
                    {block.title.trim() || 'Shop the edit'}
                  </h2>
                  <div className={`grid gap-8 ${pageVariant === 'commerce' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                    {list.length === 0 ? (
                      <p className="text-gray-600 col-span-full text-center">No products matched this grid.</p>
                    ) : (
                      list.map((p) => <FashionProductCard key={p.id} product={p} />)
                    )}
                  </div>
                </div>
              </section>
            );
          }
          case 'ctaStripe': {
            const isGold = block.variant === 'gold';
            const bg = isGold
              ? 'from-[var(--luxury-gold)] to-yellow-700'
              : 'from-[var(--luxury-maroon)] to-[var(--luxury-red)]';
            return (
              <section key={block.id} className={`py-12 bg-gradient-to-r ${bg} text-white`}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
                  <p className="text-lg sm:text-xl font-medium">{block.text}</p>
                  {block.buttonLabel && block.href ? (
                    block.href.startsWith('http') ? (
                      <a
                        href={block.href}
                        className={`inline-flex justify-center px-8 py-3 rounded-full bg-white shadow-lg font-semibold transition-colors whitespace-nowrap ${
                          isGold ? 'text-[var(--luxury-maroon)] hover:bg-black hover:text-white' : 'text-[var(--luxury-maroon)] hover:bg-[var(--luxury-gold)]'
                        }`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {block.buttonLabel}
                      </a>
                    ) : (
                      <Link
                        to={block.href.startsWith('/') ? block.href : `/${block.href}`}
                        className={`inline-flex justify-center px-8 py-3 rounded-full bg-white shadow-lg font-semibold transition-colors whitespace-nowrap ${
                          isGold ? 'text-[var(--luxury-maroon)] hover:bg-black hover:text-white' : 'text-[var(--luxury-maroon)] hover:bg-[var(--luxury-gold)]'
                        }`}
                      >
                        {block.buttonLabel}
                      </Link>
                    )
                  ) : null}
                </div>
              </section>
            );
          }
          case 'quote':
            return (
              <aside
                key={block.id}
                className={`max-w-3xl mx-auto px-6 py-16 text-center ${pageVariant === 'story' ? 'border-y border-stone-200 bg-white/50' : 'border-y border-[var(--luxury-gold)]/40 bg-[var(--luxury-cream)]/60'}`}
              >
                <blockquote
                  className={`${pageVariant === 'story' ? 'font-serif text-3xl sm:text-4xl text-stone-900 leading-snug tracking-tight' : 'font-serif italic text-2xl sm:text-3xl text-[var(--luxury-maroon)]'}`}
                >
                  {block.quote}
                </blockquote>
                {block.attribution.trim() ? (
                  <cite className="mt-8 block text-sm font-medium uppercase tracking-widest text-stone-500 not-italic">
                    {block.attribution}
                  </cite>
                ) : null}
              </aside>
            );
          case 'divider':
            return (
              <div key={block.id} className="flex justify-center py-10 px-4">
                {block.variant === 'ornament' ? (
                  <span className="flex items-center gap-3 text-[var(--luxury-gold)] opacity-85" aria-hidden>
                    ✦ <span className="w-28 h-[1px] bg-[var(--luxury-gold)]/55" /> ✦
                  </span>
                ) : (
                  <hr className="max-w-xl w-full border-t border-neutral-300" />
                )}
              </div>
            );
          case 'spacer':
            return <div key={block.id} style={{ height: block.heightPx }} aria-hidden />;
          default:
            return null;
        }
      })}
    </>
  );
}
