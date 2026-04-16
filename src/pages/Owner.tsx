import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getVehicles, getOrders, getSuppliers, getUsers } from '../utils/api';
import type { Vehicle, Order, User } from '../types';
import { toast } from 'react-toastify';

const Owner: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        const [vehiclesData, ordersData, suppliersData, usersData] = await Promise.all([
          getVehicles(),
          getOrders(),
          getSuppliers(),
          getUsers(),
        ]);
        setVehicles(vehiclesData);
        setOrders(ordersData);
        setSuppliers(suppliersData);
        setUsers(usersData);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load owner dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'owner') {
      loadOwnerData();
    }
  }, [user]);

  const inventoryAlertCount = useMemo(
    () => vehicles.filter((vehicle) => vehicle.stock_quantity <= 5).length,
    [vehicles]
  );

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.product_total_price || 0), 0),
    [orders]
  );

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is reserved for the owner. Please sign in with the correct account.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>Loading owner dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="mt-2 text-gray-600">A consolidated view of revenue, inventory status, supplier relationships, and customer demand.</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-4 mb-10">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">₱{totalRevenue.toLocaleString('en-PH')}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{orders.length}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Low-stock items</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{inventoryAlertCount}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Registered Customers</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{users.length}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Alerts</h2>
              {vehicles.length === 0 ? (
                <p className="text-gray-600">No inventory data available.</p>
              ) : (
                <div className="space-y-4">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.vehicle_id} className="flex items-center justify-between rounded-2xl bg-white p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{vehicle.vehicle_name}</p>
                        <p className="text-sm text-gray-600">{vehicle.vehicle_make} {vehicle.vehicle_model}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm ${vehicle.stock_quantity <= 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {vehicle.stock_quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Suppliers</h2>
              {suppliers.length === 0 ? (
                <p className="text-gray-600">No supplier data available.</p>
              ) : (
                <div className="space-y-4">
                  {suppliers.slice(0, 5).map((supplier) => (
                    <div key={supplier.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">{supplier.name}</p>
                      <p className="text-sm text-gray-600">{supplier.contact_person} · {supplier.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Owner;
