import type { BuiltPage, PageBlock, PageBuilderColumn, PageBuilderRow, PageTemplateId } from '../types';
import { ensureColumnSpansSumTwelve } from './pageBuilderRows';

function randId(prefix: string) {
  try {
    return `${prefix}_${crypto.randomUUID().slice(0, 10)}`;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export const PAGE_TEMPLATE_IDS: readonly PageTemplateId[] = ['campaign', 'story', 'commerce', 'policy'] as const;

export const PAGE_TEMPLATE_META: Record<
  PageTemplateId,
  { title: string; description: string; storefrontHint: string }
> = {
  campaign: {
    title: 'Campaign / promo',
    description: 'Row + column canvases tuned for sweeping heroes & announcement strips.',
    storefrontHint: 'Use full-band rows when you want unboxed heroes; stack additional rows underneath.',
  },
  story: {
    title: 'Editorial / story',
    description: 'Narratives with pull quotes — multiple rows imitate magazine spreads.',
    storefrontHint: 'Combine full-width visuals with narrower reading rows for balance.',
  },
  commerce: {
    title: 'Shop landing',
    description: 'Grids dominate — scaffold starts with teaser text + curated products.',
    storefrontHint: 'Keep rows on “content band” so merchandising aligns with PDP rhythm.',
  },
  policy: {
    title: 'Policy / info',
    description: 'Reading-first layout presets — narrow bands for legal/disclaimer copy.',
    storefrontHint: 'Narrow bands simulate CMS static pages consumers expect.',
  },
};

function col(span: number, blocks: PageBlock[]): PageBuilderColumn {
  return { id: randId('col'), span, blocks };
}

function heroDefaults(): Extract<PageBlock, { type: 'hero' }> {
  return {
    id: randId('hero'),
    type: 'hero',
    headline: 'Headline here',
    subheadline: 'Supporting message for your campaign or story.',
    imageUrl:
      'https://images.unsplash.com/photo-1574631804130-0a34d7bcc2f9?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Shop collection',
    ctaHref: '/shop',
    align: 'center',
  };
}

function textDefaults(heading: string, body: string): Extract<PageBlock, { type: 'text' }> {
  return {
    id: randId('text'),
    type: 'text',
    heading,
    body,
  };
}

function stripeMaroon(): Extract<PageBlock, { type: 'ctaStripe' }> {
  return {
    id: randId('stripe'),
    type: 'ctaStripe',
    text: 'Browse newest arrivals curated for your audience.',
    buttonLabel: 'Shop now',
    href: '/shop',
    variant: 'maroon',
  };
}

function row(title: string, bandWidth: PageBuilderRow['bandWidth'], gutter: PageBuilderRow['gutter'], columns: PageBuilderColumn[]): PageBuilderRow {
  return {
    id: randId('row'),
    title,
    bandWidth,
    gutter,
    columns: ensureColumnSpansSumTwelve(columns),
  };
}

/** Fresh scaffolding per template — mirrors Magento Page Builder stacked rows */
export function createPageFromTemplate(templateId: PageTemplateId): Pick<BuiltPage, 'rows' | 'templateId'> {
  switch (templateId) {
    case 'campaign':
      return {
        templateId,
        rows: [
          row('', 'full', 'comfortable', [col(12, [heroDefaults(), textDefaults('Why shoppers choose us', 'Add your narrative.\n\nSecond paragraph.')])]),
          row('', 'full', 'comfortable', [col(12, [stripeMaroon()])]),
        ],
      };
    case 'story': {
      const coverBlocks: PageBlock[] = [
        heroDefaults(),
        textDefaults('', 'Tell the story behind the drop. Paragraph breaks create pacing.'),
        {
          id: randId('qt'),
          type: 'quote',
          quote: '“Craft, color, ceremony — distilled into wearable art.”',
          attribution: 'Creative director',
        },
        {
          id: randId('img'),
          type: 'image',
          imageUrl:
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80',
          alt: 'Editorial imagery',
          caption: 'Behind the loom',
          linkHref: '',
        },
      ];
      return {
        templateId,
        rows: [
          row('Spotlight', 'full', 'comfortable', [col(12, coverBlocks)]),
          row(
            'Details',
            'content',
            'comfortable',
            [col(12, [{ id: randId('div'), type: 'divider', variant: 'ornament' }, textDefaults('Designer notes', 'Add milestones / care.')])],
          ),
        ],
      };
    }
    case 'commerce':
      return {
        templateId,
        rows: [
          row(
            '',
            'content',
            'compact',
            [
              col(12, [
                textDefaults('Curated edits', 'Tease collection intent + reason to browse.'),
                {
                  id: randId('grid'),
                  type: 'productGrid',
                  title: 'Top picks',
                  source: 'featured',
                  categoryName: '',
                  maxItems: 8,
                },
                {
                  id: randId('stripe'),
                  type: 'ctaStripe',
                  text: 'Need the entire catalogue?',
                  buttonLabel: 'Open shop',
                  href: '/shop',
                  variant: 'gold',
                },
              ]),
            ],
          ),
        ],
      };
    case 'policy':
      return {
        templateId,
        rows: [
          row(
            '',
            'narrow',
            'compact',
            [
              col(
                12,
                [
                  textDefaults(
                    'Information',
                    'Use paragraphs for FAQs, disclaimers or shipping timelines.\n\nBlank line ⇒ new paragraph storefront.',
                  ),
                  { id: randId('div'), type: 'divider', variant: 'line' },
                  textDefaults('Reach us', 'Support contacts + hours.'),
                ],
              ),
            ],
          ),
        ],
      };
    default: {
      const _e: never = templateId;
      return _e;
    }
  }
}
