import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import type { Product } from '@boutique/shared';
import { useStore } from '@boutique/shared';
import { toast } from 'sonner';

const FALLBACK_PALETTE = ['#7a1c1c', '#c9a961', '#8b0000', '#daa520'];

function badgeFor(product: Product): string | undefined {
  if (product.featured) return 'FEATURED';
  const t = product.tags[0];
  return t ? t.toUpperCase().slice(0, 12) : undefined;
}

export function FashionProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const image = product.images?.[0] ?? '';
  const originalPrice = product.compareAtPrice;
  const rating = product.rating;
  const discount = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;
  const wishlisted = isInWishlist(product.id);
  const colors = product.tags.slice(0, 4).map((_, i) => FALLBACK_PALETTE[i % FALLBACK_PALETTE.length]);
  const badge = badgeFor(product);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="flex gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              className="flex-1 px-4 py-3 bg-white text-[var(--luxury-maroon)] rounded-lg hover:bg-[var(--luxury-maroon)] hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
              onClick={() => {
                addToCart(product.id, 1);
                toast.success(`${product.name} added to cart`);
              }}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Add</span>
            </button>
            <Link
              to={`/product/${product.id}`}
              className="p-3 bg-white text-[var(--luxury-maroon)] rounded-lg hover:bg-[var(--luxury-gold)] hover:text-white transition-all shadow-lg inline-flex items-center justify-center"
              aria-label={`View ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {badge ? (
          <div className="absolute top-4 left-4 px-3 py-1 bg-white text-[var(--luxury-maroon)] text-xs font-medium rounded-full shadow-lg backdrop-blur-md z-10">
            {badge}
          </div>
        ) : null}

        {discount > 0 && (
          <div className="absolute top-4 right-4 w-16 h-16 bg-[var(--luxury-red)] text-white rounded-full flex flex-col items-center justify-center shadow-lg z-10">
            <span className="text-xs">Save</span>
            <span className="font-bold">{discount}%</span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
            toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
          }}
          className={`absolute p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20 ${
            discount > 0 ? 'top-[5.75rem] right-4' : 'top-4 right-4'
          }`}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-5 h-5 ${wishlisted ? 'text-[var(--luxury-red)] fill-[var(--luxury-red)]' : 'text-gray-400'}`}
          />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-[var(--luxury-gold)] fill-[var(--luxury-gold)]' : 'text-gray-300'}`}
              aria-hidden
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-[var(--luxury-maroon)] mb-3 line-clamp-2 min-h-[48px] leading-tight hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl text-[var(--luxury-maroon)]">${product.price.toFixed(2)}</span>
          {originalPrice != null && (
            <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Palette:</span>
          <div className="flex gap-1">
            {colors.slice(0, 4).map((color, index) => (
              <span
                key={`${product.id}-${index}`}
                className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
