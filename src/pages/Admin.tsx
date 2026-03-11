import React, { useEffect, useMemo, useState } from 'react';
    import Header from '../components/Header';
    import Footer from '../components/Footer';
    import { useAuth } from '../context/AuthContext';
    import NotFound from './NotFound.tsx';
    import { getVehicles, Vehicle, addVehicle, updateVehicle, deleteVehicle } from '../data/vehicles';
    import { getOrders, Order, updateOrder, addOrder, deleteOrder } from '../data/orders';
    import { toast } from 'react-toastify';
    import { Link } from 'react-router-dom';

    const USERS_KEY = 'ancar_users_v1';

    const Admin: React.FC = () => {
      const { user } = useAuth();

      // Only allow seeded admin user (admin@ancarmotors.com)
      const isAdmin = user?.email?.toLowerCase() === 'admin@ancarmotors.com';
      if (!isAdmin) {
        return <NotFound />;
      }

      const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());
      const [orders, setOrders] = useState<Order[]>(() => getOrders());
      const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');
      const [brandFilter, setBrandFilter] = useState<string>('All');

      const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
      const [isAdding, setIsAdding] = useState(false);

      useEffect(() => {
        setVehicles(getVehicles());
        setOrders(getOrders());
        const onStorage = () => {
          setVehicles(getVehicles());
          setOrders(getOrders());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
      }, []);

      // Statistics
      const customerCount = useMemo(() => {
        try {
          const raw = localStorage.getItem(USERS_KEY);
          if (!raw) return 0;
          const users = JSON.parse(raw) as any[];
          return users.length;
        } catch {
          return 0;
        }
      }, [orders]);

      const orderCount = orders.length;
      const totalSales = orders.reduce((s, o) => s + (o.status === 'completed' ? o.amount : 0), 0);

      // Sales report by brand (from orders)
      const salesByBrand = useMemo(() => {
        const map: Record<string, { brand: string; orders: number; revenue: number }> = {};
        for (const o of orders) {
          // derive brand from vehicle list
          const v = vehicles.find((x) => x.id === o.vehicleId);
          const brand = v ? v.make : 'Unknown';
          if (!map[brand]) {
            map[brand] = { brand, orders: 0, revenue: 0 };
          }
          map[brand].orders += 1;
          if (o.status === 'completed') {
            map[brand].revenue += o.amount;
          }
        }
        return Object.values(map).sort((a, b) => b.revenue - a.revenue);
      }, [orders, vehicles]);

      // Order actions
      function changeOrderStatus(id: string, status: Order['status']) {
        const updated = updateOrder(id, { status });
        if (!updated) {
          toast.error('Failed to update order.');
          return;
        }
        setOrders(getOrders());
        toast.success('Order status updated.');
      }

      function removeOrder(id: string) {
        if (!confirm('Delete this order? This action cannot be undone.')) return;
        const ok = deleteOrder(id);
        if (ok) {
          setOrders(getOrders());
          toast.success('Order deleted.');
        } else {
          toast.error('Failed to delete order.');
        }
      }

      // Product actions
      function onEditVehicle(v: Vehicle) {
        setEditingVehicle(v);
        setIsAdding(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function onDeleteVehicle(id: string) {
        if (!confirm('Remove this product from inventory?')) return;
        const ok = deleteVehicle(id);
        if (ok) {
          setVehicles(getVehicles());
          toast.success('Vehicle removed.');
        } else {
          toast.error('Failed to remove vehicle.');
        }
      }

      function onStartAdd() {
        setIsAdding(true);
        setEditingVehicle({
          id: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          price: 0,
          mileage: '',
          fuelType: '',
          image: '',
          description: '',
          rating: 4.5,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function onCancelEdit() {
        setEditingVehicle(null);
        setIsAdding(false);
      }

      function onSaveVehicle(e: React.FormEvent) {
        e.preventDefault();
        if (!editingVehicle) return;
        const { id, ...payload } = editingVehicle as Vehicle;
        if (isAdding) {
          // add
          const newV = addVehicle(payload);
          setVehicles(getVehicles());
          setEditingVehicle(newV);
          setIsAdding(false);
          toast.success('Vehicle added.');
        } else {
          // update
          if (!id) return toast.error('Invalid vehicle id.');
          const updated = updateVehicle(id, payload);
          if (!updated) {
            toast.error('Failed to update vehicle.');
            return;
          }
          setVehicles(getVehicles());
          setEditingVehicle(updated);
          toast.success('Vehicle updated.');
        }
      }

      // Order list filtered
      const filteredOrders = orders.filter((o) => {
        if (orderFilter !== 'all' && o.status !== orderFilter) return false;
        if (brandFilter !== 'All') {
          const v = vehicles.find((x) => x.id === o.vehicleId);
          if (!v || v.make !== brandFilter) return false;
        }
        return true;
      });

      const brands = ['All', ...Array.from(new Set(getVehicles().map((v) => v.make)))];

      return (
        <div className="min-h-screen">
          <Header />
          <main className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mb-8">Hidden admin area — only accessible to the seeded admin account.</p>

              {/* Stats */}
              <section aria-labelledby="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <article id="dashboard-stats" className="bg-white p-6 rounded-md shadow-sm">
                  <h2 className="text-sm font-medium text-gray-500">Customers</h2>
                  <div className="mt-2 text-2xl font-bold text-gray-900">{customerCount}</div>
                </article>

                <article className="bg-white p-6 rounded-md shadow-sm">
                  <h2 className="text-sm font-medium text-gray-500">Orders</h2>
                  <div className="mt-2 text-2xl font-bold text-gray-900">{orderCount}</div>
                </article>

                <article className="bg-white p-6 rounded-md shadow-sm">
                  <h2 className="text-sm font-medium text-gray-500">Total Sales</h2>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </div>
                </article>
              </section>

              {/* Orders Table */}
              <section className="bg-white p-6 rounded-md shadow-sm mb-8" aria-labelledby="orders-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="orders-heading" className="text-lg font-semibold">Orders</h2>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Filter:</label>
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value as any)}
                      className="border rounded-md px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="in progress">In progress</option>
                      <option value="out for delivery">Out for delivery</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <label className="text-sm text-gray-600">Brand:</label>
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="border rounded-md px-2 py-1"
                    >
                      {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="py-2 pr-4">Order ID</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Vehicle</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-gray-600">No orders found.</td>
                        </tr>
                      )}
                      {filteredOrders.map((o) => {
                        const v = vehicles.find((x) => x.id === o.vehicleId);
                        return (
                          <tr key={o.id} className="text-sm border-b last:border-b-0">
                            <td className="py-3 pr-4">{o.id}</td>
                            <td className="py-3 pr-4">{o.customerName || o.customerEmail}</td>
                            <td className="py-3 pr-4">{v ? `${v.make} ${v.model}` : '—'}</td>
                            <td className="py-3 pr-4">{o.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td>
                            <td className="py-3 pr-4">
                              <select
                                value={o.status}
                                onChange={(e) => changeOrderStatus(o.id, e.target.value as Order['status'])}
                                className="border rounded-md px-2 py-1 text-sm"
                                aria-label={`Change status for order ${o.id}`}
                              >
                                <option value="in progress">In progress</option>
                                <option value="out for delivery">Out for delivery</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 pr-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 pr-4">
                              <div className="flex gap-2">
                                <button onClick={() => removeOrder(o.id)} className="text-sm px-2 py-1 bg-red-50 text-red-600 rounded-md border">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sales by Brand */}
              <section className="bg-white p-6 rounded-md shadow-sm mb-8" aria-labelledby="sales-brand">
                <h2 id="sales-brand" className="text-lg font-semibold mb-4">Sales by Brand</h2>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead className="text-left text-gray-600 border-b">
                      <tr>
                        <th className="py-2 pr-4">Brand</th>
                        <th className="py-2 pr-4">Orders</th>
                        <th className="py-2 pr-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByBrand.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-gray-600">No sales data yet.</td>
                        </tr>
                      )}
                      {salesByBrand.map((b) => (
                        <tr key={b.brand} className="border-b">
                          <td className="py-3 pr-4">{b.brand}</td>
                          <td className="py-3 pr-4">{b.orders}</td>
                          <td className="py-3 pr-4">{b.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Product Management */}
              <section className="bg-white p-6 rounded-md shadow-sm mb-8" aria-labelledby="products-heading">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="products-heading" className="text-lg font-semibold">Products (Inventory)</h2>
                  <div>
                    <button onClick={onStartAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md mr-2">Add New Product</button>
                    <Link to="/inventory" className="px-4 py-2 border rounded-md">View Inventory</Link>
                  </div>
                </div>

                {(editingVehicle) && (
                  <form onSubmit={onSaveVehicle} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Make</label>
                      <input required value={editingVehicle.make} onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input required value={editingVehicle.model} onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input required type="number" value={editingVehicle.year} onChange={(e) => setEditingVehicle({ ...editingVehicle, year: Number(e.target.value) })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                      <input required type="number" value={editingVehicle.price} onChange={(e) => setEditingVehicle({ ...editingVehicle, price: Number(e.target.value) })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mileage</label>
                      <input value={editingVehicle.mileage} onChange={(e) => setEditingVehicle({ ...editingVehicle, mileage: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <input value={editingVehicle.fuelType} onChange={(e) => setEditingVehicle({ ...editingVehicle, fuelType: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Image URL</label>
                      <input value={editingVehicle.image} onChange={(e) => setEditingVehicle({ ...editingVehicle, image: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea value={editingVehicle.description} onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })} className="mt-1 block w-full border rounded-md px-3 py-2" rows={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating</label>
                      <input type="number" step="0.1" min={0} max={5} value={editingVehicle.rating} onChange={(e) => setEditingVehicle({ ...editingVehicle, rating: Number(e.target.value) })} className="mt-1 block w-full border rounded-md px-3 py-2" />
                    </div>
                    <div className="flex items-end gap-2">
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">{isAdding ? 'Add Vehicle' : 'Save Changes'}</button>
                      <button type="button" onClick={onCancelEdit} className="px-4 py-2 border rounded-md">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead className="text-left text-gray-600 border-b">
                      <tr>
                        <th className="py-2 pr-4">Vehicle</th>
                        <th className="py-2 pr-4">Year</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">Fuel</th>
                        <th className="py-2 pr-4">Rating</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v) => (
                        <tr key={v.id} className="border-b">
                          <td className="py-3 pr-4">{v.make} {v.model}</td>
                          <td className="py-3 pr-4">{v.year}</td>
                          <td className="py-3 pr-4">{v.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</td>
                          <td className="py-3 pr-4">{v.fuelType}</td>
                          <td className="py-3 pr-4">{v.rating.toFixed(1)}</td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-2">
                              <button onClick={() => onEditVehicle(v)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">Edit</button>
                              <button onClick={() => onDeleteVehicle(v.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded-md">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
          <Footer />
        </div>
      );
    };

    export default Admin;