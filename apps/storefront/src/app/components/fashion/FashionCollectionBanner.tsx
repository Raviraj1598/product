import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

interface FashionCollectionBannerProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  reverse?: boolean;
  /** Dynamic shop deep-link (defaults to `/shop`). */
  shopHref?: string;
}

export function FashionCollectionBanner({
  title,
  subtitle,
  description,
  image,
  reverse = false,
  shopHref = '/shop',
}: FashionCollectionBannerProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={reverse ? 'lg:order-2' : ''}
      >
        <div className="inline-block px-4 py-2 bg-[var(--luxury-gold)]/20 text-[var(--luxury-maroon)] rounded-full mb-4">{subtitle}</div>
        <h2 className="text-4xl md:text-5xl font-semibold text-[var(--luxury-maroon)] mb-4 leading-tight">{title}</h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">{description}</p>
        <Link
          to={shopHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--luxury-maroon)] text-white rounded-full hover:bg-[var(--luxury-red)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Explore collection
          <ArrowRight className="w-5 h-5" aria-hidden />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`relative rounded-3xl overflow-hidden shadow-2xl ${reverse ? 'lg:order-1' : ''}`}
      >
        <img src={image} alt="" className="w-full h-[500px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}
