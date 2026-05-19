/* Magento 2 Page Builder-inspired canvas: draggable widgets + row / 12‑column layout */
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { BuiltPage, PageBlock, PageBuilderColumn, PageBuilderRow, PageTemplateId } from '@boutique/shared';
import {
  PAGE_TEMPLATE_IDS,
  PAGE_TEMPLATE_META,
  assignColumnDesktopSpan,
  createEmptyPageBuilderRow,
  createNewBuiltPage,
  createPageBlock,
  ensureColumnSpansSumTwelve,
  halveIntoTwoSixSpanColumns,
  sanitizePageSlug,
  useStore,
} from '@boutique/shared';
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
  LayoutTemplate,
  X,
  Columns2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { storefrontHref } from '../../lib/externalUrls';
import { BlockInspectorFields } from './page-builder/BlockInspectorFields';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

export const PB_WIDGET = 'boutique/pagebuilder/widget';
export const PB_BLOCK = 'boutique/pagebuilder/move-block';

type WidgetDragPayload = { type: typeof PB_WIDGET; widgetKind: PageBlock['type'] };

type MoveBlockPayload = {
  type: typeof PB_BLOCK;
  blockId: string;
  fromRowId: string;
  fromColId: string;
};

const BLOCK_ADD: { kind: PageBlock['type']; label: string }[] = [
  { kind: 'hero', label: 'Hero' },
  { kind: 'text', label: 'Text' },
  { kind: 'image', label: 'Image' },
  { kind: 'productGrid', label: 'Products' },
  { kind: 'quote', label: 'Quote' },
  { kind: 'ctaStripe', label: 'CTA band' },
  { kind: 'divider', label: 'Divider' },
  { kind: 'spacer', label: 'Spacer' },
];

const LG_PREVIEW: Record<number, string> = {
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

function replaceBlock(blocks: PageBlock[], bid: string, next: PageBlock) {
  return blocks.map((b) => (b.id === bid ? next : b));
}

function nextUniqueSlug(base: string, pages: BuiltPage[], exceptId?: string) {
  const raw = sanitizePageSlug(base) || 'page';
  let candidate = raw;
  let i = 2;
  while (pages.some((p) => p.slug === candidate && p.id !== exceptId)) {
    candidate = `${raw}-${i++}`;
  }
  return candidate;
}

/** Remove first occurrence of block id anywhere in page clone */
function pluckBlock(page: BuiltPage, blockId: string): { next: BuiltPage; block: PageBlock | null } {
  const next = structuredClone(page) as BuiltPage;
  for (const r of next.rows) {
    for (const c of r.columns) {
      const ix = c.blocks.findIndex((b) => b.id === blockId);
      if (ix >= 0) {
        const [blk] = c.blocks.splice(ix, 1);
        return { next, block: blk ?? null };
      }
    }
  }
  return { next, block: null };
}

function appendToColumn(page: BuiltPage, rowId: string, colId: string, block: PageBlock): BuiltPage {
  const next = structuredClone(page) as BuiltPage;
  const row = next.rows.find((r) => r.id === rowId);
  const col = row?.columns.find((c) => c.id === colId);
  if (!row || !col) return page;
  col.blocks.push(block);
  return next;
}

function relocateBlock(page: BuiltPage, blockId: string, toRow: string, toCol: string): BuiltPage {
  const { next, block } = pluckBlock(page, blockId);
  if (!block) return page;
  if (!next.rows.some((r) => r.id === toRow)) return page;
  return appendToColumn(next, toRow, toCol, block);
}

/** Column span edit — keeps sibling column totals sane */
function setColumnSpanRow(row: PageBuilderRow, colIndex: number, spanDesired: number): PageBuilderRow {
  const cols = structuredClone(row.columns) as PageBuilderColumn[];
  if (!cols[colIndex]) return row;
  const updated = assignColumnDesktopSpan(cols, colIndex, spanDesired).map((c) => ({
    ...c,
    span: Math.min(12, Math.max(1, Math.round(c.span))),
  }));
  return { ...row, columns: ensureColumnSpansSumTwelve(updated) };
}

function PaletteWidget({ kind, label }: { kind: PageBlock['type']; label: string }) {
  const [, dragRef] = useDrag(
    () => ({
      type: PB_WIDGET,
      item: (): WidgetDragPayload => ({ type: PB_WIDGET, widgetKind: kind }),
      collect: (m) => ({ dragging: m.isDragging() }),
    }),
    [kind],
  );

  return (
    <button
      type="button"
      ref={dragRef}
      className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-900 hover:bg-white cursor-grab active:cursor-grabbing"
    >
      {label}
      <GripVertical className="w-4 h-4 text-gray-500" aria-hidden />
    </button>
  );
}

function DraggableBlockChip({
  block,
  fromRowId,
  fromColId,
  children,
}: {
  block: PageBlock;
  fromRowId: string;
  fromColId: string;
  children: ReactNode;
}) {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: PB_BLOCK,
      item: (): MoveBlockPayload => ({
        type: PB_BLOCK,
        blockId: block.id,
        fromRowId,
        fromColId,
      }),
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [block.id, fromColId, fromRowId],
  );

  return (
    <div ref={dragRef} className="rounded-xl border bg-white shadow-sm overflow-hidden mb-4" style={{ opacity: isDragging ? 0.45 : 1 }}>
      {children}
    </div>
  );
}

export default function PageBuilderEditorShell() {
  return (
    <DndProvider backend={HTML5Backend}>
      <PageBuilderEditorInner />
    </DndProvider>
  );
}

function PageBuilderEditorInner() {
  const { builtPages, setBuiltPages, categories } = useStore();
  const sorted = useMemo(() => [...builtPages].sort((a, b) => a.title.localeCompare(b.title)), [builtPages]);

  const [selectedId, setSelectedId] = useState<string | null>(() => sorted[0]?.id ?? null);
  const [pickTemplateOpen, setPickTemplateOpen] = useState(false);

  useEffect(() => {
    if (selectedId && !builtPages.some((p) => p.id === selectedId)) {
      setSelectedId(sorted[0]?.id ?? builtPages[0]?.id ?? null);
    }
  }, [builtPages, selectedId, sorted]);

  const selected = builtPages.find((p) => p.id === selectedId) ?? null;

  const patchPage = (pageId: string, fn: (p: BuiltPage) => BuiltPage) => {
    setBuiltPages((prev) => prev.map((pg) => (pg.id !== pageId ? pg : fn(pg))));
  };

  const createFromTemplate = (t: PageTemplateId) => {
    const pg = createNewBuiltPage(t);
    pg.slug = nextUniqueSlug(pg.slug, builtPages);
    setBuiltPages((prev) => [...prev, pg]);
    setSelectedId(pg.id);
    setPickTemplateOpen(false);
  };

  const deletePage = (pageId: string) => {
    const pg = builtPages.find((p) => p.id === pageId);
    if (!pg) return;
    if (!confirm(`Delete "${pg.title}" (/p/${pg.slug})?`)) return;
    const remaining = builtPages.filter((x) => x.id !== pageId);
    setBuiltPages(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  function isRecordLike(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
  }

  const onDropToColumn = (pageId: string, rowId: string, colId: string, item: unknown) => {
    const isWidgetPayload = (v: unknown): v is WidgetDragPayload =>
      isRecordLike(v) && v.type === PB_WIDGET && typeof (v as { widgetKind?: unknown }).widgetKind === 'string';
    const isMovePayload = (v: unknown): v is MoveBlockPayload =>
      isRecordLike(v) && v.type === PB_BLOCK && typeof (v as { blockId?: unknown }).blockId === 'string';

    patchPage(pageId, (curr) => {
      if (curr.id !== pageId) return curr;
      let pg = structuredClone(curr) as BuiltPage;

      if (isWidgetPayload(item)) {
        const blk = createPageBlock(item.widgetKind);
        pg = appendToColumn(pg, rowId, colId, blk);
      } else if (isMovePayload(item)) {
        if (!(item.fromRowId === rowId && item.fromColId === colId)) {
          pg = relocateBlock(pg, item.blockId, rowId, colId);
        }
      }

      return pg;
    });
  };

  const patchColumn = (pageId: string, rowId: string, colId: string, fn: (c: PageBuilderColumn) => PageBuilderColumn) => {
    patchPage(pageId, (p) => ({
      ...p,
      rows: p.rows.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              columns: r.columns.map((c) => (c.id !== colId ? c : fn(c))),
            },
      ),
    }));
  };

  const patchRow = (pageId: string, rowId: string, fn: (r: PageBuilderRow) => PageBuilderRow) => {
    patchPage(pageId, (p) => ({
      ...p,
      rows: p.rows.map((r) => (r.id === rowId ? fn(r) : r)),
    }));
  };

  const moveRow = (pageId: string, ix: number, dir: -1 | 1) => {
    patchPage(pageId, (p) => {
      const nr = [...p.rows];
      const j = ix + dir;
      if (j < 0 || j >= nr.length) return p;
      [nr[ix], nr[j]] = [nr[j], nr[ix]];
      return { ...p, rows: nr };
    });
  };

  const addRowBelow = (pageId: string, band: PageBuilderRow['bandWidth']) => {
    patchPage(pageId, (p) => ({ ...p, rows: [...p.rows, createEmptyPageBuilderRow(band)] }));
  };

  const removeRow = (pageId: string, rid: string) => {
    patchPage(pageId, (p) => {
      if (p.rows.length <= 1) return p;
      return { ...p, rows: p.rows.filter((r) => r.id !== rid) };
    });
  };

  const split5050ActiveRow = (pageId: string, rowId: string) => {
    patchPage(pageId, (p) => ({
      ...p,
      rows: p.rows.map((r) => {
        if (r.id !== rowId || r.columns.length !== 1) return r;
        const blocks = r.columns[0].blocks;
        if (blocks.length <= 1) return r;
        return { ...r, columns: ensureColumnSpansSumTwelve(halveIntoTwoSixSpanColumns(blocks)) };
      }),
    }));
  };

  const addColumn = (pageId: string, rowId: string) => {
    patchPage(pageId, (p) => ({
      ...p,
      rows: p.rows.map((r) => {
        if (r.id !== rowId) return r;
        const cols = [...r.columns, { id: crypto.randomUUID().slice(0, 12), span: 4, blocks: [] as PageBlock[] }];
        return { ...r, columns: ensureColumnSpansSumTwelve(cols as PageBuilderColumn[]) };
      }),
    }));
  };

  const removeColumn = (pageId: string, rowId: string, colId: string) => {
    patchPage(pageId, (p) => ({
      ...p,
      rows: p.rows.map((r) => {
        if (r.id !== rowId || r.columns.length <= 1) return r;
        const idx = r.columns.findIndex((c) => c.id === colId);
        if (idx < 0) return r;
        const orphanBlocks = [...r.columns[idx].blocks];
        const kept = r.columns.filter((c) => c.id !== colId);
        kept[Math.max(0, idx - 1)].blocks.push(...orphanBlocks);
        return { ...r, columns: ensureColumnSpansSumTwelve(kept.map((c) => ({ ...c }))) };
      }),
    }));
  };

  const moveBlockLocal = (
    pageId: string,
    rowId: string,
    colId: string,
    blockIndex: number,
    dir: -1 | 1,
  ) => {
    patchColumn(pageId, rowId, colId, (c) => {
      const nb = [...c.blocks];
      const j = blockIndex + dir;
      if (j < 0 || j >= nb.length) return c;
      [nb[blockIndex], nb[j]] = [nb[j], nb[blockIndex]];
      return { ...c, blocks: nb };
    });
  };

  const removeBlockCell = (pageId: string, rowId: string, colId: string, bid: string) => {
    patchColumn(pageId, rowId, colId, (c) => ({ ...c, blocks: c.blocks.filter((x) => x.id !== bid) }));
  };

  const blockHeading = (b: PageBlock) => {
    if (b.type === 'ctaStripe') return 'CTA stripe';
    if (b.type === 'productGrid') return 'product grid';
    return b.type;
  };

  const ColumnCanvas = ({
    pageId,
    rowId,
    col,
    colIndex,
  }: {
    pageId: string;
    rowId: string;
    col: PageBuilderColumn;
    colIndex: number;
  }) => {
    const [{ isOver }, dropRef] = useDrop(
      () => ({
        accept: [PB_WIDGET, PB_BLOCK],
        drop: (item: unknown) => {
          onDropToColumn(pageId, rowId, col.id, item);
        },
        collect: (m) => ({
          isOver: m.isOver({ shallow: true }),
        }),
      }),
      [col.id, pageId, rowId],
    );

    const spanCls = LG_PREVIEW[Math.min(12, Math.max(1, col.span || 12))] ?? LG_PREVIEW[12];

    const rowRef = selected?.rows.find((r) => r.id === rowId);
    const columnCount = rowRef?.columns.length ?? 1;

    return (
      <div
        ref={dropRef}
        className={`col-span-12 min-h-[140px] border-2 border-dashed px-3 py-3 rounded-xl transition-colors ${spanCls} ${isOver ? 'border-teal-500 bg-teal-50/70' : 'border-gray-200 bg-gray-50/60'}`}
      >
        <div className="flex justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{col.blocks.length ? 'Column' : 'Drop zone'}</span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-600 flex items-center gap-2">
              span
              {columnCount <= 1 ? (
                <span className="rounded border px-2 py-0.5 text-xs bg-gray-100 text-gray-700">12 /12 (full width)</span>
              ) : (
                <select
                  className="rounded border px-1 py-0.5 text-xs"
                  value={Math.min(11, Math.max(1, col.span))}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!selected) return;
                    patchRow(selected.id, rowId, (rr) =>
                      setColumnSpanRow(rr, colIndex, Number.isFinite(v) ? v : rr.columns[colIndex]?.span ?? 6),
                    );
                  }}
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} /12
                    </option>
                  ))}
                </select>
              )}
            </label>
            {(rowRef?.columns.length ?? 0) > 1 ? (
              <button
                type="button"
                className="text-[11px] text-red-600 hover:underline"
                onClick={() => removeColumn(pageId, rowId, col.id)}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {col.blocks.length === 0 ? (
          <p className="text-xs text-center text-gray-500 py-6">Drag a widget here from the palette, or reposition an existing block.</p>
        ) : (
          col.blocks.map((blk, ix) => (
            <DraggableBlockChip key={blk.id} block={blk} fromRowId={rowId} fromColId={col.id}>
              <div className="flex items-start justify-between border-b px-3 py-2 bg-gray-100">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-gray-600">
                  <Eye className="w-4 h-4 opacity-70" aria-hidden /> {blockHeading(blk)}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="disabled:opacity-30 p-1"
                    disabled={ix === 0}
                    onClick={() => moveBlockLocal(pageId, rowId, col.id, ix, -1)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="disabled:opacity-30 p-1"
                    disabled={ix === col.blocks.length - 1}
                    onClick={() => moveBlockLocal(pageId, rowId, col.id, ix, 1)}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-red-600"
                    onClick={() => removeBlockCell(pageId, rowId, col.id, blk.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <BlockInspectorFields
                  b={blk}
                  categories={categories}
                  patch={(next) =>
                    patchColumn(pageId, rowId, col.id, (cc) => ({ ...cc, blocks: replaceBlock(cc.blocks, blk.id, next) }))
                  }
                />
              </div>
            </DraggableBlockChip>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {pickTemplateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-gray-200">
            <button
              type="button"
              className="absolute top-4 right-4 rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
              onClick={() => setPickTemplateOpen(false)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <LayoutTemplate className="w-8 h-8" /> Start from a blueprint
            </h2>
            <p className="text-gray-600 text-sm mb-8 max-w-2xl leading-relaxed">
              Pick a scaffold — Magento / WordPress block editors behave the same: load a blueprint, drag components, rearrange stacked rows & columns beneath.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {PAGE_TEMPLATE_IDS.map((tid) => {
                const m = PAGE_TEMPLATE_META[tid];
                return (
                  <button
                    type="button"
                    key={tid}
                    className="text-left border-2 border-gray-100 rounded-xl p-5 hover:border-black transition-colors shadow-sm hover:shadow-lg"
                    onClick={() => createFromTemplate(tid)}
                  >
                    <div className="text-[11px] font-bold uppercase text-gray-500 tracking-[0.2em]">{tid}</div>
                    <div className="text-lg font-semibold mt-1">{m.title}</div>
                    <p className="text-sm text-gray-600 mt-2 leading-snug">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-6 justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-3 flex gap-3 items-center">
            <Layers className="w-9 h-9" /> Page builder
          </h1>
          <p className="text-gray-600 max-w-[46rem] text-sm leading-relaxed">
            Rows mirror Magento Page Builder <strong>Sections</strong>; inner columns occupy a&nbsp;
            <strong>12‑column Bootstrap-style grid</strong>. Drag toolkit widgets into any column bucket, reposition blocks between buckets, tweak spans, duplicate rows —
            storefront renders the same stacking order shoppers see live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickTemplateOpen(true)}
          className="self-start flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900"
        >
          <Plus className="w-5 h-5" />
          New page…
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        <aside className="w-full xl:w-64 shrink-0 space-y-3 xl:sticky xl:top-4 self-start">
          <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-gray-700">Toolkit</h3>
            <p className="text-[11px] text-gray-500 leading-snug">Drag into any highlighted column tray.</p>
            <div className="flex flex-col gap-2 pt-3">
              {BLOCK_ADD.map((b) => (
                <PaletteWidget key={b.kind} kind={b.kind} label={b.label} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm divide-y divide-gray-100">
            <h3 className="text-xs uppercase font-semibold tracking-widest text-gray-600 px-4 py-3">Pages</h3>
            {sorted.length === 0 ? (
              <p className="p-5 text-gray-600 text-sm">No pages yet.</p>
            ) : (
              sorted.map((pg) => (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => setSelectedId(pg.id)}
                  className={`w-full text-left px-4 py-4 text-sm border-b hover:bg-gray-50 ${selected?.id === pg.id ? 'bg-gray-900 text-white border-gray-900' : ''}`}
                >
                  <div className="font-medium">{pg.title}</div>
                  <div className={`font-mono text-[11px] ${selected?.id === pg.id ? 'text-teal-200' : 'text-gray-600'}`}>
                    /p/{pg.slug}
                  </div>
                  <div className={`text-[10px] mt-2 uppercase tracking-wide ${selected?.id === pg.id ? 'text-gray-400' : 'text-green-700'}`}>
                    {PAGE_TEMPLATE_META[pg.templateId].title}
                    {pg.published ? '' : <span className="ml-2 text-gray-500">Draft</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          {!selected ? (
            <p className="text-gray-600">Select or create a page.</p>
          ) : (
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 md:p-8 space-y-10">
              <div className="flex flex-wrap items-start gap-6 justify-between pb-8 border-b">
                <div className="space-y-4">
                  <label className="block max-w-xl">
                    <span className="text-xs uppercase font-semibold text-gray-700">Working title</span>
                    <input
                      className={`${fld} mt-2`}
                      value={selected.title}
                      onChange={(e) => patchPage(selected.id, (p) => ({ ...p, title: e.target.value }))}
                    />
                  </label>
                  <label className="block max-sm">
                    <span className="text-xs uppercase font-semibold text-gray-700">Published</span>
                    <label className="block mt-2 text-sm gap-3 flex items-center">
                      <input
                        type="checkbox"
                        checked={selected.published}
                        onChange={(e) => patchPage(selected.id, (p) => ({ ...p, published: e.target.checked }))}
                      />{' '}
                      Live storefront
                    </label>
                  </label>
                  <label className="block max-w-sm">
                    <span className="text-xs uppercase font-semibold text-gray-700">Slug</span>
                    <input
                      className={`${fld} mt-2 font-mono`}
                      value={selected.slug}
                      onBlur={() => {
                        const pid = selected.id;
                        setBuiltPages((prev) =>
                          prev.map((pg) =>
                            pg.id !== pid ? pg : { ...pg, slug: nextUniqueSlug(pg.slug, prev, pg.id) },
                          ),
                        );
                      }}
                      onChange={(e) => patchPage(selected.id, (p) => ({ ...p, slug: e.target.value }))}
                    />
                  </label>
                  <a
                    href={storefrontHref(`/p/${encodeURIComponent(selected.slug)}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex gap-2 text-sm items-center font-medium text-teal-600 hover:text-teal-800"
                  >
                    <ExternalLink className="w-4 h-4" /> View on storefront
                  </a>
                </div>

                <div className="space-y-3 min-w-[200px]">
                  <button
                    type="button"
                    className="w-full px-5 py-2 border border-gray-900 rounded-xl text-gray-900 text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() =>
                      patchPage(selected.id, (p) => ({
                        ...p,
                        templateId:
                          PAGE_TEMPLATE_IDS[(PAGE_TEMPLATE_IDS.indexOf(p.templateId) + 1) % PAGE_TEMPLATE_IDS.length]!,
                      }))
                    }
                  >
                    Rotate template
                  </button>
                  <button
                    type="button"
                    className="w-full px-5 py-2 border border-red-200 text-red-700 rounded-xl text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                    onClick={() => deletePage(selected.id)}
                  >
                    <Trash2 className="w-5 h-5" /> Trash page
                  </button>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-xs uppercase font-semibold tracking-[0.2em] text-gray-600">
                  Appearance profile — {PAGE_TEMPLATE_META[selected.templateId].title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-[44rem]">
                  {PAGE_TEMPLATE_META[selected.templateId].description}{' '}
                  <span className="italic text-gray-500">{PAGE_TEMPLATE_META[selected.templateId].storefrontHint}</span>
                </p>

                <div className="max-w-xl">
                  <select
                    className={`${fld}`}
                    value={selected.templateId}
                    onChange={(e) => patchPage(selected.id, (p) => ({ ...p, templateId: e.target.value as PageTemplateId }))}
                  >
                    {PAGE_TEMPLATE_IDS.map((tid) => (
                      <option key={tid} value={tid}>
                        {PAGE_TEMPLATE_META[tid].title}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="border-t pt-12 space-y-10">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                  <h3 className="text-xl font-semibold tracking-tight">Canvas</h3>
                  <button
                    type="button"
                    className="text-xs font-semibold border rounded-full px-4 py-2 hover:bg-black hover:text-white"
                    onClick={() => addRowBelow(selected.id, 'full')}
                  >
                    + Append full-width row
                  </button>
                </div>

                {selected.rows.map((row, ri) => (
                  <div key={row.id} className="rounded-3xl border-2 border-dashed border-gray-300 shadow-inner bg-neutral-900/[0.02]">
                    <div className="border-b px-6 py-4 flex flex-wrap items-center gap-5 justify-between bg-gradient-to-br from-neutral-950 to-neutral-900 text-white rounded-t-[22px]">
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-95">Row {ri + 1}</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={ri === 0}
                          className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 border border-transparent hover:border-white/20"
                          onClick={() => moveRow(selected.id, ri, -1)}
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          disabled={ri >= selected.rows.length - 1}
                          className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 border border-transparent hover:border-white/20"
                          onClick={() => moveRow(selected.id, ri, 1)}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          disabled={selected.rows.length <= 1}
                          className="px-3 py-1.5 text-xs uppercase font-semibold text-red-200 border border-white/40 rounded-xl hover:bg-red-600/70 disabled:opacity-30 disabled:hover:bg-transparent"
                          onClick={() => removeRow(selected.id, row.id)}
                        >
                          Remove row
                        </button>
                        <button
                          type="button"
                          className="px-4 py-1.5 text-xs uppercase font-semibold border border-teal-200 text-teal-100 rounded-xl hover:bg-teal-500/70 flex gap-2 items-center"
                          onClick={() => addColumn(selected.id, row.id)}
                        >
                          <Columns2 className="w-4 h-4" /> Add column
                        </button>
                        <button
                          type="button"
                          disabled={!(row.columns.length === 1 && row.columns[0].blocks.length > 1)}
                          className="px-4 py-1.5 text-xs uppercase font-semibold border rounded-xl border-white/30 disabled:opacity-30"
                          onClick={() => split5050ActiveRow(selected.id, row.id)}
                        >
                          Split 50/50 column
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-8">
                      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
                        <label className="block">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-[0.2em] mb-3 block">
                            Row label (optional storefront heading)
                          </span>
                          <input
                            className={`${fld}`}
                            value={row.title}
                            onChange={(e) => patchRow(selected.id, row.id, (rw) => ({ ...rw, title: e.target.value }))}
                            placeholder='e.g. "Hero", "Sizing policy"...'
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-[0.2em] mb-3 block">
                            Outer band width
                          </span>
                          <select
                            className={`${fld}`}
                            value={row.bandWidth}
                            onChange={(e) =>
                              patchRow(selected.id, row.id, (rw) => ({
                                ...rw,
                                bandWidth: e.target.value as PageBuilderRow['bandWidth'],
                              }))
                            }
                          >
                            <option value="full">Full bleed (edge-to-edge)</option>
                            <option value="content">Content gutter (~1140)</option>
                            <option value="narrow">Reading / legal column</option>
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
                        <label className="block">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-[0.2em] mb-3 block">
                            Row gutters
                          </span>
                          <select
                            className={`${fld}`}
                            value={row.gutter}
                            onChange={(e) =>
                              patchRow(selected.id, row.id, (rw) => ({
                                ...rw,
                                gutter: e.target.value === 'compact' ? 'compact' : 'comfortable',
                              }))
                            }
                          >
                            <option value="comfortable">Comfort · magazine spacing</option>
                            <option value="compact">Compact · PDP density</option>
                          </select>
                        </label>
                      </div>

                      <div
                        className={`grid gap-10 grid-cols-1 ${row.gutter === 'compact' ? 'lg:gap-8' : 'lg:gap-12'} lg:grid-cols-12`}
                      >
                        {row.columns.map((col, ci) => (
                          <ColumnCanvas key={col.id} pageId={selected.id} rowId={row.id} col={col} colIndex={ci} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
