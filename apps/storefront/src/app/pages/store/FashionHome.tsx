import { motion } from 'motion/react';
import { Scissors, Sparkles, Package, Award } from 'lucide-react';
import { FashionHeroSplit } from '../../components/fashion/FashionHeroSplit';
import { FashionProductCard } from '../../components/fashion/FashionProductCard';
import { FashionCollectionBanner } from '../../components/fashion/FashionCollectionBanner';
import { FashionNewsletter } from '../../components/fashion/FashionNewsletter';
import { FashionTailoringCta } from '../../components/fashion/FashionTailoringCta';
import { useMemo } from 'react';
import { useStore, resolveCategorySlug } from '@boutique/shared';
import type { Category } from '@boutique/shared';

export default function FashionHome() {
  const { products, categories, settings } = useStore();

  const trending = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const wr = (b.rating || 0) - (a.rating || 0);
        return wr !== 0 ? wr : Number(b.featured) - Number(a.featured);
      })
      .slice(0, 6);
  }, [products]);

  const banners = useMemo(() => pairCategoriesForBanners(categories), [categories]);

  const features = [
    {
      icon: Scissors,
      title: 'Custom tailoring',
      description: 'Alterations roadmap—pair with measurements at checkout milestones.',
    },
    {
      icon: Package,
      title: 'Reliable fulfilment',
      description: `Free shipping tiers from $${settings.freeShippingMin} before tax.`,
    },
    {
      icon: Award,
      title: 'Premium quality',
      description: 'Handpicked palettes, embroideries, and curated catalogs from admin.',
    },
    {
      icon: Sparkles,
      title: 'Exclusive edits',
      description: 'Feature drops directly from `/admin/products`.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FashionHeroSplit />

      <section className="py-20 bg-gradient-to-b from-white to-[var(--luxury-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--luxury-maroon)] to-[var(--luxury-gold)] rounded-2xl mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-[var(--luxury-maroon)] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="trending-picks" className="py-20 bg-[var(--luxury-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--luxury-maroon)] mb-4">{settings.storefrontTitle}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{settings.storefrontSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trending.map((product) => (
              <FashionProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {banners.map((b, i) => (
            <FashionCollectionBanner key={`${b.title}-${i}`} {...b} />
          ))}
        </div>
      </section>

      <FashionTailoringCta />
      <FashionNewsletter />
    </div>
  );
}

function pairCategoriesForBanners(categories: Category[]) {
  const visible = categories.filter((c) => c.published !== false);
  const withVisual = visible.filter((c) => (c.image && c.description) || c.description);
  if (withVisual.length >= 2) {
    return withVisual.slice(0, 2).map((c, idx) => ({
      title: c.name,
      subtitle: 'Collection spotlight',
      description: c.description,
      shopHref: `/shop?category=${encodeURIComponent(resolveCategorySlug(c))}`,
      image:
        c.image ||
        [defaultBannerA, defaultBannerB][idx] ||
        defaultBannerA,
      reverse: idx % 2 === 1,
    }));
  }

  return [
    {
      title: 'Festive rotations',
      subtitle: 'Limited edition',
      description:
        'Mirror-work Chaniya silhouettes refreshed every season—see live availability on the `/shop` feed.',
      image: defaultBannerA,
      reverse: false,
      shopHref: '/shop',
    },
    {
      title: 'Bridal luxury',
      subtitle: 'Signature couture',
      description:
        'Layer ornate lehengas with jewelry-ready palettes. Stock levels pull directly from admin inventory.',
      image: defaultBannerB,
      reverse: true,
      shopHref: '/shop',
    },
  ];
}

const defaultBannerA =
  'https://images.unsplash.com/photo-1774437897985-9a7f1b7867a8?w=1080&q=80&fit=max';

const defaultBannerB =
  'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=1080&q=80&fit=max';
