import { useState } from 'react';
import { useStore } from '@boutique/shared';
import { Plus, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviews() {
  const { reviews, setReviews, products } = useStore();
  const [productId, setProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState('5');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [verified, setVerified] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error('Pick a product');
      return;
    }
    const r = parseInt(rating, 10);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      toast.error('Rating must be 1–5');
      return;
    }
    const newReview = {
      id:
        typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
          ? globalThis.crypto.randomUUID()
          : `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      productId,
      customerName: customerName.trim() || 'Customer',
      customerEmail: customerEmail.trim() || 'customer@example.com',
      rating: r,
      title: title.trim() || 'Review',
      comment: comment.trim() || '—',
      verified,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
    toast.success('Review added.');
    setTitle('');
    setComment('');
    setRating('5');
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this review?')) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review removed.');
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer reviews</h1>
        <p className="text-gray-600">{reviews.length} reviews synced with the storefront.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add review
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              <option value="">Choose product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Customer name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Alex"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="verified"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="verified" className="text-sm">
              Verified purchase
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Headline"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="What did they think?"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Add review
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-medium text-sm text-gray-600">All reviews</div>
        <ul className="divide-y">
          {reviews.length === 0 ? (
            <li className="p-8 text-center text-gray-500">No reviews yet.</li>
          ) : (
            reviews.map((review) => {
              const pname = products.find((p) => p.id === review.productId)?.name ?? review.productId;
              return (
                <li key={review.id} className="p-4 flex gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{review.customerName}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        {review.rating}
                      </span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{pname}</p>
                    <p className="font-medium">{review.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
