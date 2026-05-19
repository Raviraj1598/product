import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { resolveCategorySlug, useStore, type Product } from '@boutique/shared';
import {
  Layers,
  Link2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Star,
  ImagePlus,
  Tag,
  Package,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../components/ui/utils';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

export default function AdminProducts() {
  const { products, setProducts, categories } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    images: [''],
    category: '',
    stock: '',
    sku: '',
    tags: '',
    featured: false,
  });

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  );

  const filteredProducts = products
    .filter((product) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategoryFilter === 'All' || product.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const openSheet = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        images: product.images.length ? [...product.images] : [''],
        category: product.category,
        stock: product.stock.toString(),
        sku: product.sku,
        tags: product.tags.join(', '),
        featured: product.featured,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        images: [''],
        category: sortedCategories[0]?.name || '',
        stock: '',
        sku: '',
        tags: '',
        featured: false,
      });
    }
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const images = formData.images.map((img) => img.trim()).filter(Boolean);
    if (images.length === 0) {
      toast.error('Add at least one image URL.');
      return;
    }

    const price = Number.parseFloat(formData.price);
    const stockParsed = Number.parseInt(formData.stock, 10);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price.');
      return;
    }
    if (!Number.isFinite(stockParsed) || stockParsed < 0) {
      toast.error('Stock must be a whole number ≥ 0.');
      return;
    }

    let compareAt: number | undefined;
    if (formData.compareAtPrice.trim()) {
      compareAt = Number.parseFloat(formData.compareAtPrice);
      if (!Number.isFinite(compareAt) || compareAt < 0) {
        toast.error('Compare-at price must be a valid positive number.');
        return;
      }
    }

    const sku = formData.sku.trim();
    if (!sku) {
      toast.error('SKU required.');
      return;
    }

    const dupSku = products.some((p) => p.sku === sku && (!editingProduct || p.id !== editingProduct.id));
    if (dupSku) {
      toast.error('Another product already uses that SKU.');
      return;
    }

    const catName = formData.category.trim();
    if (!catName) {
      toast.error('Pick a category (or create one first).');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      compareAtPrice: compareAt,
      images,
      category: catName,
      stock: stockParsed,
      sku,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      featured: formData.featured,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
      toast.success('Product updated.');
    } else {
      const newProduct: Product = {
        ...productData,
        id: crypto.randomUUID(),
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      toast.success('Product created.');
    }

    closeSheet();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted.');
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected.');
      return;
    }
    if (confirm(`Delete ${selectedProducts.size} products?`)) {
      setProducts((prev) => prev.filter((p) => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      toast.success(`${selectedProducts.size} products deleted.`);
    }
  };

  const toggleSelectProduct = (id: string) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProducts(next);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `products-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Products exported.');
  };

  const addImageField = () => setFormData((f) => ({ ...f, images: [...f.images, ''] }));

  const removeImageField = (index: number) => {
    setFormData((f) => {
      const imgs = f.images.filter((_, i) => i !== index);
      return { ...f, images: imgs.length ? imgs : [''] };
    });
  };

  const updateImageField = (index: number, value: string) => {
    const next = [...formData.images];
    next[index] = value;
    setFormData((f) => ({ ...f, images: next }));
  };

  const selectedCatMeta =
    sortedCategories.find((c) => c.name === formData.category) ?? null;

  const categoryHint = selectedCatMeta
    ? `Storefront chip: ${resolveCategorySlug(selectedCatMeta)}`
    : 'Assign a storefront category';

  const primaryThumb =
    formData.images.map((x) => x.trim()).find(Boolean) || '/placeholder-product.png';

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
          <p className="text-gray-600">{filteredProducts.length} products match filters.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedProducts.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedProducts.size})
            </button>
          )}
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 border px-4 py-2 rounded-xl hover:bg-gray-900 hover:text-white transition-colors text-sm font-medium"
          >
            <Layers className="w-4 h-4" /> Categories
          </Link>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => openSheet()}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-900 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, or SKU…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="All">All categories</option>
              {sortedCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                  {cat.published === false ? ' (hidden)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'rating')}
              className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="rating">Rating</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="px-4 py-2 border rounded-xl hover:bg-gray-50 shrink-0"
              aria-label="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.size === filteredProducts.length && filteredProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] ?? primaryThumb}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg border bg-gray-100"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1 max-w-[280px]">
                          {product.description}
                        </p>
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full mt-1 font-semibold">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{product.sku}</td>
                  <td className="px-6 py-4 text-sm">{product.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                      {product.compareAtPrice != null && (
                        <p className="text-xs text-gray-500 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock < 10
                            ? 'bg-amber-100 text-amber-900'
                            : product.stock < 30
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openSheet(product)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent
          side="right"
          className={cn('flex h-full flex-col gap-0 p-0 w-full sm:max-w-xl md:max-w-[520px]', 'overflow-hidden')}
        >
          <SheetHeader className="p-6 border-b space-y-2 text-left shrink-0">
            <SheetTitle className="text-xl">
              {editingProduct ? `Edit "${editingProduct.name}"` : 'New product'}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Product details synced with catalog API after save.
            </SheetDescription>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 items-center">
              <Package className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
              Persists with catalog API ·{' '}
              <Link to="/categories" className="inline-flex items-center gap-1 font-medium underline">
                <Link2 className="w-3 h-3" /> Manage categories
              </Link>
            </div>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <Tabs defaultValue="overview" className="flex flex-1 flex-col min-h-0">
              <div className="px-6 pt-3 border-b bg-muted/30 shrink-0">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
                  <TabsTrigger value="overview" className="text-xs py-2">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs py-2">
                    Pricing & stock
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs py-2">
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="organization" className="text-xs py-2">
                    Organization
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Product name</label>
                    <input
                      required
                      className={cn(fld, 'mt-2')}
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Description</label>
                    <textarea
                      required
                      rows={5}
                      className={cn(fld, 'mt-2')}
                      value={formData.description}
                      onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50/80">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded"
                    />
                    <span>
                      <span className="font-semibold text-sm block">Featured</span>
                      <span className="text-xs text-gray-600">
                        Highlights this SKU on storefront carousels that read the featured flag.
                      </span>
                    </span>
                  </label>
                </TabsContent>

                <TabsContent value="pricing" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <DollarSign className="w-4 h-4 opacity-70" /> Price (USD)
                      </label>
                      <input
                        type="number"
                        step={0.01}
                        required
                        className={cn(fld, 'mt-2')}
                        value={formData.price}
                        onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800">Compare-at price</label>
                      <input
                        type="number"
                        step={0.01}
                        className={cn(fld, 'mt-2')}
                        placeholder="Optional strike-through MSRP"
                        value={formData.compareAtPrice}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, compareAtPrice: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-800">Stock units</label>
                      <input
                        type="number"
                        step={1}
                        required
                        min={0}
                        className={cn(fld, 'mt-2')}
                        value={formData.stock}
                        onChange={(e) => setFormData((f) => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <Tag className="w-4 h-4 opacity-70" /> SKU
                      </label>
                      <input
                        required
                        className={cn(fld, 'mt-2 font-mono text-xs')}
                        placeholder="SKU-2048"
                        value={formData.sku}
                        onChange={(e) => setFormData((f) => ({ ...f, sku: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="mt-0 space-y-4">
                  <div className="rounded-xl border p-4 flex gap-4 bg-muted/20">
                    <img
                      src={primaryThumb}
                      alt=""
                      className="w-24 h-24 rounded-xl object-cover border bg-gray-100 shrink-0"
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <ImagePlus className="w-4 h-4" /> Primary preview
                      </p>
                      <p>The first valid URL fills the storefront grid thumbnails.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          type="url"
                          className={cn(fld, index === 0 ? 'flex-1' : 'flex-1')}
                          placeholder="https://..."
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          required={index === 0}
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 shrink-0"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addImageField} className="text-sm font-medium underline">
                      + Another image URL
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="organization" className="mt-0 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Category</label>
                    <select
                      required
                      className={cn(fld, 'mt-2')}
                      value={formData.category}
                      onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    >
                      {sortedCategories.length === 0 ? (
                        <option value="">— Add a category first —</option>
                      ) : (
                        sortedCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                            {cat.published === false ? ' (hidden)' : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">{categoryHint}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800">Tags</label>
                    <input
                      className={cn(fld, 'mt-2')}
                      placeholder="e.g. silk, bridal, bestseller"
                      value={formData.tags}
                      onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
                    />
                    <p className="text-[11px] text-gray-500 mt-2">
                      Separate with commas • used for search facets where wired.
                    </p>
                  </div>
                </TabsContent>
              </div>

              <SheetFooter className="gap-3 border-t p-6 shrink-0 flex-col-reverse sm:flex-row bg-gray-50/80">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-900"
                >
                  {editingProduct ? 'Save changes' : 'Create product'}
                </button>
              </SheetFooter>
            </Tabs>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
