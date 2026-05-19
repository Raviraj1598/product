import type { PageBlock, Category } from '@boutique/shared';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

/** Small presentational inspector used by Magento-style canvas */
export function BlockInspectorFields(props: {
  b: PageBlock;
  categories: Category[];
  patch: (next: PageBlock) => void;
}) {
  const { b, categories, patch } = props;

  switch (b.type) {
    case 'hero':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-600">Headline</span>
            <input className={`${fld} mt-1`} value={b.headline} onChange={(e) => patch({ ...b, headline: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-600">Subheadline</span>
            <input className={`${fld} mt-1`} value={b.subheadline} onChange={(e) => patch({ ...b, subheadline: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-600">Image URL</span>
            <input className={`${fld} mt-1`} value={b.imageUrl} onChange={(e) => patch({ ...b, imageUrl: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">CTA label</span>
            <input className={`${fld} mt-1`} value={b.ctaLabel} onChange={(e) => patch({ ...b, ctaLabel: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">CTA link</span>
            <input className={`${fld} mt-1`} value={b.ctaHref} onChange={(e) => patch({ ...b, ctaHref: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-600">Alignment</span>
            <select className={`${fld} mt-1`} value={b.align} onChange={(e) => patch({ ...b, align: e.target.value === 'center' ? 'center' : 'left' })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
          </label>
        </div>
      );
    case 'text':
      return (
        <div className="grid gap-3">
          <label className="block">
            <span className="text-xs text-gray-600">Heading (optional)</span>
            <input className={`${fld} mt-1`} value={b.heading} onChange={(e) => patch({ ...b, heading: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Body — blank line starts new paragraph</span>
            <textarea className={`${fld} mt-1 font-mono text-xs min-h-[160px]`} value={b.body} onChange={(e) => patch({ ...b, body: e.target.value })} />
          </label>
        </div>
      );
    case 'image':
      return (
        <div className="grid gap-3">
          <label className="block">
            <span className="text-xs text-gray-600">Image URL</span>
            <input className={`${fld} mt-1`} value={b.imageUrl} onChange={(e) => patch({ ...b, imageUrl: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Alt</span>
            <input className={`${fld} mt-1`} value={b.alt} onChange={(e) => patch({ ...b, alt: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Caption</span>
            <input className={`${fld} mt-1`} value={b.caption} onChange={(e) => patch({ ...b, caption: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Link (optional)</span>
            <input className={`${fld} mt-1`} value={b.linkHref} onChange={(e) => patch({ ...b, linkHref: e.target.value })} />
          </label>
        </div>
      );
    case 'productGrid':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-gray-600">Title</span>
            <input className={`${fld} mt-1`} value={b.title} onChange={(e) => patch({ ...b, title: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Max items</span>
            <input
              type="number"
              min={1}
              max={24}
              className={`${fld} mt-1`}
              value={b.maxItems}
              onChange={(e) => patch({ ...b, maxItems: Math.min(24, Math.max(1, parseInt(e.target.value, 10) || 8)) })}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-gray-600">Source</span>
            <select className={`${fld} mt-1`} value={b.source} onChange={(e) => patch({ ...b, source: e.target.value as typeof b.source })}>
              <option value="featured">Featured</option>
              <option value="category">Category filter</option>
              <option value="all">All (first N)</option>
            </select>
          </label>
          {b.source === 'category' ? (
            <label className="block sm:col-span-2">
              <span className="text-xs text-gray-600">Category</span>
              <select
                className={`${fld} mt-1`}
                value={(categories.some((c) => c.name === b.categoryName) ? b.categoryName : categories[0]?.name) ?? ''}
                onChange={(e) => patch({ ...b, categoryName: e.target.value })}
              >
                {!categories?.length ? <option value="">— define categories —</option> : null}
                {categories?.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      );
    case 'ctaStripe':
      return (
        <div className="grid gap-3">
          <label className="block">
            <span className="text-xs text-gray-600">Text</span>
            <input className={`${fld} mt-1`} value={b.text} onChange={(e) => patch({ ...b, text: e.target.value })} />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-600">Button label</span>
              <input className={`${fld} mt-1`} value={b.buttonLabel} onChange={(e) => patch({ ...b, buttonLabel: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs text-gray-600">Href</span>
              <input className={`${fld} mt-1`} value={b.href} onChange={(e) => patch({ ...b, href: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-gray-600">Style</span>
            <select className={`${fld} mt-1`} value={b.variant} onChange={(e) => patch({ ...b, variant: e.target.value === 'gold' ? 'gold' : 'maroon' })}>
              <option value="gold">Gold gradient</option>
              <option value="maroon">Maroon gradient</option>
            </select>
          </label>
        </div>
      );
    case 'quote':
      return (
        <div className="grid gap-3">
          <label className="block">
            <span className="text-xs text-gray-600">Quote</span>
            <textarea className={`${fld} mt-1`} rows={4} value={b.quote} onChange={(e) => patch({ ...b, quote: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs text-gray-600">Attribution</span>
            <input className={`${fld} mt-1`} value={b.attribution} onChange={(e) => patch({ ...b, attribution: e.target.value })} />
          </label>
        </div>
      );
    case 'divider':
      return (
        <label className="block max-w-sm">
          <span className="text-xs text-gray-600">Style</span>
          <select className={`${fld} mt-1`} value={b.variant} onChange={(e) => patch({ ...b, variant: e.target.value === 'ornament' ? 'ornament' : 'line' })}>
            <option value="line">Simple rule</option>
            <option value="ornament">Ornament (✦ · ✦)</option>
          </select>
        </label>
      );
    case 'spacer':
      return (
        <label className="block max-w-xs">
          <span className="text-xs text-gray-600">Height px</span>
          <input
            type="number"
            min={8}
            max={240}
            className={`${fld} mt-1`}
            value={b.heightPx}
            onChange={(e) => patch({ ...b, heightPx: Math.min(240, Math.max(8, parseInt(e.target.value, 10) || 48)) })}
          />
        </label>
      );
    default:
      return null;
  }
}
