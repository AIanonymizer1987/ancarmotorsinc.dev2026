import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, updateOrder } from '../utils/api';
import { getTestDrives } from '../utils/api';
import { Order } from '../types';
import { toast } from 'react-toastify';

interface TestDrive {
  id: number;
  user_id: string;
  vehicle_id: number;
  requested_date: string;
  requested_time: string;
  status: string;
}

export default function MyActivities() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const userOrders = await getUserOrders(user.id.toString());
          setOrders(userOrders);
          const allTestDrives = await getTestDrives();
          const userTestDrives = allTestDrives.filter(td => td.user_id === user.id.toString());
          setTestDrives(userTestDrives);
        } catch {
          console.error('Failed to load activities');
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await updateOrder(orderId, { product_status: 'cancelled' });
      setOrders(orders.map(order =>
        order.order_id === orderId ? { ...order, product_status: 'cancelled' } : order
      ));
      toast.success('Order cancelled successfully.');
    } catch {
      toast.error('Failed to cancel order.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">Please sign in to view your activities.</p>
            </div>
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
            <p>Loading your activities...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Activities</h1>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet. Visit our services page to order a custom vehicle.</p>
                <a
                  href="/services"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Order a Vehicle
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.order_id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.product_name}</h3>
                        <p className="text-sm text-gray-600">Order ID: {order.order_id}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(order.order_timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">${order.product_total_price}</p>
                        <p className={`text-sm ${order.product_status === 'completed' ? 'text-green-600' : order.product_status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {order.product_status}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        <p>Model: {order.product_model}</p>
                        <p>Color: {order.product_color}</p>
                        <p>Quantity: {order.product_quantity}</p>
                      </div>
                      {order.product_status !== 'completed' && order.product_status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order.order_id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Test Drive Requests</h2>
            {testDrives.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Test Drive Requests</h3>
                <p className="text-gray-600 mb-6">You haven't requested any test drives yet. Visit our inventory to schedule one.</p>
                <a
                  href="/inventory"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Vehicles
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {testDrives.map((td) => (
                  <div key={td.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Test Drive Request #{td.id}</h3>
                        <p className="text-sm text-gray-600">Vehicle ID: {td.vehicle_id}</p>
                        <p className="text-sm text-gray-600">Date: {td.requested_date}</p>
                        <p className="text-sm text-gray-600">Time: {td.requested_time}</p>
                      </div>
                      <p className={`text-sm ${td.status === 'approved' ? 'text-green-600' : td.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {td.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}