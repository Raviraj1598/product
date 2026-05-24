import { motion } from 'motion/react';
import { Gift, Sparkles, Package, Award } from 'lucide-react';
import { FashionHeroSplit } from '../../components/fashion/FashionHeroSplit';
import { FashionProductCard } from '../../components/fashion/FashionProductCard';
import { FashionCollectionSpotlight } from '../../components/fashion/FashionCollectionSpotlight';
import { FashionNewsletter } from '../../components/fashion/FashionNewsletter';
import { FashionTailoringCta } from '../../components/fashion/FashionTailoringCta';
import { useMemo } from 'react';
import { useStore } from '@boutique/shared';

export default function FashionHome() {
  const { products, categories, settings } = useStore();

  const trending = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const wr = (b.rating || 0) - (a.rating || 0);
        return wr !== 0 ? wr : Number(b.featured) - Number(a.featured);
      })
      .slice(0, 8);
  }, [products]);

  const features = [
    {
      icon: Gift,
      title: 'Curated gift guides',
      description: 'Occasion-ready picks for birthdays, anniversaries, and every celebration.',
    },
    {
      icon: Package,
      title: 'Gift wrap & dispatch',
      description: `Complimentary wrap on orders over $${settings.freeShippingMin} before tax.`,
    },
    {
      icon: Award,
      title: 'Partner picks',
      description: 'Affiliate favourites from trusted stores—one click to shop externally.',
    },
    {
      icon: Sparkles,
      title: 'Fresh drops weekly',
      description: 'New gift ideas added directly from admin—mix in-store and affiliate items.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FashionHeroSplit />

      <section className="py-10 md:py-12 bg-gradient-to-b from-white to-[var(--luxury-cream)]/40 border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[var(--luxury-maroon)] to-[var(--luxury-gold)] rounded-xl mb-3 shadow-md">
                  <feature.icon className="w-5 h-5 text-white" aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-[var(--luxury-maroon)] mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="trending-picks" className="py-10 md:py-14 bg-[var(--luxury-cream)]/35">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--luxury-gold)] font-semibold mb-2">
              Shop the edit
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--luxury-maroon)] tracking-tight">
              Trending gifts
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">{settings.storefrontSubtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {trending.map((product) => (
              <FashionProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <FashionCollectionSpotlight settings={settings} categories={categories} />

      <FashionTailoringCta />
      <FashionNewsletter />
    </div>
  );
}
