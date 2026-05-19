import { useState } from 'react';
import { useStore } from '@boutique/shared';
import { Plus, Pencil, Trash2, X, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { Coupon } from '@boutique/shared';
import { toast } from 'sonner';

export default function AdminCoupons() {
  const { coupons, setCoupons } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderValue: '',
    usageLimit: '',
    expiresAt: '',
  });

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderValue: coupon.minOrderValue?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        expiresAt: coupon.expiresAt?.split('T')[0] || '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        usageLimit: '',
        expiresAt: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
    };

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, ...couponData }
            : c
        )
      );
      toast.success('Coupon updated successfully!');
    } else {
      const newCoupon: Coupon = {
        ...couponData,
        id: Date.now().toString(),
        usageCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setCoupons((prev) => [...prev, newCoupon]);
      toast.success('Coupon created successfully!');
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted successfully!');
    }
  };

  const toggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
    toast.success('Coupon status updated!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coupons</h1>
          <p className="text-gray-600">{coupons.length} coupons available</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className={`bg-white rounded-lg shadow-sm border p-6 ${
            !coupon.active ? 'opacity-60' : ''
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <code className="text-lg font-bold">{coupon.code}</code>
              </div>
              <button
                onClick={() => toggleActive(coupon.id)}
                className="p-1 hover:bg-gray-100 rounded"
                title={coupon.active ? 'Deactivate' : 'Activate'}
              >
                {coupon.active ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </span>
              </div>
              {coupon.minOrderValue && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-medium">${coupon.minOrderValue}</span>
                </div>
              )}
              {coupon.usageLimit && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">
                    {coupon.usageCount ?? 0} / {coupon.usageLimit ?? '∞'}
                  </span>
                </div>
              )}
              {coupon.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal(coupon)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono"
                  placeholder="e.g. SAVE20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Describe what this coupon does"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type *</label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Order Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
