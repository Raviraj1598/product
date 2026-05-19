import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { StorefrontNavLink, StoreSettings, StoreSocialLink } from '@boutique/shared';
import {
  defaultFooterLegalLinks,
  defaultFooterMiddleLinks,
  defaultFooterShopLinks,
  defaultFooterSocialLinks,
  defaultHeaderNavLinks,
  mergeStoreSettings,
  useStore,
} from '@boutique/shared';
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

function newLink(): StorefrontNavLink {
  return {
    id: `ln_${crypto.randomUUID().slice(0, 10)}`,
    label: 'New link',
    href: '/shop',
  };
}

function LinkListEditor({
  title,
  hint,
  links,
  onChange,
}: {
  title: string;
  hint: string;
  links: StorefrontNavLink[];
  onChange: (next: StorefrontNavLink[]) => void;
}) {
  const bump = (ix: number, patch: Partial<StorefrontNavLink>) => {
    const next = [...links];
    next[ix] = { ...next[ix], ...patch } as StorefrontNavLink;
    onChange(next);
  };

  const move = (ix: number, dir: -1 | 1) => {
    const j = ix + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[ix], next[j]] = [next[j], next[ix]];
    onChange(next);
  };

  return (
    <div className="border rounded-xl p-5 bg-white space-y-4">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">{hint}</p>
      </div>
      <div className="space-y-3">
        {links.map((row, ix) => (
          <div
            key={row.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <div className="lg:col-span-3">
              <label className="text-[10px] font-bold uppercase text-gray-500">Label</label>
              <input className={fld} value={row.label} onChange={(e) => bump(ix, { label: e.target.value })} />
            </div>
            <div className="lg:col-span-4">
              <label className="text-[10px] font-bold uppercase text-gray-500">URL or path</label>
              <input
                className={`${fld} font-mono text-xs`}
                value={row.href}
                onChange={(e) => bump(ix, { href: e.target.value })}
                placeholder="/shop or https://…"
              />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Style</label>
              <select
                className={fld}
                value={row.variant ?? 'default'}
                onChange={(e) =>
                  bump(ix, {
                    variant: e.target.value === 'cta' ? 'cta' : 'default',
                  })
                }
              >
                <option value="default">Text link</option>
                <option value="cta">CTA button</option>
              </select>
            </div>
            <label className="lg:col-span-2 flex items-center gap-2 text-sm pt-7">
              <input
                type="checkbox"
                checked={!!row.openInAdmin}
                onChange={(e) => bump(ix, { openInAdmin: e.target.checked })}
              />
              Admin app
            </label>
            <div className="lg:col-span-1 flex flex-col gap-1 pt-6">
              <button
                type="button"
                className="p-1 rounded border bg-white disabled:opacity-30"
                disabled={ix === 0}
                onClick={() => move(ix, -1)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 rounded border bg-white disabled:opacity-30"
                disabled={ix === links.length - 1}
                onClick={() => move(ix, 1)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="lg:col-span-12 flex justify-end">
              <button
                type="button"
                className="text-red-600 text-sm inline-flex items-center gap-1 hover:underline"
                onClick={() => onChange(links.filter((_, i) => i !== ix))}
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...links, newLink()])}
        className="text-sm inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" /> Add link
      </button>
    </div>
  );
}

export default function AdminHeaderFooter() {
  const { settings, setSettings } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(() => mergeStoreSettings(settings));

  useEffect(() => {
    setDraft(mergeStoreSettings(settings));
  }, [settings]);

  const m = mergeStoreSettings(draft);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(draft);
    toast.success('Header & footer saved');
  };

  const patchSocial = (ix: number, patch: Partial<StoreSocialLink>) => {
    const next = [...m.footerSocialLinks];
    next[ix] = { ...next[ix], ...patch } as StoreSocialLink;
    setDraft((d) => ({ ...d, footerSocialLinks: next }));
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Header &amp; footer</h1>
        <p className="text-gray-600 max-w-2xl">
          Edit storefront chrome without touching code. Top promo still uses <strong>Announcement bar</strong> from{' '}
          <Link to="/settings" className="text-black font-medium underline">
            Store settings
          </Link>
          .
        </p>
      </div>

      <form onSubmit={save} className="space-y-10">
        <section className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Header</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium">Logo glyph (1 character)</span>
              <input
                className={`${fld} mt-2 text-center text-2xl`}
                maxLength={3}
                value={m.headerLogoGlyph}
                onChange={(e) => setDraft((d) => ({ ...d, headerLogoGlyph: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Tagline under store name</span>
              <input
                className={`${fld} mt-2`}
                value={m.headerTagline}
                onChange={(e) => setDraft((d) => ({ ...d, headerTagline: e.target.value }))}
              />
            </label>
          </div>

          <LinkListEditor
            title="Main navigation"
            hint="Internal paths like /shop or full URLs. “Admin app” opens your admin SPA (same as old hard-coded Admin link)."
            links={m.headerNavLinks}
            onChange={(headerNavLinks) => setDraft((d) => ({ ...d, headerNavLinks }))}
          />
        </section>

        <section className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold">Footer</h2>

          <label className="block max-w-3xl">
            <span className="text-sm font-medium">Brand blurb (column 1)</span>
            <textarea
              rows={3}
              className={`${fld} mt-2`}
              value={m.footerBrandBlurb}
              onChange={(e) => setDraft((d) => ({ ...d, footerBrandBlurb: e.target.value }))}
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Shop column title</span>
              <input
                className={`${fld} mt-2`}
                value={m.footerShopColumnTitle}
                onChange={(e) => setDraft((d) => ({ ...d, footerShopColumnTitle: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Middle column title</span>
              <input
                className={`${fld} mt-2`}
                value={m.footerMiddleColumnTitle}
                onChange={(e) => setDraft((d) => ({ ...d, footerMiddleColumnTitle: e.target.value }))}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">Contact column title</span>
              <input
                className={`${fld} mt-2 max-w-md`}
                value={m.footerContactColumnTitle}
                onChange={(e) => setDraft((d) => ({ ...d, footerContactColumnTitle: e.target.value }))}
              />
            </label>
          </div>

          <LinkListEditor
            title={m.footerShopColumnTitle || 'Shop links'}
            hint="Typically collection shortcuts."
            links={m.footerShopLinks}
            onChange={(footerShopLinks) => setDraft((d) => ({ ...d, footerShopLinks }))}
          />

          <LinkListEditor
            title={m.footerMiddleColumnTitle || 'Middle column links'}
            hint="Support / admin shortcuts — use “Admin app” for cross-origin admin URLs."
            links={m.footerMiddleLinks}
            onChange={(footerMiddleLinks) => setDraft((d) => ({ ...d, footerMiddleLinks }))}
          />

          <div className="border rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold">Contact block</h3>
            <label className="block">
              <span className="text-sm font-medium">Address line</span>
              <input
                className={`${fld} mt-2`}
                value={m.footerContactAddress}
                onChange={(e) => setDraft((d) => ({ ...d, footerContactAddress: e.target.value }))}
              />
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Phone</span>
                <input
                  className={`${fld} mt-2`}
                  value={m.footerContactPhone}
                  onChange={(e) => setDraft((d) => ({ ...d, footerContactPhone: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  className={`${fld} mt-2`}
                  value={m.footerContactEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, footerContactEmail: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="border rounded-xl p-5 space-y-3">
            <h3 className="text-base font-semibold">Social profiles</h3>
            <p className="text-xs text-gray-600">Leave URL empty to hide an icon on the storefront.</p>
            <div className="grid gap-3">
              {m.footerSocialLinks.map((s, ix) => (
                <div key={s.platform} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm font-medium w-28 capitalize">{s.platform}</span>
                  <input
                    className={`${fld} sm:flex-1 font-mono text-xs`}
                    placeholder="https://…"
                    value={s.url}
                    onChange={(e) => patchSocial(ix, { url: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <LinkListEditor
            title="Legal / utility row"
            hint="Shown next to the copyright line (e.g. Privacy, Terms)."
            links={m.footerLegalLinks}
            onChange={(footerLegalLinks) => setDraft((d) => ({ ...d, footerLegalLinks }))}
          />

          <p className="text-xs text-gray-500">
            Bottom copyright sentence stays in <strong>Store settings → Footer text</strong>.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-900"
          >
            <Save className="w-5 h-5" />
            Save header &amp; footer
          </button>
          <button
            type="button"
            className="px-6 py-3 border rounded-xl text-sm hover:bg-gray-100"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                headerNavLinks: defaultHeaderNavLinks(),
                footerShopLinks: defaultFooterShopLinks(),
                footerMiddleLinks: defaultFooterMiddleLinks(),
                footerSocialLinks: defaultFooterSocialLinks(),
                footerLegalLinks: defaultFooterLegalLinks(),
              }))
            }
          >
            Reset link presets only
          </button>
        </div>
      </form>
    </div>
  );
}
