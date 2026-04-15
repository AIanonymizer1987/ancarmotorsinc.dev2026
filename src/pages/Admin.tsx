import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getVehicles, getUsers, getOrders, getTestDrives, getSuppliers, addVehicle, updateVehicle, deleteVehicle, updateOrder, addSupplier, updateSupplier, deleteSupplier } from '../utils/api';
import type { Vehicle, Order, User } from '../types';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

type ViewType = 'dashboard' | 'vehicles' | 'orders' | 'suppliers' | 'analytics';

type VehicleFormState = Omit<Vehicle, 'vehicle_id' | 'vehicle_color' | 'vehicle_transmission' | 'vehicle_lifting_capacity' | 'vehicle_towing_capacity' | 'vehicle_payload_capacity'> & {
  vehicle_color: string[];
  vehicle_transmission: string[];
  vehicle_lifting_capacity: string[];
  vehicle_towing_capacity: string[];
  vehicle_payload_capacity: string[];
};

const Admin: React.FC = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>({
    vehicle_name: '',
    vehicle_img_url: '',
    vehicle_description: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_base_price: 0,
    vehicle_color: [],
    vehicle_year: '',
    vehicle_fuel_economy: '',
    vehicle_fuel_type: '',
    vehicle_transmission: [],
    vehicle_lifting_capacity: [],
    vehicle_towing_capacity: [],
    vehicle_payload_capacity: [],
    stock_quantity: 0,
  });
  const [newColor, setNewColor] = useState('');
  const [newTransmission, setNewTransmission] = useState('');
  const [newLiftingCapacity, setNewLiftingCapacity] = useState('');
  const [newPayloadCapacity, setNewPayloadCapacity] = useState('');
  const [newTowingCapacity, setNewTowingCapacity] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, ordersData, usersData, suppliersData] = await Promise.all([
          getVehicles(),
          getOrders(),
          getUsers(),
          getSuppliers(),
        ]);
        setVehicles(vehiclesData);
        setOrders(ordersData);
        setUsers(usersData);
        setSuppliers(suppliersData);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const resetVehicleForm = () => {
    setEditingVehicle(null);
    setVehicleForm({
      vehicle_name: '',
      vehicle_img_url: '',
      vehicle_description: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_base_price: 0,
      vehicle_color: [],
      vehicle_year: '',
      vehicle_fuel_economy: '',
      vehicle_fuel_type: '',
      vehicle_transmission: [],
      vehicle_lifting_capacity: [],
      vehicle_towing_capacity: [],
      vehicle_payload_capacity: [],
      stock_quantity: 0,
    });
    setNewColor('');
    setNewTransmission('');
    setNewLiftingCapacity('');
    setNewPayloadCapacity('');
    setNewTowingCapacity('');
    setUploadingImage(false);
    setImageUploadError(null);
  };

  const setVehicleField = <K extends keyof VehicleFormState>(field: K, value: VehicleFormState[K]) => {
    setVehicleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addVehicleSpec = (field: keyof Pick<VehicleFormState, 'vehicle_color' | 'vehicle_transmission' | 'vehicle_lifting_capacity' | 'vehicle_payload_capacity' | 'vehicle_towing_capacity'>, value: string, clearInput: () => void) => {
    if (!value.trim()) return;
    setVehicleForm((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    clearInput();
  };

  const removeVehicleSpec = (field: keyof Pick<VehicleFormState, 'vehicle_color' | 'vehicle_transmission' | 'vehicle_lifting_capacity' | 'vehicle_payload_capacity' | 'vehicle_towing_capacity'>, index: number) => {
    setVehicleForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const serializeList = (items: string[]) => items.filter(Boolean).join(', ');

  const parseSpecString = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const uploadVehicleImage = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      throw new Error('Cloudinary upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
    }

    setUploadingImage(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const data = await response.json();
    const url = data.secure_url || data.url || '';
    setVehicleField('vehicle_img_url', url);
    setUploadingImage(false);
    return url;
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicle_name: vehicle.vehicle_name,
      vehicle_img_url: vehicle.vehicle_img_url,
      vehicle_description: vehicle.vehicle_description,
      vehicle_make: vehicle.vehicle_make,
      vehicle_model: vehicle.vehicle_model,
      vehicle_base_price: vehicle.vehicle_base_price,
      vehicle_color: parseSpecString(vehicle.vehicle_color),
      vehicle_year: vehicle.vehicle_year,
      vehicle_fuel_economy: vehicle.vehicle_fuel_economy,
      vehicle_fuel_type: vehicle.vehicle_fuel_type,
      vehicle_transmission: parseSpecString(vehicle.vehicle_transmission),
      vehicle_lifting_capacity: parseSpecString(vehicle.vehicle_lifting_capacity),
      vehicle_towing_capacity: parseSpecString(vehicle.vehicle_towing_capacity),
      vehicle_payload_capacity: parseSpecString(vehicle.vehicle_payload_capacity),
      stock_quantity: vehicle.stock_quantity,
    });
  };

  const handleSaveVehicle = async () => {
    try {
      if (!vehicleForm.vehicle_name || !vehicleForm.vehicle_make || !vehicleForm.vehicle_model) {
        toast.error('Please fill in the required vehicle name, make, and model fields.');
        return;
      }

      const payload = {
        ...vehicleForm,
        vehicle_color: serializeList(vehicleForm.vehicle_color),
        vehicle_transmission: serializeList(vehicleForm.vehicle_transmission),
        vehicle_lifting_capacity: serializeList(vehicleForm.vehicle_lifting_capacity),
        vehicle_towing_capacity: serializeList(vehicleForm.vehicle_towing_capacity),
        vehicle_payload_capacity: serializeList(vehicleForm.vehicle_payload_capacity),
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicle_id, payload);
        setVehicles((current) => current.map((v) => (v.vehicle_id === editingVehicle.vehicle_id ? { ...v, ...payload } : v)));
        toast.success('Vehicle updated successfully.');
      } else {
        const newVehicle = await addVehicle(payload);
        setVehicles((current) => [newVehicle, ...current]);
        toast.success('Vehicle added successfully.');
      }

      resetVehicleForm();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save vehicle.');
    }
  };

  const handleSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadVehicleImage(file);
    } catch (error) {
      const message = (error as Error).message || 'Failed to upload image.';
      setImageUploadError(message);
      toast.error(message);
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

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
      toast.success('Supplier deleted');
    } catch {
      toast.error('Failed to delete supplier');
    }
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You do not have permission to access this page.</p>
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
            <p>Loading admin data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-48 bg-white shadow rounded-lg p-4 h-fit">
              <nav className="space-y-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('vehicles')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'vehicles' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Vehicles
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'orders' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setCurrentView('suppliers')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'suppliers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Suppliers
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'analytics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Analytics
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {currentView === 'dashboard' && (
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
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold">Pending Orders</h3>
                      <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold">Completed Orders</h3>
                      <p className="text-3xl font-bold text-teal-600">{stats.completedOrders}</p>
                    </div>
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

              {currentView === 'vehicles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Vehicle Inventory Management</h1>
                    <button
                      type="button"
                      onClick={resetVehicleForm}
                      className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
                    >
                      {editingVehicle ? 'New Vehicle' : 'Clear Form'}
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vehicle Name</label>
                          <input
                            value={vehicleForm.vehicle_name}
                            onChange={(e) => setVehicleField('vehicle_name', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Vehicle title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Make</label>
                          <input
                            value={vehicleForm.vehicle_make}
                            onChange={(e) => setVehicleField('vehicle_make', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dodge, Ford, Toyota"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <input
                            value={vehicleForm.vehicle_model}
                            onChange={(e) => setVehicleField('vehicle_model', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Model name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Year</label>
                          <input
                            value={vehicleForm.vehicle_year}
                            onChange={(e) => setVehicleField('vehicle_year', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="2024"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            type="number"
                            value={vehicleForm.vehicle_base_price}
                            onChange={(e) => setVehicleField('vehicle_base_price', Number(e.target.value))}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="29999"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                          <input
                            type="number"
                            value={vehicleForm.stock_quantity}
                            onChange={(e) => setVehicleField('stock_quantity', Number(e.target.value))}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="12"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Image URL</label>
                          <input
                            value={vehicleForm.vehicle_img_url}
                            onChange={(e) => setVehicleField('vehicle_img_url', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSelectImage}
                            className="mt-1 block w-full text-sm text-gray-700"
                          />
                          {uploadingImage && <p className="text-sm text-blue-600 mt-2">Uploading image...</p>}
                          {imageUploadError && <p className="text-sm text-red-600 mt-2">{imageUploadError}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vehicle Description</label>
                          <textarea
                            value={vehicleForm.vehicle_description}
                            onChange={(e) => setVehicleField('vehicle_description', e.target.value)}
                            className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Describe the vehicle..."
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                            <input
                              value={vehicleForm.vehicle_fuel_type}
                              onChange={(e) => setVehicleField('vehicle_fuel_type', e.target.value)}
                              className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Gasoline, Diesel"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fuel Economy</label>
                            <input
                              value={vehicleForm.vehicle_fuel_economy}
                              onChange={(e) => setVehicleField('vehicle_fuel_economy', e.target.value)}
                              className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="20 MPG"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Transmission Options</label>
                            <div className="flex gap-2 mt-2">
                              <input
                                value={newTransmission}
                                onChange={(e) => setNewTransmission(e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Automatic"
                              />
                              <button
                                type="button"
                                onClick={() => addVehicleSpec('vehicle_transmission', newTransmission, () => setNewTransmission(''))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Add
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {vehicleForm.vehicle_transmission.map((item, index) => (
                                <button
                                  key={`transmission-${index}`}
                                  type="button"
                                  onClick={() => removeVehicleSpec('vehicle_transmission', index)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                  {item}
                                  <span aria-hidden="true">×</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Color Options</label>
                            <div className="flex gap-2 mt-2">
                              <input
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Silver"
                              />
                              <button
                                type="button"
                                onClick={() => addVehicleSpec('vehicle_color', newColor, () => setNewColor(''))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Add
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {vehicleForm.vehicle_color.map((item, index) => (
                                <button
                                  key={`color-${index}`}
                                  type="button"
                                  onClick={() => removeVehicleSpec('vehicle_color', index)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                  {item}
                                  <span aria-hidden="true">×</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Lifting Capacity Options</label>
                            <div className="flex gap-2 mt-2">
                              <input
                                value={newLiftingCapacity}
                                onChange={(e) => setNewLiftingCapacity(e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="2,000 lbs"
                              />
                              <button
                                type="button"
                                onClick={() => addVehicleSpec('vehicle_lifting_capacity', newLiftingCapacity, () => setNewLiftingCapacity(''))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Add
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {vehicleForm.vehicle_lifting_capacity.map((item, index) => (
                                <button
                                  key={`lifting-${index}`}
                                  type="button"
                                  onClick={() => removeVehicleSpec('vehicle_lifting_capacity', index)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                  {item}
                                  <span aria-hidden="true">×</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Payload Capacity Options</label>
                            <div className="flex gap-2 mt-2">
                              <input
                                value={newPayloadCapacity}
                                onChange={(e) => setNewPayloadCapacity(e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1,500 lbs"
                              />
                              <button
                                type="button"
                                onClick={() => addVehicleSpec('vehicle_payload_capacity', newPayloadCapacity, () => setNewPayloadCapacity(''))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Add
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {vehicleForm.vehicle_payload_capacity.map((item, index) => (
                                <button
                                  key={`payload-${index}`}
                                  type="button"
                                  onClick={() => removeVehicleSpec('vehicle_payload_capacity', index)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                  {item}
                                  <span aria-hidden="true">×</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Towing Capacity Options</label>
                          <div className="flex gap-2 mt-2">
                            <input
                              value={newTowingCapacity}
                              onChange={(e) => setNewTowingCapacity(e.target.value)}
                              className="flex-1 border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="7,500 lbs"
                            />
                            <button
                              type="button"
                              onClick={() => addVehicleSpec('vehicle_towing_capacity', newTowingCapacity, () => setNewTowingCapacity(''))}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Add
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {vehicleForm.vehicle_towing_capacity.map((item, index) => (
                              <button
                                key={`towing-${index}`}
                                type="button"
                                onClick={() => removeVehicleSpec('vehicle_towing_capacity', index)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                              >
                                {item}
                                <span aria-hidden="true">×</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveVehicle}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                      </button>
                      <button
                        type="button"
                        onClick={resetVehicleForm}
                        className="px-6 py-3 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
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
                                onClick={() => handleEditVehicle(vehicle)}
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

            {currentView === 'suppliers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Suppliers</h1>
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
      </main>
      <Footer />
    </div>
  );
};

export default Admin;