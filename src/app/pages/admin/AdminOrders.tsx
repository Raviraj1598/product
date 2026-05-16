import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronDown, ChevronUp, Search, Filter, Package2, Truck } from 'lucide-react';
import { Order } from '../../types';
import { toast } from 'sonner';

export default function AdminOrders() {
  const { orders, setOrders, products } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [editingTracking, setEditingTracking] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      )
    );
    toast.success('Order status updated!');
  };

  const handleTrackingUpdate = (orderId: string) => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, trackingNumber, updatedAt: new Date().toISOString() } : order
      )
    );
    setEditingTracking(null);
    setTrackingNumber('');
    toast.success('Tracking number added!');
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-gray-600">{filteredOrders.length} orders found</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {filteredOrders.length === 0 ? (
          <p className="p-8 text-gray-500 text-center">No orders found</p>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div key={order.id}>
                <div className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, e.target.value as Order['status']);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1 rounded-full text-sm border-0 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {order.customerEmail}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Tracking:</span>
                          <span className="font-mono font-medium">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Name:</span> <span className="font-medium">{order.customerName}</span></p>
                          <p><span className="text-gray-600">Email:</span> <span className="font-medium">{order.customerEmail}</span></p>
                          <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{order.customerPhone}</span></p>
                          <p><span className="text-gray-600">Address:</span> <span className="font-medium">{order.customerAddress}</span></p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Shipping Information</h4>
                        {editingTracking === order.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="Enter tracking number"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTrackingUpdate(order.id)}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTracking(null)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {order.trackingNumber ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <span className="font-mono font-medium">{order.trackingNumber}</span>
                                <button
                                  onClick={() => {
                                    setEditingTracking(order.id);
                                    setTrackingNumber(order.trackingNumber || '');
                                  }}
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Edit
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingTracking(order.id)}
                                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                              >
                                <Package2 className="w-4 h-4" />
                                Add Tracking Number
                              </button>
                            )}
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-1">Order Notes</h5>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Product</th>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {order.items.map((item, index) => {
                            const product = products.find((p) => p.id === item.productId);
                            return (
                              <tr key={index}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {product && (
                                      <img
                                        src={product.images[0]}
                                        alt={item.productName}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                    )}
                                    <span>{item.productName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">{item.quantity}</td>
                                <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                                <td className="px-4 py-3 font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right text-sm">Subtotal:</td>
                            <td className="px-4 py-2 text-sm">${order.subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right text-sm">Tax:</td>
                            <td className="px-4 py-2 text-sm">${order.tax.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right text-sm">Shipping:</td>
                            <td className="px-4 py-2 text-sm">${order.shipping.toFixed(2)}</td>
                          </tr>
                          {order.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right text-sm text-green-600">
                                Discount{order.couponCode && ` (${order.couponCode})`}:
                              </td>
                              <td className="px-4 py-2 text-sm text-green-600">-${order.discount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr className="border-t-2">
                            <td colSpan={3} className="px-4 py-3 text-right font-medium">Total:</td>
                            <td className="px-4 py-3 font-bold">${order.total.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
