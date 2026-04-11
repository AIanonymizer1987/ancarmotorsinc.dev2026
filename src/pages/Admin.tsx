import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getVehicles, getUsers, getOrders, getTestDrives, getSuppliers, addVehicle, updateVehicle, deleteVehicle, updateOrder, addSupplier, updateSupplier, deleteSupplier } from '../utils/api';
import type { Vehicle, Order, User } from '../types';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell } from 'recharts';

type ViewType = 'dashboard' | 'vehicles' | 'orders' | 'suppliers' | 'analytics';

const Admin: React.FC = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null

    const fetchData = async () => {
      try {
        const [vehiclesData, ordersData, usersData, testDrivesData, suppliersData] = await Promise.all([
          getVehicles(),
          getOrders(),
          getUsers(),
          getTestDrives(),
          getSuppliers(),
        ]);
        setVehicles(vehiclesData);
        setOrders(ordersData);
        setUsers(usersData);
        setTestDrives(testDrivesData);
        setSuppliers(suppliersData);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const stats = useMemo(() => {
    if (!isAdmin) return { totalVehicles: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 };

    const totalVehicles = vehicles.length;
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.product_total_price || 0), 0);
    const pendingOrders = orders.filter(o => o.product_status === 'pending').length;
    const completedOrders = orders.filter(o => o.product_status === 'completed').length;
    return { totalVehicles, totalOrders, totalUsers, totalRevenue, pendingOrders, completedOrders };
  }, [vehicles, orders, users, isAdmin]);

  const orderStatusData = useMemo(() => {
    if (!isAdmin) return [];

    const statusCounts = orders.reduce((acc, order) => {
      const status = order.product_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  }, [orders, isAdmin]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateOrder(orderId, { product_status: status });
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, product_status: status } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.vehicle_id !== id));
      toast.success('Vehicle deleted');
    } catch {
      toast.error('Failed to delete vehicle');
    }
  };

  const handicle = async (vehicle: Vehicle) => {
    try {
      if (editingVehicle) {
        await leteSupplier(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.suingSupplier(false);
    } catch {  >
                  Vehicles
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'orders' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Orders
                </button>
                <button
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Vehicles</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalVehicles}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Orders</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Revenue</h3>
                    <p className="text-3xl font-bold text-yellow-600">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Make</th>
                        <th className="px-4 py-2 text-left">Model</th>
                        <th className="px-4 py-2 text-left">Year</th>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Stock</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map(vehicle => (
                        <tr key={vehicle.vehicle_id} className="border-t">
                          <td className="px-4 py-2">{vehicle.vehicle_make}</td>
                          <td className="px-4 py-2">{vehicle.vehicle_model}</td>
                          <td className="px-4 py-2">{vehicle.vehicle_year}</td>
                          <td className="px-4 py-2">${vehicle.vehicle_base_price?.toLocaleString()}</td>
                          <td className="px-4 py-2">{vehicle.stock_quantity}</td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              onClick={() => setEditingVehicle(vehicle)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Orders</h1>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Vehicle</th>
                        <th className="px-4 py-2 text-left">Total Price</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.order_id} className="border-t">
                          <td className="px-4 py-2">{order.order_id}</td>
                          <td className="px-4 py-2">{order.user_id}</td>
                          <td className="px-4 py-2">{order.product_name}</td>
                          <td className="px-4 py-2">${order.product_total_price?.toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <select
                              value={order.product_status}
                              onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                              className="border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            {/* Actions if needed */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'suppliers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Suppliers</h1>
                  <button
                    onClick={() => setIsAddingSupplier(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Supplier
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Contact</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(supplier => (
                        <tr key={supplier.id} className="border-t">
                          <td className="px-4 py-2">{supplier.name}</td>
                          <td className="px-4 py-2">{supplier.contact_person}</td>
                          <td className="px-4 py-2">{supplier.email}</td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              onClick={() => setEditingSupplier(supplier)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'analytics' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={orderStatusData}
                      cx={200}
                      cy={150}
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;