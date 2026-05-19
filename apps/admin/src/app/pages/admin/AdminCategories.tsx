import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  slugifyCategoryName,
  resolveCategorySlug,
  useStore,
  type Category,
  type StorefrontNavLink,
  type StoreSettings,
} from '@boutique/shared';
import { GripVertical, ImageIcon, Layers, Package, Plus, Pencil, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

/** When a category slug changes, rewrite matching `?category=` query params on nav links. */
function remapCategorySlugInHref(href: string, oldSlug: string, newSlug: string): string {
  if (!href.includes('category')) return href;
  try {
    const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(href);
    const u = hasProtocol ? new URL(href) : new URL(href, 'https://placeholder.invalid');
    const cur = u.searchParams.get('category');
    if (cur == null) return href;
    const decoded = decodeURIComponent(cur.replace(/\+/g, '%20'));
    if (decoded !== oldSlug && cur !== oldSlug) return href;
    u.searchParams.set('category', newSlug);
    if (hasProtocol) return u.href;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return href.replace(
      `category=${encodeURIComponent(oldSlug)}`,
      `category=${encodeURIComponent(newSlug)}`,
    );
  }
}

function remapNavLinks(links: StorefrontNavLink[], oldSlug: string, newSlug: string): StorefrontNavLink[] {
  return links.map((row) => ({ ...row, href: remapCategorySlugInHref(row.href, oldSlug, newSlug) }));
}

/** Header/footer storefront links pointing at stale `?category=` values after a slug change. */
function remapSettingsCategorySlug(oldSlug: string, newSlug: string, s: StoreSettings): StoreSettings {
  return {
    ...s,
    headerNavLinks: remapNavLinks(s.headerNavLinks, oldSlug, newSlug),
    footerShopLinks: remapNavLinks(s.footerShopLinks, oldSlug, newSlug),
    footerMiddleLinks: remapNavLinks(s.footerMiddleLinks, oldSlug, newSlug),
    footerLegalLinks: remapNavLinks(s.footerLegalLinks, oldSlug, newSlug),
  };
}

function categoryImagePreview(url: string) {
  const trimmed = url?.trim();
  if (!trimmed) return <ImageIcon className="w-8 h-8 text-gray-400" />;
  return <img src={trimmed} alt="" className="w-14 h-14 rounded-lg object-cover border" />;
}

export default function AdminCategories() {
  const { categories, setCategories, products, setProducts, settings, setSettings } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [draft, setDraft] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    sortOrder: 0,
    published: true,
  });

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  );

  useEffect(() => {
    const nextSlug = slugifyCategoryName(draft.name);
    if (!editing && !draft.slug.trim()) {
      setDraft((d) => ({ ...d, slug: nextSlug }));
    }
  }, [draft.name, draft.slug, editing]);

  const productCountFor = (name: string) => products.filter((p) => p.category === name).length;

  const openNew = () => {
    setEditing(null);
    const maxOrder = sorted.reduce((m, c) => Math.max(m, c.sortOrder ?? 0), -1);
    setDraft({
      name: '',
      slug: '',
      description: '',
      image: '',
      sortOrder: maxOrder + 1,
      published: true,
    });
    setSheetOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setDraft({
      name: c.name,
      slug: c.slug ?? resolveCategorySlug(c),
      description: c.description ?? '',
      image: c.image ?? '',
      sortOrder: c.sortOrder ?? 0,
      published: c.published !== false,
    });
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditing(null);
  };

  const validateSlugUnique = (slug: string, selfId?: string) => {
    const target = slug.trim() || slugifyCategoryName(draft.name);
    return !categories.some(
      (c) => c.id !== selfId && resolveCategorySlug({ name: c.name, slug: c.slug }) === target,
    );
  };

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      toast.error('Category name required');
      return;
    }

    let slug =
      draft.slug.trim() ||
      slugifyCategoryName(name) ||
      `cat-${crypto.randomUUID().slice(0, 6)}`;
    slug = slugifyCategoryName(slug.replace(/[^\w\s-]/g, '-'));

    const selfId = editing?.id;
    if (!validateSlugUnique(slug, selfId)) {
      toast.error('Slug already used by another category');
      return;
    }

    const patch: Omit<Category, 'id'> = {
      name,
      slug,
      description: draft.description.trim(),
      image: draft.image.trim() || undefined,
      sortOrder: Number.isFinite(draft.sortOrder) ? draft.sortOrder : 0,
      published: draft.published,
    };

    if (editing) {
      const prevSlug = resolveCategorySlug(editing);
      if (prevSlug !== slug) {
        setSettings((prev) => remapSettingsCategorySlug(prevSlug, slug, prev));
      }
      if (editing.name !== name) {
        setProducts((prev) =>
          prev.map((p) =>
            p.category === editing.name ? { ...p, category: name, updatedAt: new Date().toISOString() } : p,
          ),
        );
      }
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...patch, id: c.id } : c)));
      toast.success('Category updated · products renamed if titles changed');
    } else {
      const rec: Category = {
        ...patch,
        id: `cat_${Date.now()}`,
      };
      setCategories((prev) => [...prev, rec]);
      toast.success('Category added');
    }
    closeSheet();
  };

  const handleDelete = (c: Category) => {
    const n = productCountFor(c.name);
    if (n > 0) {
      toast.error(`Reassign ${n} products away from "${c.name}" before deleting`);
      return;
    }
    if (!confirm(`Delete category "${c.name}"?`)) return;
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
    toast.success('Category deleted');
  };

  const bumpOrder = (id: string, dir: -1 | 1) => {
    setCategories((prev) => {
      const arr = [...prev].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const i = arr.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return prev;
      const a = arr[i];
      const b = arr[j];
      const ao = a.sortOrder ?? i;
      const bo = b.sortOrder ?? j;
      return prev.map((c) => {
        if (c.id === a.id) return { ...c, sortOrder: bo };
        if (c.id === b.id) return { ...c, sortOrder: ao };
        return c;
      });
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Storefront pulls these into <strong>/shop</strong> filters (ordered, slugs in the URL). Renaming cascades{' '}
            <strong>product.category</strong> automatically.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm hover:bg-gray-900 hover:text-white transition-colors"
          >
            <Package className="w-4 h-4" /> Products
          </Link>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-900"
          >
            <Plus className="w-5 h-5" /> New category
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">
          <Layers className="w-4 h-4" /> Catalog taxonomy
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead className="text-left text-[11px] uppercase tracking-wide text-gray-500 bg-white border-b">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Appearance</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-center">Products</th>
                <th className="px-4 py-3 text-center">Visible</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {sorted.map((c) => {
                const slug = resolveCategorySlug(c);
                const n = productCountFor(c.name);
                return (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-400">
                      <GripVertical className="w-4 h-4" aria-hidden />
                    </td>
                    <td className="px-4 py-3">{categoryImagePreview(c.image ?? '')}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-600">{slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          className="p-1 rounded border hover:bg-gray-100"
                          onClick={() => bumpOrder(c.id, -1)}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded border hover:bg-gray-100"
                          onClick={() => bumpOrder(c.id, 1)}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{n}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
                          c.published !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {c.published !== false ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="p-2 rounded-lg border hover:bg-gray-900 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{editing ? `Edit "${editing.name}"` : 'New category'}</h2>
                <p className="text-xs text-gray-500 mt-1">Synced with catalog API</p>
              </div>
              <button type="button" onClick={closeSheet} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">Display name</span>
                <input
                  className={`${fld} mt-2`}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">URL slug</span>
                <input
                  className={`${fld} mt-2 font-mono text-xs`}
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase() }))}
                  placeholder="women-dresses"
                />
                <p className="text-[11px] text-gray-500 mt-2">
                  Stored as <code>?category={draft.slug.trim() || '…'}</code> · auto-filled from title for new categories
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">Description</span>
                <textarea
                  rows={3}
                  className={`${fld} mt-2`}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-800">Banner / card image URL</span>
                <input
                  className={`${fld} mt-2`}
                  placeholder="https://..."
                  value={draft.image}
                  onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-800">Sort #</span>
                  <input
                    type="number"
                    className={`${fld} mt-2`}
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value, 10) || 0 }))
                    }
                  />
                </label>
                <label className="flex items-center gap-3 mt-10">
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                  />
                  <span className="text-sm font-medium">Shown on storefront</span>
                </label>
              </div>
              {editing ? (
                <p className="text-xs bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-amber-900">
                  {productCountFor(editing.name)} product(s) use this aisle. Rename updates their{' '}
                  <code>category</code> field instantly.
                </p>
              ) : null}
            </div>
            <div className="p-6 border-t flex gap-3 bg-gray-50">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-semibold hover:bg-neutral-900"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                type="button"
                onClick={closeSheet}
                className="px-6 py-3 rounded-xl border hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
