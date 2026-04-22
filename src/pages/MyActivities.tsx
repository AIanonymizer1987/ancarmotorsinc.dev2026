import React, { useEffect, useMemo, useState } from 'react';
import { X, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { getUserOrders, updateOrder, getUserTestDrives, updateTestDrive, getUserTickets } from '../utils/api';
import type { Order } from '../types';
import { toast } from 'react-toastify';

interface TestDrive {
  id: number;
  user_id: string;
  vehicle_id: number;
  requested_date: string;
  requested_time: string;
  status: string;
}

interface Ticket {
  id: number;
  ticket_id: string;
  user_id: string;
  username: string;
  user_email: string;
  nature_of_concern: string;
  title: string;
  body: string;
  status: string;
  responses: string | null;
  created_at: string;
  updated_at: string;
}

export default function MyActivities() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [testDrivePage, setTestDrivePage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const itemsPerPage = 3;
  const { confirmState, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const userOrders = await getUserOrders(user.id.toString());
          setOrders(userOrders);
          const userTestDrives = await getUserTestDrives(user.id.toString());
          setTestDrives(userTestDrives);
          const userTickets = await getUserTickets(user.id.toString());
          setTickets(userTickets);
        } catch {
          console.error('Failed to load activities');
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  const handleCancelOrder = async (order: Order) => {
    openConfirm(
      'Cancel Order?',
      `Are you sure you want to cancel this order for ${order.product_name}? This action cannot be undone.`,
      async () => {
        try {
          await updateOrder(order.order_id, { product_status: 'cancelled' });
          setOrders(orders.map(o =>
            o.order_id === order.order_id ? { ...o, product_status: 'cancelled' } : o
          ));
          setOrderPage(1); // Reset to first page after update
          toast.success('Order cancelled successfully.');
        } catch {
          toast.error('Failed to cancel order.');
        }
      },
      {
        confirmText: 'Yes, Cancel Order',
        cancelText: 'Keep Order',
        isDangerous: true,
      }
    );
  };

  const handleCancelTestDrive = async (testDrive: TestDrive) => {
    openConfirm(
      'Cancel Test Drive?',
      `Are you sure you want to cancel your test drive request for vehicle #${testDrive.vehicle_id}? This action cannot be undone.`,
      async () => {
        try {
          await updateTestDrive(testDrive.id, { status: 'cancelled' });
          setTestDrives(testDrives.map(td =>
            td.id === testDrive.id ? { ...td, status: 'cancelled' } : td
          ));
          toast.success('Test drive cancelled successfully.');
        } catch {
          toast.error('Failed to cancel test drive.');
        }
      },
      {
        confirmText: 'Yes, Cancel Test Drive',
        cancelText: 'Keep Test Drive',
        isDangerous: true,
      }
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed' || status === 'approved') return <CheckCircle className="text-green-600" size={20} />;
    if (status === 'cancelled' || status === 'rejected') return <X className="text-red-600" size={20} />;
    return <Clock className="text-yellow-600" size={20} />;
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'completed' || status === 'approved') return 'bg-green-100 text-green-800';
    if (status === 'cancelled' || status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'out_for_delivery') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const search = orderSearch.toLowerCase();
      const matchesSearch =
        order.order_id.toString().includes(search) ||
        (order.order_code || '').toLowerCase().includes(search) ||
        order.product_name.toLowerCase().includes(search) ||
        order.product_model.toLowerCase().includes(search) ||
        order.user_id.toLowerCase().includes(search);

      const matchesStatus =
        orderStatusFilter === 'all' || order.product_status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const timeA = a.order_timestamp ? new Date(a.order_timestamp).getTime() : 0;
      const timeB = b.order_timestamp ? new Date(b.order_timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const visibleOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

  const testDriveTotalPages = Math.ceil(testDrives.length / itemsPerPage);
  const visibleTestDrives = testDrives.slice((testDrivePage - 1) * itemsPerPage, testDrivePage * itemsPerPage);

  const ticketTotalPages = Math.ceil(tickets.length / itemsPerPage);
  const visibleTickets = tickets.slice((ticketPage - 1) * itemsPerPage, ticketPage * itemsPerPage);

  const handlePageChange = (page: number, type: 'order' | 'testDrive' | 'ticket') => {
    if (type === 'order') setOrderPage(page);
    else if (type === 'testDrive') setTestDrivePage(page);
    else if (type === 'ticket') setTicketPage(page);
  };

  const calculateEstimatedDelivery = (order: Order): string => {
    const orderDate = new Date(order.order_timestamp);
    let estimatedDate = new Date(orderDate);

    // Calculate estimated delivery based on status
    if (order.product_status === 'completed') {
      return 'Delivered';
    }
    if (order.product_status === 'cancelled' || order.product_status === 'rejected') {
      return 'Not applicable';
    }
    if (order.product_status === 'out_for_delivery') {
      return 'In transit';
    }

    // Default: Add 7-14 business days based on status
    const daysToAdd = order.product_status === 'approved' ? 7 : 14;
    let businessDaysAdded = 0;

    while (businessDaysAdded < daysToAdd) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
      const dayOfWeek = estimatedDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysAdded++;
      }
    }

    return estimatedDate.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">Loading your activities...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-12">My Activities</h1>

          {/* Orders Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet. Visit our services page to order a custom vehicle.</p>
                <a
                  href="/services"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Order a Vehicle
                </a>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
                      placeholder="Search orders by ID, code, vehicle, or user"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value);
                        setOrderPage(1);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                {visibleOrders.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-600">No orders match your search or filter.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {visibleOrders.map((order) => (
                      <div key={order.order_id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={order.product_img_url}
                            alt={order.product_name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{order.product_name}</h3>
                              <span className={
                                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ' +
                                getStatusBadgeColor(order.product_status)
                              }>
                                {getStatusIcon(order.product_status)}
                                {order.product_status
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (char) => char.toUpperCase())}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Order ID: <span className="font-mono font-semibold">{order.order_id}</span></p>
                            <p className="text-sm text-gray-600">Date: {new Date(order.order_timestamp).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Estimated Delivery: <span className="font-semibold text-blue-600">{calculateEstimatedDelivery(order)}</span></p>
                            <p className="text-sm text-gray-600">Delivery: {order.delivery_address || 'Not available'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">₱{parseFloat(order.product_total_price.toString()).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }).replace('₱', '')}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded p-4 mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Model</p>
                              <p className="font-semibold text-gray-900">{order.product_model}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Color</p>
                              <p className="font-semibold text-gray-900">{order.product_color}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Transmission</p>
                              <p className="font-semibold text-gray-900">{order.product_transmission}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payload Capacity</p>
                              <p className="font-semibold text-gray-900">{order.product_pl_capacity || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Towing Capacity</p>
                              <p className="font-semibold text-gray-900">{order.product_tw_capacity || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Shipping</p>
                              <p className="font-semibold text-gray-900">{order.product_shipping_option}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Order Type</p>
                              <p className="font-semibold text-gray-900">{order.order_type ? order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1) : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Quantity</p>
                              <p className="font-semibold text-gray-900">{order.product_quantity}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                            <div>
                              <p className="text-gray-600">Payment Status</p>
                              <p className="font-semibold text-gray-900">{order.product_payment_status}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment Method</p>
                              <p className="font-semibold text-gray-900">{order.product_payment}</p>
                            </div>
                            {order.payment_reference && (
                              <div>
                                <p className="text-gray-600">Payment Reference</p>
                                <p className="font-semibold text-gray-900 font-mono text-xs">{order.payment_reference}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {order.product_status !== 'completed' && order.product_status !== 'cancelled' && order.product_status !== 'processing' && order.product_status !== 'out for delivery' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(1, 'order')}
                      disabled={orderPage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(orderPage - 1, 'order')}
                      disabled={orderPage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page, 'order')}
                        className={`px-3 py-2 rounded-md ${
                          orderPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(orderPage + 1, 'order')}
                      disabled={orderPage === totalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages, 'order')}
                      disabled={orderPage === totalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Drives Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Test Drive Requests</h2>
            {testDrives.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Test Drive Requests</h3>
                <p className="text-gray-600 mb-6">You haven't requested any test drives yet. Visit our vehicles page to schedule one.</p>
                <a
                  href="/vehicles"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Browse Vehicles
                </a>
              </div>
            ) : (
              <div>
                <div className="grid gap-4">
                  {visibleTestDrives.map((td) => (
                    <div key={td.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Test Drive Request #{td.id}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(td.status)}`}>
                              {getStatusIcon(td.status)}
                              {td.status.charAt(0).toUpperCase() + td.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Vehicle ID: <span className="font-mono font-semibold">{td.vehicle_id}</span></p>
                        </div>
                      </div>
                      <div className="bg-white rounded p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Requested Date</p>
                            <p className="font-semibold text-gray-900">{new Date(td.requested_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Requested Time</p>
                            <p className="font-semibold text-gray-900">{td.requested_time}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Status</p>
                            <p className="font-semibold text-gray-900 capitalize">{td.status}</p>
                          </div>
                        </div>
                      </div>
                      {td.status !== 'completed' && td.status !== 'cancelled' && td.status !== 'rejected' && (
                        <button
                          onClick={() => handleCancelTestDrive(td)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                        >
                          Cancel Test Drive
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {testDriveTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(1, 'testDrive')}
                      disabled={testDrivePage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(testDrivePage - 1, 'testDrive')}
                      disabled={testDrivePage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: testDriveTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page, 'testDrive')}
                        className={`px-3 py-2 rounded-md ${
                          testDrivePage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(testDrivePage + 1, 'testDrive')}
                      disabled={testDrivePage === testDriveTotalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(testDriveTotalPages, 'testDrive')}
                      disabled={testDrivePage === testDriveTotalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Support Tickets Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Support Tickets</h2>
            {tickets.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No Support Tickets</h3>
                <p className="text-gray-600 mb-6">You haven't submitted any support tickets yet. Contact us if you have any questions or concerns.</p>
                <a
                  href="/contact"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Submit a Ticket
                </a>
              </div>
            ) : (
              <div>
                <div className="grid gap-4">
                  {visibleTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Ticket ID: <span className="font-mono font-semibold text-blue-600">#{ticket.ticket_id}</span></p>
                          <p className="text-sm text-gray-600">Category: <span className="font-semibold capitalize">{ticket.nature_of_concern}</span></p>
                          <p className="text-sm text-gray-600">Date: {new Date(ticket.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded p-4 mb-4">
                        <p className="text-sm text-gray-700 mb-3"><strong>Your Message:</strong></p>
                        <p className="text-sm text-gray-600">{ticket.body}</p>
                      </div>
                      {ticket.responses && JSON.parse(ticket.responses).length > 0 && (
                        <div className="bg-blue-50 rounded p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="text-blue-600" size={18} />
                            <p className="text-sm font-semibold text-blue-900">Admin Response</p>
                          </div>
                          <div className="space-y-2">
                            {JSON.parse(ticket.responses).map((response: any, idx: number) => (
                              <div key={idx} className="text-sm text-gray-700 pl-6 border-l-2 border-blue-300">
                                <p className="text-xs text-gray-500 mb-1">{new Date(response.timestamp).toLocaleString()}</p>
                                <p>{response.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {ticketTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(1, 'ticket')}
                      disabled={ticketPage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(ticketPage - 1, 'ticket')}
                      disabled={ticketPage === 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: ticketTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page, 'ticket')}
                        className={`px-3 py-2 rounded-md ${
                          ticketPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(ticketPage + 1, 'ticket')}
                      disabled={ticketPage === ticketTotalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(ticketTotalPages, 'ticket')}
                      disabled={ticketPage === ticketTotalPages}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* 2FA Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDangerous={confirmState.isDangerous}
        isLoading={confirmState.isLoading}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}