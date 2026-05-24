import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore, resolveCategorySlug, isAffiliateProduct, mergeStoreSettings } from '@boutique/shared';
import { Search, SlidersHorizontal } from 'lucide-react';
import { resolveShopCategoryFilter, shopSearch } from '../../lib/shopNavigation';
import { FashionProductCard } from '../../components/fashion/FashionProductCard';
import { StoreBreadcrumb } from '../../components/StoreBreadcrumb';

export default function StoreFront() {
  const { products, categories, settings } = useStore();
  const mergedSettings = mergeStoreSettings(settings);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visibleCategories = useMemo(() => {
    const pub = [...categories].filter((c) => c.published !== false);
    pub.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return pub;
  }, [categories]);

  const categorySlugFromSearch = searchParams.get('category');

  const activeCategoryFilter = useMemo(
    () =>
      resolveShopCategoryFilter({
        categoryParam: categorySlugFromSearch,
        publishedCategories: visibleCategories,
        allCategories: categories,
        products,
      }),
    [categorySlugFromSearch, visibleCategories, categories, products],
  );

  useEffect(() => {
    if (!categorySlugFromSearch?.trim()) return;
    if (activeCategoryFilter.mode !== 'all') return;
    navigate(
      { pathname: '/shop', search: shopSearch(searchParams, { category: null }) },
      { replace: true },
    );
  }, [categorySlugFromSearch, activeCategoryFilter.mode, navigate, searchParams]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  /** null = show full catalog range (includes affiliate INR/USD mix). */
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const catalogMaxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 1),
    [products],
  );

  const effectivePriceRange = useMemo(
    () => priceRange ?? [0, catalogMaxPrice],
    [priceRange, catalogMaxPrice],
  );

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategoryFilter.mode === 'all' ||
        product.category === activeCategoryFilter.categoryName;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice =
        isAffiliateProduct(product) ||
        (product.price >= effectivePriceRange[0] && product.price <= effectivePriceRange[1]);
      return matchesCategory && matchesSearch && matchesPrice;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [products, activeCategoryFilter, searchQuery, effectivePriceRange, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const affiliateCount = useMemo(() => products.filter(isAffiliateProduct).length, [products]);

  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [
      { label: 'Home', href: '/' },
      { label: 'Shop', href: '/shop' },
    ];
    if (activeCategoryFilter.mode === 'one') {
      const cat = visibleCategories.find((c) => c.name === activeCategoryFilter.categoryName)
        ?? categories.find((c) => c.name === activeCategoryFilter.categoryName);
      items.push({ label: cat?.name ?? activeCategoryFilter.categoryName });
    }
    return items;
  }, [activeCategoryFilter, visibleCategories, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StoreBreadcrumb items={breadcrumbItems} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{mergedSettings.storefrontTitle}</h1>
        <p className="text-gray-600">{mergedSettings.storefrontSubtitle}</p>
        {affiliateCount > 0 && (
          <p className="text-sm text-violet-700 mt-2 font-medium">
            Includes {affiliateCount} partner pick{affiliateCount === 1 ? '' : 's'} — buy via external affiliate links.
          </p>
        )}
      </div>

      <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Price range (in-store items): {effectivePriceRange[0]} – {effectivePriceRange[1]}
                  <span className="block text-xs font-normal text-gray-500 mt-1">
                    Partner / affiliate picks always show — they use partner pricing (₹ / $).
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={catalogMaxPrice}
                    value={effectivePriceRange[0]}
                    onChange={(e) => {
                      const lo = parseInt(e.target.value, 10);
                      setPriceRange([lo, Math.max(lo, effectivePriceRange[1])]);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max={catalogMaxPrice}
                    value={effectivePriceRange[1]}
                    onChange={(e) => {
                      const hi = parseInt(e.target.value, 10);
                      setPriceRange([Math.min(effectivePriceRange[0], hi), hi]);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              navigate({ pathname: '/shop', search: shopSearch(searchParams, { category: null }) });
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeCategoryFilter.mode === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All products ({products.length})
          </button>
          {visibleCategories.map((category) => {
            const count = products.filter((p) => p.category === category.name).length;
            const slug = resolveCategorySlug(category);
            const active =
              activeCategoryFilter.mode === 'one' && activeCategoryFilter.categoryName === category.name;
            return (
              <button
                type="button"
                key={category.id}
                onClick={() => {
                  navigate({
                    pathname: '/shop',
                    search: shopSearch(searchParams, { category: slug }),
                  });
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full transition-colors ${
                  active ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          {filteredAndSortedProducts.length} products found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedProducts.map((product) => (
              <FashionProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === page
                            ? 'bg-black text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="w-10 h-10 flex items-center justify-center">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
