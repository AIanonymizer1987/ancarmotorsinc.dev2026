import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getOrders, Order } from '../data/orders';
import { getVehicleById } from '../data/vehicles';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const allOrders = getOrders();
      const userOrders = allOrders.filter(order => order.customerEmail === user.email);
      setOrders(userOrders);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">Please sign in to view your orders.</p>
            </div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Visit our services page to order a custom vehicle.</p>
              <a
                href="/services"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Order a Vehicle
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const vehicle = getVehicleById(order.vehicleId);
                return (
                  <div key={order.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Custom Vehicle Order'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Order ID: {order.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${order.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'out for delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}