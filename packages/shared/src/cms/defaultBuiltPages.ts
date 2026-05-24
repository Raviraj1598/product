import type { BuiltPage, PageBlock, PageBuilderRow } from '../types';

function text(id: string, heading: string, body: string): PageBlock {
  return { id, type: 'text', heading, body };
}

function divider(id: string): PageBlock {
  return { id, type: 'divider', variant: 'line' };
}

function policyRow(slug: string, blocks: PageBlock[]): PageBuilderRow {
  return {
    id: `row_${slug}`,
    title: '',
    bandWidth: 'narrow',
    gutter: 'compact',
    columns: [{ id: `col_${slug}`, span: 12, blocks }],
  };
}

function policyPage(
  slug: string,
  title: string,
  seoDescription: string,
  sections: Array<{ heading: string; body: string }>,
): BuiltPage {
  const blocks: PageBlock[] = [];
  sections.forEach((s, i) => {
    if (i > 0) blocks.push(divider(`div_${slug}_${i}`));
    blocks.push(text(`txt_${slug}_${i}`, s.heading, s.body));
  });
  return {
    id: `page_default_${slug}`,
    slug,
    title,
    seoDescription,
    published: true,
    templateId: 'policy',
    rows: [policyRow(slug, blocks)],
  };
}

/** Standard storefront CMS pages — editable in Admin → Page builder. */
export function defaultBuiltPages(): BuiltPage[] {
  return [
    {
      id: 'page_default_about',
      slug: 'about',
      title: 'About GiftJoy',
      seoDescription: 'How GiftJoy curates thoughtful gifts and trusted partner picks.',
      published: true,
      templateId: 'story',
      rows: [
        {
          id: 'row_about_hero',
          title: '',
          bandWidth: 'full',
          gutter: 'comfortable',
          columns: [
            {
              id: 'col_about_hero',
              span: 12,
              blocks: [
                {
                  id: 'hero_about',
                  type: 'hero',
                  headline: 'Gifts that feel personal',
                  subheadline: 'We blend in-house favourites with curated affiliate picks so you find the right present faster.',
                  imageUrl:
                    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80',
                  ctaLabel: 'Browse gifts',
                  ctaHref: '/shop',
                  align: 'center',
                },
                text(
                  'about_intro',
                  'Our story',
                  'GiftJoy started with a simple idea: gifting should feel thoughtful, not stressful.\n\nWe handpick products for birthdays, anniversaries, and everyday celebrations. Some items ship from our own catalog; others link to trusted partner stores through affiliate partnerships—always clearly labelled.',
                ),
                {
                  id: 'quote_about',
                  type: 'quote',
                  quote: '“The best gifts match the moment—not just the price tag.”',
                  attribution: 'GiftJoy team',
                },
              ],
            },
          ],
        },
        {
          id: 'row_about_details',
          title: 'What we stand for',
          bandWidth: 'content',
          gutter: 'comfortable',
          columns: [
            {
              id: 'col_about_details',
              span: 12,
              blocks: [
                divider('div_about_1'),
                text(
                  'about_curated',
                  'Curated, not cluttered',
                  'Every collection is edited for quality, occasion, and value. We avoid endless scroll—favourites rise to the top.',
                ),
                divider('div_about_2'),
                text(
                  'about_hybrid',
                  'In-store + partner picks',
                  'Order in-stock gifts directly from GiftJoy. For partner items, we send you to Amazon or other affiliates with our tracking tag—purchase and support happen on their site.',
                ),
              ],
            },
          ],
        },
      ],
    },
    policyPage('contact', 'Contact us', 'Reach GiftJoy support by email or phone.', [
      {
        heading: 'We would love to hear from you',
        body: 'Questions about an order, a product, or a partner link? Our team typically replies within one business day.',
      },
      {
        heading: 'Email',
        body: 'hello@giftjoy.store\n\nInclude your order number if you checked out on GiftJoy.',
      },
      {
        heading: 'Phone',
        body: '+1 (555) 010-9988\n\nMon–Fri, 9am–6pm (local time).',
      },
      {
        heading: 'Address',
        body: 'GiftJoy HQ\nServing gift lovers worldwide',
      },
    ]),
    policyPage('faq', 'FAQ', 'Common questions about GiftJoy orders, shipping, and affiliate picks.', [
      {
        heading: 'Do you sell everything on GiftJoy?',
        body: 'Some products are sold and fulfilled by GiftJoy. Others are partner picks—clicking “Buy on Amazon” (or similar) takes you to that store. We may earn a commission at no extra cost to you.',
      },
      {
        heading: 'Can I add affiliate products to my cart?',
        body: 'No. Partner items open in a new tab on the partner site. Only in-store products use our cart and checkout.',
      },
      {
        heading: 'Shipping & returns',
        body: 'In-store orders follow our shipping and return policy on the Shipping & returns page. Partner purchases follow that store’s policies.',
      },
      {
        heading: 'Gift wrap',
        body: 'Complimentary gift wrap is available on eligible in-store orders over the free-shipping threshold.',
      },
    ]),
    policyPage('shipping', 'Shipping & returns', 'GiftJoy shipping timelines and return policy for in-store orders.', [
      {
        heading: 'In-store orders',
        body: 'Orders placed through GiftJoy checkout are packed within 1–2 business days. Standard delivery is 3–7 business days depending on location.',
      },
      {
        heading: 'Free shipping',
        body: 'Free shipping applies to qualifying in-store orders above the threshold shown in the site header.',
      },
      {
        heading: 'Returns',
        body: 'Unused in-store items may be returned within 30 days of delivery unless marked final sale. Contact us with your invoice number to start a return.',
      },
      {
        heading: 'Affiliate / partner purchases',
        body: 'Items bought on Amazon or other partners are not fulfilled by GiftJoy. Returns and warranties are handled by the partner store.',
      },
    ]),
    policyPage('privacy', 'Privacy policy', 'How GiftJoy handles your personal information.', [
      {
        heading: 'Overview',
        body: 'We collect information you provide at checkout (name, email, address) to fulfil orders and send updates. We do not sell your personal data.',
      },
      {
        heading: 'Cookies & analytics',
        body: 'We may use cookies to remember your cart and improve the site. Partner sites have their own privacy policies when you leave GiftJoy.',
      },
      {
        heading: 'Contact',
        body: 'Privacy questions: hello@giftjoy.store',
      },
    ]),
    policyPage('terms', 'Terms of use', 'Terms for using the GiftJoy storefront.', [
      {
        heading: 'Using this site',
        body: 'Content and prices may change without notice. You must provide accurate checkout information for in-store orders.',
      },
      {
        heading: 'Affiliate links',
        body: 'Outbound links to partners are provided for convenience. GiftJoy is not the seller for those items and is not responsible for partner fulfilment.',
      },
      {
        heading: 'Limitation',
        body: 'GiftJoy is provided “as is” to the extent permitted by law. See our shipping and privacy pages for order-specific terms.',
      },
    ]),
    policyPage(
      'affiliate-disclosure',
      'Affiliate disclosure',
      'FTC-style disclosure for GiftJoy affiliate links.',
      [
        {
          heading: 'Transparency',
          body: 'GiftJoy participates in affiliate programs. When you click a partner link and make a purchase, we may earn a commission at no additional cost to you.',
        },
        {
          heading: 'How it works',
          body: 'Partner product pages show a platform badge (e.g. Amazon). The outbound URL includes our affiliate tracking parameter so the partner can attribute the referral.',
        },
        {
          heading: 'Our promise',
          body: 'Recommendations are curated for quality and relevance—not driven solely by commission rates. Prices and availability are confirmed on the partner site at checkout.',
        },
      ],
    ),
  ];
}

export const DEFAULT_PAGE_SLUGS = defaultBuiltPages().map((p) => p.slug);
