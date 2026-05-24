import { useMemo } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  mergeStoreSettings,
  resolveHomepageSpotlightSlides,
  type HomepageCollectionSpotlight,
  type StoreSettings,
} from '@boutique/shared';
import { useStore } from '@boutique/shared';
import { configFld, ConfigFieldRow, ConfigFieldset } from './ConfigPrimitives';
import type { ConfigDraftProps } from './ConfigSectionPanels';

function patchSpotlight(
  draft: StoreSettings,
  patch: Partial<HomepageCollectionSpotlight>,
): StoreSettings {
  return {
    ...draft,
    homepageCollectionSpotlight: {
      ...mergeStoreSettings(draft).homepageCollectionSpotlight,
      ...patch,
    },
  };
}

export function HomepageSpotlightEditor({ draft, setDraft }: ConfigDraftProps) {
  const { categories } = useStore();
  const spotlight = mergeStoreSettings(draft).homepageCollectionSpotlight;

  const published = useMemo(
    () =>
      [...categories]
        .filter((c) => c.published !== false)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  );

  const previewSlides = useMemo(
    () => resolveHomepageSpotlightSlides(spotlight, categories),
    [spotlight, categories],
  );

  const selectedRows = useMemo(() => {
    if (spotlight.categoryIds.length === 0) return [];
    return spotlight.categoryIds
      .map((id) => published.find((c) => c.id === id))
      .filter(Boolean);
  }, [spotlight.categoryIds, published]);

  const toggleCategory = (id: string) => {
    const ids = spotlight.categoryIds.includes(id)
      ? spotlight.categoryIds.filter((x) => x !== id)
      : [...spotlight.categoryIds, id];
    setDraft((d) => patchSpotlight(d, { categoryIds: ids }));
  };

  const moveCategory = (id: string, dir: -1 | 1) => {
    const ids = [...spotlight.categoryIds];
    const ix = ids.indexOf(id);
    if (ix < 0) return;
    const next = ix + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[ix], ids[next]] = [ids[next], ids[ix]];
    setDraft((d) => patchSpotlight(d, { categoryIds: ids }));
  };

  return (
    <div className="space-y-6">
      <ConfigFieldset title="Collection spotlight slider">
        <ConfigFieldRow label="Show on homepage">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={spotlight.enabled}
              onChange={(e) => setDraft((d) => patchSpotlight(d, { enabled: e.target.checked }))}
            />
            Enabled
          </label>
        </ConfigFieldRow>
        <ConfigFieldRow label="Section eyebrow" comment="Small label above the section title.">
          <input
            className={configFld}
            value={spotlight.eyebrow}
            onChange={(e) => setDraft((d) => patchSpotlight(d, { eyebrow: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Section title">
          <input
            className={configFld}
            value={spotlight.title}
            onChange={(e) => setDraft((d) => patchSpotlight(d, { title: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Section description">
          <textarea
            rows={2}
            className={configFld}
            value={spotlight.description}
            onChange={(e) => setDraft((d) => patchSpotlight(d, { description: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Slide badge" comment="Shown on each slide (e.g. Collection spotlight).">
          <input
            className={configFld}
            value={spotlight.slideSubtitle}
            onChange={(e) => setDraft((d) => patchSpotlight(d, { slideSubtitle: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Button label">
          <input
            className={configFld}
            value={spotlight.buttonLabel}
            onChange={(e) => setDraft((d) => patchSpotlight(d, { buttonLabel: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Autoplay (seconds)" comment="0 = manual only.">
          <input
            type="number"
            min={0}
            max={60}
            className={`${configFld} max-w-[120px]`}
            value={spotlight.autoplaySeconds}
            onChange={(e) =>
              setDraft((d) =>
                patchSpotlight(d, { autoplaySeconds: Math.max(0, parseInt(e.target.value, 10) || 0) }),
              )
            }
          />
        </ConfigFieldRow>
      </ConfigFieldset>

      <ConfigFieldset title="Featured categories">
        <p className="text-xs text-gray-600 mb-4">
          Pick categories and drag order with arrows. Leave none selected to auto-show all published
          categories (with image or description). Category title, image, and description come from{' '}
          <strong>Catalog → Categories</strong>.
        </p>

        {published.length === 0 ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Add published categories first.
          </p>
        ) : (
          <ul className="space-y-2 border border-gray-200 rounded-lg divide-y divide-gray-100">
            {published.map((cat) => {
              const selected = spotlight.categoryIds.includes(cat.id);
              const orderIx = spotlight.categoryIds.indexOf(cat.id);
              return (
                <li
                  key={cat.id}
                  className={`flex items-center gap-3 px-3 py-2.5 ${selected ? 'bg-orange-50/60' : 'bg-white'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCategory(cat.id)}
                    aria-label={`Feature ${cat.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{cat.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {cat.image ? 'Has image' : 'No image'} · {cat.description ? 'Has description' : 'No description'}
                    </p>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-gray-400 mr-1 flex items-center gap-0.5">
                        <GripVertical className="w-3 h-3" /> #{orderIx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={orderIx === 0}
                        onClick={() => moveCategory(cat.id, -1)}
                        className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={orderIx === spotlight.categoryIds.length - 1}
                        onClick={() => moveCategory(cat.id, 1)}
                        className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {selectedRows.length > 0 && (
          <button
            type="button"
            className="mt-3 text-xs text-gray-600 underline hover:text-gray-900"
            onClick={() => setDraft((d) => patchSpotlight(d, { categoryIds: [] }))}
          >
            Clear selection (use auto mode)
          </button>
        )}

        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Preview</p>
          <p className="text-sm text-gray-700">
            {previewSlides.length === 0
              ? 'No slides — enable spotlight and add categories.'
              : `${previewSlides.length} slide(s): ${previewSlides.map((s) => s.title).join(', ')}`}
          </p>
        </div>
      </ConfigFieldset>
    </div>
  );
}
