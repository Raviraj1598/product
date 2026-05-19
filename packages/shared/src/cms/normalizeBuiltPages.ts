import type {
  BuiltPage,
  CtaStripePageBlock,
  DividerPageBlock,
  HeroPageBlock,
  ImagePageBlock,
  PageBlock,
  PageBuilderColumn,
  PageBuilderRow,
  PageTemplateId,
  ProductGridPageBlock,
  QuotePageBlock,
  SpacerPageBlock,
  TextPageBlock,
} from '../types';
import {
  clampSpan,
  coerceGutter,
  coercePageBand,
  createEmptyPageBuilderRow,
  ensureColumnSpansSumTwelve,
  halveIntoTwoSixSpanColumns,
} from './pageBuilderRows';
import { PAGE_TEMPLATE_IDS, PAGE_TEMPLATE_META, createPageFromTemplate } from './pageTemplates';

function randId(prefix: string) {
  try {
    return `${prefix}_${crypto.randomUUID().slice(0, 10)}`;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function coerceBlock(raw: unknown, fallbackId: string): PageBlock | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : fallbackId;

  switch (raw.type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        headline: typeof raw.headline === 'string' ? raw.headline : 'Untitled',
        subheadline: typeof raw.subheadline === 'string' ? raw.subheadline : '',
        imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : '',
        ctaLabel: typeof raw.ctaLabel === 'string' ? raw.ctaLabel : 'Shop now',
        ctaHref: typeof raw.ctaHref === 'string' ? raw.ctaHref : '/shop',
        align: raw.align === 'center' ? 'center' : 'left',
      };
    case 'text':
      return {
        id,
        type: 'text',
        heading: typeof raw.heading === 'string' ? raw.heading : '',
        body: typeof raw.body === 'string' ? raw.body : '',
      };
    case 'image':
      return {
        id,
        type: 'image',
        imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : '',
        alt: typeof raw.alt === 'string' ? raw.alt : '',
        caption: typeof raw.caption === 'string' ? raw.caption : '',
        linkHref: typeof raw.linkHref === 'string' ? raw.linkHref : '',
      };
    case 'productGrid':
      return {
        id,
        type: 'productGrid',
        title: typeof raw.title === 'string' ? raw.title : 'Shop the edit',
        source: raw.source === 'category' || raw.source === 'all' ? raw.source : 'featured',
        categoryName: typeof raw.categoryName === 'string' ? raw.categoryName : '',
        maxItems:
          typeof raw.maxItems === 'number' && raw.maxItems > 0 ? Math.min(24, Math.floor(raw.maxItems)) : 8,
      };
    case 'ctaStripe':
      return {
        id,
        type: 'ctaStripe',
        text: typeof raw.text === 'string' ? raw.text : '',
        buttonLabel: typeof raw.buttonLabel === 'string' ? raw.buttonLabel : 'Learn more',
        href: typeof raw.href === 'string' ? raw.href : '/shop',
        variant: raw.variant === 'gold' ? 'gold' : 'maroon',
      };
    case 'spacer':
      return {
        id,
        type: 'spacer',
        heightPx:
          typeof raw.heightPx === 'number' && raw.heightPx > 0 ? Math.min(240, Math.floor(raw.heightPx)) : 48,
      };
    case 'quote':
      return {
        id,
        type: 'quote',
        quote: typeof raw.quote === 'string' ? raw.quote : '',
        attribution: typeof raw.attribution === 'string' ? raw.attribution : '',
      };
    case 'divider':
      return {
        id,
        type: 'divider',
        variant: raw.variant === 'ornament' ? 'ornament' : 'line',
      };
    default:
      return null;
  }
}

function coerceTemplateId(raw: unknown): PageTemplateId {
  const t = typeof raw === 'string' ? raw : '';
  return PAGE_TEMPLATE_IDS.includes(t as PageTemplateId) ? (t as PageTemplateId) : 'campaign';
}

function coerceColumn(raw: unknown, fb: string): PageBuilderColumn | null {
  if (!isRecord(raw)) return null;
  const blocksIn = Array.isArray(raw.blocks) ? raw.blocks : [];
  const blocks: PageBlock[] = [];
  blocksIn.forEach((b, i) => {
    const n = coerceBlock(b, randId(`blk_${i}`));
    if (n) blocks.push(n);
  });
  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : fb,
    span: clampSpan(raw.span),
    blocks,
  };
}

function coerceRow(raw: unknown, fbRow: string): PageBuilderRow | null {
  if (!isRecord(raw)) return null;
  const columnsIn = Array.isArray(raw.columns) ? raw.columns : [];
  const columns: PageBuilderColumn[] =
    columnsIn.length > 0
      ? columnsIn
          .map((c, i) => coerceColumn(c, randId(`col_${i}`)))
          .filter((x): x is PageBuilderColumn => x !== null)
      : [{ id: randId('col'), span: 12, blocks: [] }];

  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : fbRow,
    title: typeof raw.title === 'string' ? raw.title : '',
    bandWidth:
      raw.bandWidth !== undefined
        ? coercePageBand(raw.bandWidth)
        : coercePageBand((raw as { maxWidth?: unknown; width?: unknown }).maxWidth ?? (raw as { width?: unknown }).width),
    gutter: coerceGutter(raw.gutter),
    columns: ensureColumnSpansSumTwelve(columns),
  };
}

function legacyBlocks(record: Record<string, unknown>): PageBlock[] {
  const blocksIn = Array.isArray(record.blocks) ? record.blocks : [];
  const blocks: PageBlock[] = [];
  blocksIn.forEach((b, i) => {
    const n = coerceBlock(b, randId(`blk_${i}`));
    if (n) blocks.push(n);
  });
  return blocks;
}

/** Migrate v1 persisted `sections` tree into stacked rows/columns grid */
function migrateLegacySectionsToRows(sectionsRaw: unknown, templateId: PageTemplateId): PageBuilderRow[] {
  if (!Array.isArray(sectionsRaw)) return [];
  return sectionsRaw.map((sec, i): PageBuilderRow => {
    const s = isRecord(sec) ? sec : {};
    const blocks: PageBlock[] = [];
    if (Array.isArray(s.blocks)) {
      s.blocks.forEach((b, j) => {
        const n = coerceBlock(b, randId(`lb_${j}`));
        if (n) blocks.push(n);
      });
    }
    const legBand = coercePageBand(s.width);
    const title = typeof s.title === 'string' ? s.title : '';
    const twoCol = s.columns === 'two' && blocks.length > 1;
    const gutter = coerceGutter(s.gutter);
    const cols = twoCol ? halveIntoTwoSixSpanColumns(blocks) : [{ id: randId('col'), span: 12, blocks }];
    const bandWidth = templateId === 'policy' ? 'narrow' : legBand;
    return {
      id: `${typeof s.id === 'string' && s.id.length ? s.id : `sec_${i}`}_row`,
      title,
      bandWidth,
      gutter,
      columns: ensureColumnSpansSumTwelve(cols),
    };
  });
}

function rowsFromPersistedEnvelope(record: Record<string, unknown>, templateId: PageTemplateId): PageBuilderRow[] {
  if (Array.isArray(record.rows)) {
    const rows = record.rows
      .map((r, i) => coerceRow(r, randId(`row_${i}`)))
      .filter((row): row is PageBuilderRow => row !== null);
    if (rows.length > 0) return rows.map((rw) => ({ ...rw, columns: ensureColumnSpansSumTwelve(rw.columns) }));
  }
  const migrated = migrateLegacySectionsToRows(record.sections, templateId);
  if (migrated.length > 0) return migrated;
  return [
    {
      id: randId('row'),
      title: '',
      bandWidth: templateId === 'policy' ? 'narrow' : 'full',
      gutter: 'comfortable',
      columns: ensureColumnSpansSumTwelve([{ id: randId('col'), span: 12, blocks: legacyBlocks(record) }]),
    },
  ];
}

export function sanitizePageSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function normalizeBuiltPages(parsed: unknown): BuiltPage[] {
  if (!Array.isArray(parsed)) return [];

  const out: BuiltPage[] = [];
  for (const envelope of parsed) {
    if (!isRecord(envelope)) continue;
    const id = typeof envelope.id === 'string' && envelope.id.length > 0 ? envelope.id : randId('page');
    const slugRaw = typeof envelope.slug === 'string' ? sanitizePageSlug(envelope.slug) : '';
    const slug = slugRaw || 'page';
    const templateId = coerceTemplateId(envelope.templateId);

    out.push({
      id,
      slug,
      title: typeof envelope.title === 'string' ? envelope.title : 'Untitled page',
      seoDescription: typeof envelope.seoDescription === 'string' ? envelope.seoDescription : '',
      published: typeof envelope.published === 'boolean' ? envelope.published : false,
      templateId,
      rows: rowsFromPersistedEnvelope(envelope, templateId),
    });
  }

  return dedupeBuiltPagesBySlug(out);
}

export function dedupeBuiltPagesBySlug(pages: BuiltPage[]): BuiltPage[] {
  const seen = new Map<string, BuiltPage>();
  for (const p of pages) {
    seen.set(p.slug, { ...p, slug: sanitizePageSlug(p.slug) });
  }
  return [...seen.values()];
}

export function createNewBuiltPage(templateId: PageTemplateId): BuiltPage {
  const { templateId: t, rows } = createPageFromTemplate(templateId);
  return {
    id: randId('page'),
    slug: 'new-page',
    title: `New ${PAGE_TEMPLATE_META[t].title}`,
    seoDescription: '',
    published: false,
    templateId: t,
    rows,
  };
}

/** @deprecated Use {@link createNewBuiltPage}`('campaign')` */
export function createBlankBuiltPage(): BuiltPage {
  return createNewBuiltPage('campaign');
}

function defaultHeroBlock(): HeroPageBlock {
  return {
    id: randId('hero'),
    type: 'hero',
    headline: 'Your headline',
    subheadline: 'Add imagery and supporting copy.',
    imageUrl:
      'https://images.unsplash.com/photo-1574631804130-0a34d7bcc2f9?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Shop now',
    ctaHref: '/shop',
    align: 'center',
  };
}

function defaultTextBlock(): TextPageBlock {
  return {
    id: randId('text'),
    type: 'text',
    heading: 'Heading',
    body: 'Paragraphs separated by blank lines render as separate storefront paragraphs.',
  };
}

export function createPageBlock(kind: PageBlock['type']): PageBlock {
  switch (kind) {
    case 'hero':
      return defaultHeroBlock();
    case 'text':
      return defaultTextBlock();
    case 'image': {
      const b: ImagePageBlock = {
        id: randId('img'),
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        alt: 'Visual',
        caption: '',
        linkHref: '',
      };
      return b;
    }
    case 'productGrid': {
      const b: ProductGridPageBlock = {
        id: randId('grid'),
        type: 'productGrid',
        title: 'Featured picks',
        source: 'featured',
        categoryName: '',
        maxItems: 8,
      };
      return b;
    }
    case 'ctaStripe': {
      const b: CtaStripePageBlock = {
        id: randId('cta'),
        type: 'ctaStripe',
        text: 'Ready to browse the full catalogue?',
        buttonLabel: 'Go to shop',
        href: '/shop',
        variant: 'gold',
      };
      return b;
    }
    case 'spacer': {
      return { id: randId('spacer'), type: 'spacer', heightPx: 48 };
    }
    case 'quote': {
      return {
        id: randId('quote'),
        type: 'quote',
        quote: '“Craft a standout quote.”',
        attribution: 'Attribution line',
      };
    }
    case 'divider': {
      return { id: randId('div'), type: 'divider', variant: 'line' };
    }
    default: {
      const _n: never = kind;
      return _n;
    }
  }
}


