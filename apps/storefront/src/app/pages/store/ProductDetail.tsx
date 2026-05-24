import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  useStore,
  resolveCategorySlug,
  slugifyCategoryName,
  isAffiliateProduct,
  getAffiliateHref,
  affiliateButtonLabel,
  AFFILIATE_LINK_REL,
  mergeStoreSettings,
  formatProductPrice,
  recordAffiliateClick,
  resolveProductAffiliatePlatform,
  truncateDescription,
} from '@boutique/shared';
import { ShoppingCart, Minus, Plus, Star, ExternalLink } from 'lucide-react';
import { StoreBreadcrumb } from '../../components/StoreBreadcrumb';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, reviews, settings, addToCart, categories } = useStore();
  const mergedSettings = mergeStoreSettings(settings);
  const [quantity, setQuantity] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-blue-600 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const affiliate = isAffiliateProduct(product);
  const affiliateHref = getAffiliateHref(product, mergedSettings);
  const affiliatePlatform = resolveProductAffiliatePlatform(product, mergedSettings);
  const partnerName = affiliatePlatform?.name ?? product.affiliateVendor ?? 'our partner';
  const priceLabel = formatProductPrice(product.price, product.priceCurrency ?? affiliatePlatform?.currency);
  const compareLabel =
    product.compareAtPrice != null
      ? formatProductPrice(product.compareAtPrice, product.priceCurrency ?? affiliatePlatform?.currency)
      : null;

  const productReviews = reviews.filter((r) => r.productId === product.id).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const partnerRating = product.rating > 0 ? product.rating : null;
  const partnerReviewCount = product.reviewCount > 0 ? product.reviewCount : null;
  const ratingLabel = affiliate && partnerRating != null
    ? `${partnerRating.toFixed(1)} on ${partnerName}`
    : `${product.rating.toFixed(1)} storefront rating`;

  const description =
    descExpanded || !affiliate
      ? product.description
      : truncateDescription(product.description, 320);

  const mainImage =
    product.images?.[Math.min(imageIdx, Math.max(0, product.images.length - 1))] ??
    product.images?.[0] ??
    '';

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const shopExploreHref = (() => {
    const cat = categories.find((c) => c.name === product.category);
    if (!cat) return `/shop?category=${encodeURIComponent(slugifyCategoryName(product.category))}`;
    const visible = cat.published !== false;
    if (!visible) return '/shop';
    return `/shop?category=${encodeURIComponent(resolveCategorySlug(cat))}`;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StoreBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          ...(product.category
            ? [
                {
                  label: product.category,
                  href: shopExploreHref,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full rounded-lg shadow-lg mb-4"
          />
          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {product.images.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIdx(idx)}
                  className={`rounded-md overflow-hidden border-2 w-16 h-16 shrink-0 ${
                    idx === imageIdx ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
            {affiliate && (
              <>
                <span className="inline-block bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium">
                  Partner pick
                </span>
                {affiliatePlatform && (
                  <span className="inline-block bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-sm font-medium">
                    {affiliatePlatform.name}
                  </span>
                )}
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-medium">{ratingLabel}</span>
            {affiliate && partnerReviewCount != null && (
              <span className="text-gray-500 text-sm">({partnerReviewCount.toLocaleString()} partner reviews)</span>
            )}
            {!affiliate && (
              <span className="text-gray-500 text-sm">({product.reviewCount} reviews)</span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <p className="text-3xl font-bold">{priceLabel}</p>
            {compareLabel && (
              <p className="text-lg text-gray-400 line-through">{compareLabel}</p>
            )}
          </div>
          <div className="text-gray-600 mb-6 leading-relaxed">
            <p>{description}</p>
            {affiliate && product.description.length > 320 && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="text-violet-700 text-sm font-medium mt-2 hover:underline"
              >
                {descExpanded ? 'Show less' : 'Read full description'}
              </button>
            )}
          </div>

          <div className="mb-6">
            {affiliate && affiliateHref ? (
              <div className="space-y-4">
                <a
                  href={affiliateHref}
                  target="_blank"
                  rel={AFFILIATE_LINK_REL}
                  onClick={() =>
                    recordAffiliateClick({
                      productId: product.id,
                      productName: product.name,
                      platformId: affiliatePlatform?.id,
                      platformName: affiliatePlatform?.name,
                      destinationUrl: affiliateHref,
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-[var(--luxury-maroon)] text-white px-6 py-4 rounded-lg hover:opacity-90 transition-colors text-lg font-medium"
                >
                  <ExternalLink className="w-5 h-5" />
                  {affiliateButtonLabel(product, mergedSettings)}
                </a>
                {mergedSettings.affiliateDisclosure && (
                  <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-violet-300 pl-3">
                    {mergedSettings.affiliateDisclosure}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  You will be redirected to {partnerName} to complete your purchase.
                  Pricing and availability are set by the partner store.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  )}
                </div>

                {product.stock > 0 && (
                  <>
                    <div className="mb-6">
                      <label className="block font-medium mb-2">Quantity:</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={decrementQuantity}
                          className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={incrementQuantity}
                          className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                          disabled={quantity >= product.stock}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="border-t pt-6 mb-10">
            <h3 className="font-semibold mb-3">Store policies</h3>
            <ul className="space-y-2 text-gray-600">
              {!affiliate && (
                <li>
                  Free shipping on orders over ${settings.freeShippingMin.toFixed(2)} (before tax).
                </li>
              )}
              {settings.productPolicyLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Reviews ({productReviews.length})</h3>
            {productReviews.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {affiliate && partnerRating != null
                  ? `Partner rating shown above is from ${partnerName}. No storefront reviews yet.`
                  : 'No reviews yet for this product.'}
              </p>
            ) : (
              <ul className="space-y-4">
                {productReviews.map((r) => (
                  <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{r.customerName}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        {r.rating}
                      </span>
                      {r.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
