import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight, Star, Gift } from 'lucide-react';
import { useStore } from '@boutique/shared';

export function FashionHeroSplit() {
  const { settings } = useStore();
  const title = settings.storefrontTitle?.trim() || 'Curated gifts for every moment';
  const subtitle =
    settings.storefrontSubtitle?.trim() ||
    'Discover thoughtful presents for every occasion—from our own collection to handpicked partner favourites.';

  return (
    <div className="relative bg-gradient-to-br from-[var(--luxury-cream)] via-white to-[var(--luxury-gold)]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
              <Gift className="w-4 h-4 text-[var(--luxury-gold)]" aria-hidden />
              <span className="text-sm text-[var(--luxury-maroon)]">Curated with care</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-[var(--luxury-maroon)] mb-6 leading-tight">
              {title.split(' ').length > 3 ? (
                <>
                  {title.split(' ').slice(0, -2).join(' ')}
                  <span className="block bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-maroon)] bg-clip-text text-transparent">
                    {title.split(' ').slice(-2).join(' ')}
                  </span>
                </>
              ) : (
                <>
                  Gifts that
                  <span className="block bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-maroon)] bg-clip-text text-transparent">
                    delight
                  </span>
                </>
              )}
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{subtitle}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to="/shop"
                className="px-8 py-4 bg-[var(--luxury-maroon)] text-white rounded-full hover:bg-[var(--luxury-red)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Browse gifts
                <ArrowRight className="w-5 h-5" aria-hidden />
              </Link>
              <Link
                to="/shop"
                className="px-8 py-4 border-2 border-[var(--luxury-maroon)] text-[var(--luxury-maroon)] rounded-full hover:bg-[var(--luxury-maroon)] hover:text-white transition-all inline-flex items-center justify-center"
              >
                Partner picks
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl text-[var(--luxury-maroon)] mb-1">500+</div>
                <div className="text-sm text-gray-500">Gift ideas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-[var(--luxury-maroon)] mb-1">Gift</div>
                <div className="text-sm text-gray-500">Wrap available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-[var(--luxury-maroon)] mb-1">4.9★</div>
                <div className="text-sm text-gray-500">Happy givers</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1080&q=80&fit=max"
                    alt="Wrapped gifts"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--luxury-gold)] text-white text-sm rounded-full">
                    New
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b923823cd?w=1080&q=80&fit=max"
                    alt="Birthday gifts"
                    className="w-full h-64 object-cover"
                  />
                </motion.div>
              </div>
              <div className="space-y-4 pt-12">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1512909006721-3d0158887362?w=1080&q=80&fit=max"
                    alt="Occasion gifts"
                    className="w-full h-64 object-cover"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1607083206869-4c7672f72a7a?w=1080&q=80&fit=max"
                    alt="Gift boxes"
                    className="w-full h-80 object-cover"
                  />
                </motion.div>
              </div>
            </div>

            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[var(--luxury-gold)]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[var(--luxury-maroon)]/20 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>

      <div className="absolute top-20 left-10 w-2 h-2 bg-[var(--luxury-gold)] rounded-full animate-pulse pointer-events-none" aria-hidden />
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-[var(--luxury-maroon)] rounded-full animate-pulse pointer-events-none" aria-hidden />
    </div>
  );
}
