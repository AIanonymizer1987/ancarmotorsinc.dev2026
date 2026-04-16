import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrder } from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';

const Employee: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderData = await getOrders();
        setOrders(orderData.filter((order) => order.product_status !== 'cancelled'));
      } catch (error) {
        console.error(error);
        toast.error('Failed to load employee task list.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'employee') {
      loadOrders();
    }
  }, [user]);

  const updateTaskStatus = async (orderId: number, status: string) => {
    try {
      await updateOrder(orderId, { product_status: status });
      setOrders((prev) => prev.map((order) => (order.order_id === orderId ? { ...order, product_status: status } : order)));
      toast.success('Order status updated.');
    } catch {
      toast.error('Failed to update order status.');
    }
  };

  const handleCompleteAll = async () => {
    setBulkUpdating(true);
    try {
      const activeOrders = orders.filter((order) => order.product_status === 'processing' || order.product_status === 'pending');
      await Promise.all(activeOrders.map((order) => updateOrder(order.order_id, { product_status: 'completed' })));
      setOrders((prev) => prev.map((order) => ({ ...order, product_status: 'completed' })));
      toast.success('All active orders marked complete.');
    } catch {
      toast.error('Failed to update all orders.');
    } finally {
      setBulkUpdating(false);
    }
  };

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Employee access required to view this page.</p>
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
            <p>Loading employee dashboard...</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage active orders and support customer fulfillment tasks.</p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Total orders assigned</p>
              <p className="text-3xl font-semibold text-slate-900">{orders.length}</p>
            </div>
            <button
              type="button"
              onClick={handleCompleteAll}
              disabled={bulkUpdating}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {bulkUpdating ? 'Updating...' : 'Mark all complete'}
            </button>
          </div>

          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.order_id} className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{order.product_name}</h2>
                    <p className="text-sm text-gray-600">Order {order.order_code || order.order_id} · {order.product_payment.toUpperCase()}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    Status: {order.product_status}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium text-slate-900">{order.username}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-gray-500">Total value</p>
                    <p className="font-medium text-slate-900">₱{order.product_total_price?.toLocaleString('en-PH')}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {order.product_status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(order.order_id, 'processing')}
                      className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                    >
                      Mark in progress
                    </button>
                  )}
                  {order.product_status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => updateTaskStatus(order.order_id, 'completed')}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Employee;
