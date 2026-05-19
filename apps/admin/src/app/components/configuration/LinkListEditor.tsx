import type { StorefrontNavLink } from '@boutique/shared';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { configFld } from './ConfigPrimitives';

function newLink(): StorefrontNavLink {
  return {
    id: `ln_${crypto.randomUUID().slice(0, 10)}`,
    label: 'New link',
    href: '/shop',
  };
}

export function LinkListEditor({
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
    <div className="border border-gray-300 rounded-sm p-4 bg-[#fafafa] space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      </div>
      <div className="space-y-3">
        {links.map((row, ix) => (
          <div
            key={row.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start p-3 rounded-sm bg-white border border-gray-200"
          >
            <div className="lg:col-span-3">
              <label className="text-[10px] font-bold uppercase text-gray-500">Label</label>
              <input className={configFld} value={row.label} onChange={(e) => bump(ix, { label: e.target.value })} />
            </div>
            <div className="lg:col-span-4">
              <label className="text-[10px] font-bold uppercase text-gray-500">URL or path</label>
              <input
                className={`${configFld} font-mono text-xs`}
                value={row.href}
                onChange={(e) => bump(ix, { href: e.target.value })}
                placeholder="/shop or https://…"
              />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase text-gray-500">Style</label>
              <select
                className={configFld}
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
        className="text-sm inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-900 hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" /> Add link
      </button>
    </div>
  );
}
