import { useMemo } from 'react';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import { Package, ShoppingBag, DollarSign, TrendingUp, Star, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { products, orders, reviews, settings } = useStore();
  const merged = mergeStoreSettings(settings);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const last30Days = orders.filter(
      (o) => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const prev30Days = orders.filter(
      (o) =>
        new Date(o.createdAt) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
        new Date(o.createdAt) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const revenueGrowth = prev30Days.length > 0
      ? ((last30Days.length - prev30Days.length) / prev30Days.length) * 100
      : 100;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockProducts,
      avgOrderValue,
      avgRating,
      revenueGrowth,
    };
  }, [products, orders, reviews]);

  const revenueData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayOrders = orders.filter((o) => o.createdAt.split('T')[0] === date);
      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    products.forEach((product) => {
      categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const topProducts = useMemo(() => {
    const productSales = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productSales.set(
          item.productId,
          (productSales.get(item.productId) || 0) + item.quantity
        );
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown',
          quantity,
          revenue: quantity * (product?.price || 0),
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, products]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: stats.revenueGrowth,
      changeLabel: 'vs last 30 days',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      label: 'Avg Order Value',
      value: `$${stats.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-indigo-500',
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockProducts.toString(),
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      label: 'Avg Rating',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
    },
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with <strong>{merged.siteName}</strong>.
        </p>
        {merged.adminPanel.dashboardNote?.trim() && (
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">{merged.adminPanel.dashboardNote}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(stat.change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.changeLabel && (
                  <p className="text-xs text-gray-500 mt-1">{stat.changeLabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Revenue Overview (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Products by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
