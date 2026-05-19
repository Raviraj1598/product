import type { PageBandWidth, PageBuilderColumn, PageBuilderRow } from '../types';

function rand(prefix: string) {
  try {
    return `${prefix}_${crypto.randomUUID().slice(0, 10)}`;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export function clampSpan(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 12;
  return Math.min(12, Math.max(1, Math.round(v)));
}

/** When spans don’t sum to 12 or are malformed, divide evenly across columns. */
export function ensureColumnSpansSumTwelve(columns: PageBuilderColumn[]): PageBuilderColumn[] {
  const n = columns.length;
  if (n <= 0) return [];
  if (n === 1) return [{ ...columns[0], span: 12 }];

  const sum = columns.reduce((a, c) => a + clampSpan(c.span), 0);
  if (sum === 12) {
    return columns.map((c) => ({ ...c, span: clampSpan(c.span) }));
  }

  const base = Math.floor(12 / n);
  let remainder = 12 - base * n;
  return columns.map((c, i) => ({
    ...c,
    span: base + (i < remainder ? 1 : 0),
  }));
}

/** User adjusts one column span; siblings absorb the remainder evenly. */
export function assignColumnDesktopSpan(
  columns: PageBuilderColumn[],
  index: number,
  desiredRaw: number,
): PageBuilderColumn[] {
  const n = columns.length;
  if (n <= 0) return [];
  if (n === 1) return [{ ...columns[0], span: 12 }];
  const desired = Math.min(11, Math.max(1, Math.round(desiredRaw)));
  const otherCount = n - 1;
  let remainingForOthers = 12 - desired;
  if (remainingForOthers < otherCount) remainingForOthers = otherCount;

  const base = Math.floor(remainingForOthers / otherCount);
  let rem = remainingForOthers - base * otherCount;

  let extra = rem;
  return columns.map((c, i) => {
    if (i === index) return { ...c, span: desired };
    const bump = extra > 0 ? 1 : 0;
    if (extra > 0) extra -= 1;
    return { ...c, span: base + bump };
  });
}

export function coercePageBand(raw: unknown): PageBandWidth {
  if (raw === 'full' || raw === 'narrow' || raw === 'content') return raw;
  return 'content';
}

export function coerceGutter(raw: unknown): 'comfortable' | 'compact' {
  return raw === 'compact' ? 'compact' : 'comfortable';
}

export function createEmptyPageBuilderRow(band?: PageBandWidth): PageBuilderRow {
  return {
    id: rand('row'),
    title: '',
    bandWidth: band ?? 'content',
    gutter: 'comfortable',
    columns: [{ id: rand('col'), span: 12, blocks: [] }],
  };
}

export function halveIntoTwoSixSpanColumns(blocks: PageBlock[]): PageBuilderColumn[] {
  const mid = Math.ceil(blocks.length / 2);
  return [
    { id: rand('col'), span: 6, blocks: blocks.slice(0, mid) },
    { id: rand('col'), span: 6, blocks: blocks.slice(mid) },
  ];
}
