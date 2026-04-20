import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getVehicles, getUsers, getOrders, getSuppliers, addVehicle, updateVehicle, deleteVehicle, updateOrder, addSupplier, updateSupplier, deleteSupplier, getTickets, updateTicket, updateUserVerificationStatus, exportTableData, importTableData, getDatabaseHealth } from '../utils/api';
import type { Vehicle, Order, User } from '../types';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Truck, Package } from 'lucide-react';

type ViewType = 'dashboard' | 'vehicles' | 'orders' | 'users' | 'suppliers' | 'analytics' | 'customer-service' | 'database-management';

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
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbTable, setDbTable] = useState('users');
  const [dbImportMode, setDbImportMode] = useState<'insert' | 'upsert'>('insert');
  const [dbImportData, setDbImportData] = useState<any>(null);
  const [dbImportFileName, setDbImportFileName] = useState('');
  const [dbExporting, setDbExporting] = useState(false);
  const [dbImporting, setDbImporting] = useState(false);
  const [dbImportError, setDbImportError] = useState<string | null>(null);
  const [dbImportResult, setDbImportResult] = useState<string | null>(null);
  const [dbHealth, setDbHealth] = useState<any | null>(null);
  const [dbHealthLoading, setDbHealthLoading] = useState(false);
  const [dbHealthError, setDbHealthError] = useState<string | null>(null);
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
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 5;
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierPage, setSupplierPage] = useState(1);
  const suppliersPerPage = 5;
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', contact_person: '', contact_phone: '', address: '' });
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketPage, setTicketPage] = useState(1);
  const ticketsPerPage = 5;
  const [analyticsRevenueView, setAnalyticsRevenueView] = useState<'monthly' | 'annually'>('monthly');

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    try {
      const [vehiclesData, ordersData, usersData, suppliersData, ticketsData] = await Promise.all([
        getVehicles(),
        getOrders(),
        getUsers(),
        getSuppliers(),
        getTickets(),
      ]);
      setVehicles(vehiclesData);
      setOrders(ordersData);
      setUsers(usersData);
      setSuppliers(suppliersData);
      setTickets(ticketsData);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && currentView === 'database-management') {
      fetchDbHealth();
    }
  }, [isAdmin, currentView]);

  const handleExportTable = async () => {
    setDbExporting(true);
    try {
      const rows = await exportTableData(dbTable);
      const content = JSON.stringify(rows, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dbTable}-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} rows from ${dbTable}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export table data');
    } finally {
      setDbExporting(false);
    }
  };

  const handleExportAllTables = async () => {
    setDbExporting(true);
    try {
      const allData = await exportTableData();
      const content = JSON.stringify(allData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-tables-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const totalRows = Object.values(allData as Record<string, any[]>).reduce(
        (sum, records) => sum + (Array.isArray(records) ? records.length : 0),
        0
      );
      toast.success(`Exported ${totalRows} rows from all tables`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to export all tables');
    } finally {
      setDbExporting(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDbImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed) && typeof parsed !== 'object') {
          throw new Error('Import file must contain a JSON array or object mapping tables to arrays.');
        }
        setDbImportData(parsed);
        setDbImportError(null);
        if (Array.isArray(parsed)) {
          setDbImportResult(`${parsed.length} records ready for import to ${dbTable}`);
        } else {
          setDbImportResult(`${Object.keys(parsed).length} tables ready for import`);
        }
      } catch (error: any) {
        setDbImportData(null);
        setDbImportError(error?.message || 'Invalid JSON file.');
        setDbImportResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitImport = async () => {
    if (!dbImportData || (Array.isArray(dbImportData) && !dbImportData.length) || (typeof dbImportData === 'object' && !Object.keys(dbImportData).length)) {
      toast.error('No import data loaded.');
      return;
    }
    setDbImporting(true);
    try {
      if (Array.isArray(dbImportData)) {
        await importTableData(dbTable, dbImportData, dbImportMode);
        toast.success(`Imported ${dbImportData.length} records into ${dbTable}`);
      } else {
        const tableCount = Object.keys(dbImportData).length;
        await importTableData(undefined, dbImportData, dbImportMode);
        toast.success(`Imported data into ${tableCount} tables`);
      }
      setDbImportData(null);
      setDbImportFileName('');
      setDbImportResult(null);
      await fetchData();
      await fetchDbHealth();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to import data');
    } finally {
      setDbImporting(false);
    }
  };

  const fetchDbHealth = async () => {
    setDbHealthLoading(true);
    setDbHealthError(null);
    try {
      const health = await getDatabaseHealth();
      setDbHealth(health);
    } catch (error: any) {
      setDbHealthError(error?.message || 'Failed to load database health');
      setDbHealth(null);
    } finally {
      setDbHealthLoading(false);
    }
  };


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

  const handleRequestRestock = (supplier: any) => {
    toast.info(`Restock request sent to ${supplier.name}.`);
  };

  const handleEmailSupplier = (supplier: any) => {
    const mailTo = `mailto:${supplier.email}?subject=Restock%20Request&body=Hello%20${encodeURIComponent(
      supplier.contact_person || supplier.name
    )},%0D%0A%0D%0AWe%20would%20like%20to%20request%20a%20stock%20replenishment.%20Please%20review%20our%20inventory%20levels.%0D%0A%0D%0AThanks.`;
    window.location.href = mailTo;
  };

  const stats = useMemo(() => {
    if (!isAdmin) return { totalVehicles: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 };

    const totalVehicles = vehicles.length;
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const completedOrders = orders.filter(o => o.product_status === 'completed').length;
    const totalRevenue = orders
      .filter(o => o.product_status === 'completed')
      .reduce((sum, order) => sum + Number(order.product_total_price || 0), 0);
    const pendingOrders = orders.filter(o => o.product_status === 'pending').length;
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

  const getOrderMake = (order: Order) => {
    const name = (order.product_name || order.product_model || '').toLowerCase();
    if (name.includes('isuzu elf') || name.includes('elf')) return 'Isuzu Elf';
    if (name.includes('isuzu forward') || name.includes('forward')) return 'Isuzu Forward';
    if (name.includes('isuzu giga') || name.includes('giga')) return 'Isuzu Giga';
    return 'Other';
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = orderSearch.toLowerCase();
      const matchesSearch =
        order.order_id.toString().includes(search) ||
        (order.order_code || '').toLowerCase().includes(search) ||
        order.product_name.toLowerCase().includes(search) ||
        order.product_model.toLowerCase().includes(search) ||
        order.user_id.toLowerCase().includes(search);

      const matchesStatus = orderStatusFilter === 'all' || order.product_status === orderStatusFilter;
      const matchesRole = true;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const search = userSearch.toLowerCase();
      const matchesSearch =
        item.user_name.toLowerCase().includes(search) ||
        item.user_email.toLowerCase().includes(search) ||
        item.user_role.toLowerCase().includes(search) ||
        item.id.toString().includes(search);

      const matchesRole = userRoleFilter === 'all' || item.user_role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, userPage]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const search = supplierSearch.toLowerCase();
      return (
        (supplier.name || '').toLowerCase().includes(search) ||
        (supplier.contact_person || '').toLowerCase().includes(search) ||
        (supplier.email || '').toLowerCase().includes(search) ||
        (supplier.contact_phone || '').toLowerCase().includes(search)
      );
    });
  }, [suppliers, supplierSearch]);

  const paginatedSuppliers = useMemo(() => {
    const start = (supplierPage - 1) * suppliersPerPage;
    return filteredSuppliers.slice(start, start + suppliersPerPage);
  }, [filteredSuppliers, supplierPage]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const search = ticketSearch.toLowerCase();
      const matchesSearch =
        ticket.ticket_id.toString().includes(search) ||
        ticket.username.toLowerCase().includes(search) ||
        ticket.title.toLowerCase().includes(search) ||
        ticket.nature_of_concern.toLowerCase().includes(search);
      const matchesStatus = ticketStatusFilter === 'all' || ticket.status === ticketStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, ticketSearch, ticketStatusFilter]);

  const paginatedTickets = useMemo(() => {
    const start = (ticketPage - 1) * ticketsPerPage;
    return filteredTickets.slice(start, start + ticketsPerPage);
  }, [filteredTickets, ticketPage]);

  const orderStatusByMake = useMemo(() => {
    const makes = ['Isuzu Elf', 'Isuzu Forward', 'Isuzu Giga'];
    return makes.map((make) => {
      const counts = orders
        .filter((order) => getOrderMake(order) === make)
        .reduce((acc, order) => {
          const status = order.product_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      return {
        make,
        data: Object.entries(counts).map(([status, count]) => ({ status, count })),
      };
    });
  }, [orders]);

  const unitsSoldByMake = useMemo(() => {
    const makes = ['Isuzu Elf', 'Isuzu Forward', 'Isuzu Giga'];
    return makes.map((make) => ({
      make,
      sold: orders
        .filter((order) => getOrderMake(order) === make)
        .reduce((sum, order) => sum + (order.product_quantity || 0), 0),
    }));
  }, [orders]);

  const popularUnits = useMemo(() => {
    const counts = orders.reduce((acc, order) => {
      const name = order.product_name || order.product_model || 'Unknown Vehicle';
      acc[name] = (acc[name] || 0) + (order.product_quantity || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders]);

  const revenueTrend = useMemo(() => {
    const monthlyMap = new Map<string, number>();
    const annualMap = new Map<string, number>();
    orders
      .filter((order) => order.product_status === 'completed')
      .forEach((order) => {
        const timestamp = new Date(order.order_timestamp);
        if (Number.isNaN(timestamp.getTime())) return;
        const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
        const yearKey = `${timestamp.getFullYear()}`;
        const value = Number(order.product_total_price || 0);
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + value);
        annualMap.set(yearKey, (annualMap.get(yearKey) || 0) + value);
      });
    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ label: month, revenue: amount }));
    const annually = Array.from(annualMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, amount]) => ({ label: year, revenue: amount }));
    return { monthly, annually };
  }, [orders]);

  const revenueTrendData = analyticsRevenueView === 'monthly' ? revenueTrend.monthly : revenueTrend.annually;

  const revenueTrendLabel = analyticsRevenueView === 'monthly' ? 'Monthly Revenue' : 'Annual Revenue';

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
                  Inventory
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'orders' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'users' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Users
                </button>
                <button
                  onClick={() => setCurrentView('suppliers')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'suppliers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Suppliers
                </button>
                <button
                  onClick={() => isAdmin && setCurrentView('database-management')}
                  disabled={!isAdmin}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'database-management' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'} ${!isAdmin ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  Database Management
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'analytics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setCurrentView('customer-service')}
                  className={`w-full text-left px-3 py-2 rounded ${currentView === 'customer-service' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Customer Service
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {currentView === 'dashboard' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_2.6fr]">
                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-lg">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-bold text-white shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Logged in administrator</p>
                            <h2 className="text-2xl font-semibold text-slate-900">{user?.name || 'N/A'}</h2>
                            <p className="mt-1 text-sm text-slate-500">{user?.email || 'No email available'}</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-right sm:text-left">
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                            {user?.role?.toUpperCase() || 'USER'}
                          </span>
                          <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
                            <button
                              type="button"
                              onClick={() => (window.location.href = '/admin-account')}
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                            >
                              Edit Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentView('database-management')}
                              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              Database Management
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{user?.email || 'N/A'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{user?.phone || 'N/A'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">{user?.role || 'N/A'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{user?.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
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
                        <p className="text-3xl font-bold text-yellow-600">₱{stats.totalRevenue.toLocaleString()}</p>
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
                </div>
              )}

            {currentView === 'database-management' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Database Management</h1>
                {!isAdmin ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h2 className="text-lg font-semibold text-red-700">Access restricted</h2>
                    <p className="mt-2 text-sm text-red-600">
                      Database import/export is available only to administrators. Please sign in with an administrator account or contact the site owner for access.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Table</label>
                        <select
                          value={dbTable}
                          onChange={(e) => setDbTable(e.target.value)}
                          className="mt-2 block w-full rounded border-gray-300 bg-white p-2"
                        >
                          <option value="users">users</option>
                          <option value="orders">orders</option>
                          <option value="public.vehicles">public.vehicles</option>
                          <option value="suppliers">suppliers</option>
                          <option value="tickets">tickets</option>
                          <option value="test_drives">test_drives</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Import mode</label>
                        <select
                          value={dbImportMode}
                          onChange={(e) => setDbImportMode(e.target.value as 'insert' | 'upsert')}
                          className="mt-2 block w-full rounded border-gray-300 bg-white p-2"
                        >
                          <option value="insert">Insert only</option>
                          <option value="upsert">Upsert (insert/update)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                        <h2 className="text-lg font-semibold mb-3">Export</h2>
                        <p className="text-sm text-gray-600">Download the current table contents or all tables as JSON.</p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={handleExportTable}
                            disabled={dbExporting}
                            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {dbExporting ? 'Exporting…' : 'Export Table'}
                          </button>
                          <button
                            type="button"
                            onClick={handleExportAllTables}
                            disabled={dbExporting}
                            className="inline-flex items-center justify-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {dbExporting ? 'Exporting…' : 'Export All Tables'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                        <h2 className="text-lg font-semibold mb-3">Import</h2>
                        <p className="text-sm text-gray-600">Upload a JSON array of records for the selected table, or a JSON object keyed by table name for multi-table import.</p>
                        <input
                          type="file"
                          accept="application/json"
                          onChange={handleImportFile}
                          className="mt-3 block w-full text-sm text-slate-700"
                        />
                        {dbImportFileName && <p className="mt-2 text-sm text-slate-600">Loaded file: {dbImportFileName}</p>}
                        {dbImportResult && <p className="mt-2 text-sm text-green-700">{dbImportResult}</p>}
                        {dbImportError && <p className="mt-2 text-sm text-red-700">{dbImportError}</p>}
                        <button
                          type="button"
                          onClick={handleSubmitImport}
                          disabled={dbImporting || !dbImportData || (Array.isArray(dbImportData) ? !dbImportData.length : !Object.keys(dbImportData).length)}
                          className="mt-4 inline-flex items-center justify-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {dbImporting ? 'Importing…' : 'Import JSON'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-gray-200 bg-slate-50 p-4">
                      <h2 className="text-lg font-semibold mb-3">Database Health</h2>
                      {dbHealthLoading ? (
                        <p className="text-sm text-gray-600">Checking database health…</p>
                      ) : dbHealthError ? (
                        <p className="text-sm text-red-600">{dbHealthError}</p>
                      ) : dbHealth ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold text-gray-900">{dbHealth.connected ? 'Connected' : 'Disconnected'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Database</p>
                            <p className="font-semibold text-gray-900">{dbHealth.database}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Schema</p>
                            <p className="font-semibold text-gray-900">{dbHealth.schema}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Server Time</p>
                            <p className="font-semibold text-gray-900">{new Date(dbHealth.server_time).toLocaleString()}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No database health data available yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-sm text-gray-600">Search by order id, code, vehicle, user, or status.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value);
                        setOrderPage(1);
                      }}
                      placeholder="Search orders..."
                      className="w-full sm:w-64 border rounded px-3 py-2"
                    />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(e.target.value);
                        setOrderPage(1);
                      }}
                      className="w-full sm:w-48 border rounded px-3 py-2"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left"></th>
                        <th className="px-4 py-2 text-left">Image</th>
                        <th className="px-4 py-2 text-left">Order ID</th>
                        <th className="px-4 py-2 text-left">Order Code</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Vehicle</th>
                        <th className="px-4 py-2 text-left">Total Price</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Payment Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order.order_id} className="border-t">
                          <td className="px-4 py-2">
                            <Package className="w-5 h-5 text-green-600" />
                          </td>
                          <td className="px-4 py-2">
                            {order.product_img_url ? (
                              <img
                                src={order.product_img_url}
                                alt={order.product_name}
                                className="w-16 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2">{order.order_id}</td>
                          <td className="px-4 py-2">{order.order_code || '—'}</td>
                          <td className="px-4 py-2">{order.user_id}</td>
                          <td className="px-4 py-2">{order.product_name}</td>
                          <td className="px-4 py-2">₱{Number(order.product_total_price || 0).toLocaleString()}</td>
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
                          <td className="px-4 py-2">{order.payment_reference || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>
                    Showing {paginatedOrders.length} of {filteredOrders.length} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={orderPage <= 1}
                      onClick={() => setOrderPage((page) => Math.max(page - 1, 1))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {orderPage} of {Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage))}</span>
                    <button
                      type="button"
                      disabled={orderPage >= Math.ceil(filteredOrders.length / ordersPerPage)}
                      onClick={() => setOrderPage((page) => Math.min(page + 1, Math.ceil(filteredOrders.length / ordersPerPage)))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                      placeholder="Search users..."
                      className="w-full sm:w-64 border rounded px-3 py-2"
                    />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserPage(1);
                      }}
                      className="w-full sm:w-48 border rounded px-3 py-2"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">User ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Verification</th>
                        <th className="px-4 py-2 text-left">Voucher Balance</th>
                        <th className="px-4 py-2 text-left">Vouchers</th>
                        <th className="px-4 py-2 text-left">ID Photo</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((userItem) => (
                        <tr key={userItem.id} className="border-t">
                          <td className="px-4 py-2">{userItem.id}</td>
                          <td className="px-4 py-2">{userItem.user_name}</td>
                          <td className="px-4 py-2">{userItem.user_email}</td>
                          <td className="px-4 py-2">{userItem.user_role}</td>
                          <td className="px-4 py-2">{userItem.id_verification_status || 'Not requested'}</td>
                          <td className="px-4 py-2">₱{Number(userItem.voucher_balance || 0).toLocaleString()}</td>
                          <td className="px-4 py-2">{userItem.voucher_codes || '—'}</td>
                          <td className="px-4 py-2">
                            {userItem.id_photo_url ? (
                              <a href={userItem.id_photo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                View
                              </a>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            {userItem.id_verification_status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await updateUserVerificationStatus(userItem.id, 'approved');
                                      setUsers((current) => current.map((u) => (u.id === userItem.id ? { ...u, id_verification_status: 'approved' } : u)));
                                      toast.success('Verification request approved');
                                    } catch {
                                      toast.error('Failed to update verification status');
                                    }
                                  }}
                                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await updateUserVerificationStatus(userItem.id, 'denied');
                                      setUsers((current) => current.map((u) => (u.id === userItem.id ? { ...u, id_verification_status: 'denied' } : u)));
                                      toast.success('Verification request denied');
                                    } catch {
                                      toast.error('Failed to update verification status');
                                    }
                                  }}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  Deny
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-gray-600">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Showing {paginatedUsers.length} of {filteredUsers.length} users</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((page) => Math.max(page - 1, 1))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {userPage} of {Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))}</span>
                    <button
                      type="button"
                      disabled={userPage >= Math.ceil(filteredUsers.length / usersPerPage)}
                      onClick={() => setUserPage((page) => Math.min(page + 1, Math.ceil(filteredUsers.length / usersPerPage)))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'vehicles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
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
                          <th className="px-4 py-2 text-left"></th>
                          <th className="px-4 py-2 text-left">Image</th>
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
                            <td className="px-4 py-2">
                              <Truck className="w-5 h-5 text-blue-600" />
                            </td>
                            <td className="px-4 py-2">
                              {vehicle.vehicle_img_url ? (
                                <img 
                                  src={vehicle.vehicle_img_url} 
                                  alt={vehicle.vehicle_name}
                                  className="w-16 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                  No image
                                </div>
                              )}
                            </td>
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
                <div className="grid gap-4 lg:grid-cols-2 lg:items-end">
                  <div>
                    <h1 className="text-2xl font-bold">Suppliers</h1>
                    <p className="text-sm text-gray-600">Search suppliers and manage supplier contacts.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={supplierSearch}
                      onChange={(e) => {
                        setSupplierSearch(e.target.value);
                        setSupplierPage(1);
                      }}
                      placeholder="Search suppliers..."
                      className="w-full border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setSupplierPage(1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-lg font-semibold mb-3">Add New Supplier</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Supplier Name"
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Supplier Email"
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      value={newSupplier.contact_person}
                      onChange={(e) => setNewSupplier((prev) => ({ ...prev, contact_person: e.target.value }))}
                      placeholder="Contact Person"
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      value={newSupplier.contact_phone}
                      onChange={(e) => setNewSupplier((prev) => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="Contact Phone"
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      className="w-full border rounded px-3 py-2 md:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newSupplier.name || !newSupplier.email) {
                          toast.error('Supplier name and email are required');
                          return;
                        }
                        try {
                          const created = await addSupplier(newSupplier);
                          setSuppliers((current) => [created, ...current]);
                          setNewSupplier({ name: '', email: '', contact_person: '', contact_phone: '', address: '' });
                          toast.success('Supplier added successfully');
                        } catch (error: any) {
                          toast.error(error?.message || 'Failed to add supplier');
                        }
                      }}
                      className="mt-2 inline-flex items-center justify-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Add Supplier
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Contact</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Address</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-t">
                          <td className="px-4 py-2">{supplier.name}</td>
                          <td className="px-4 py-2">{supplier.contact_person || '—'}</td>
                          <td className="px-4 py-2">{supplier.email}</td>
                          <td className="px-4 py-2">{supplier.contact_phone || '—'}</td>
                          <td className="px-4 py-2">{supplier.address || '—'}</td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              onClick={() => handleRequestRestock(supplier)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              Request Restock
                            </button>
                            <button
                              onClick={() => handleEmailSupplier(supplier)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Email
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
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Showing {paginatedSuppliers.length} of {filteredSuppliers.length} suppliers</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={supplierPage <= 1}
                      onClick={() => setSupplierPage((page) => Math.max(page - 1, 1))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {supplierPage} of {Math.max(1, Math.ceil(filteredSuppliers.length / suppliersPerPage))}</span>
                    <button
                      type="button"
                      disabled={supplierPage >= Math.ceil(filteredSuppliers.length / suppliersPerPage)}
                      onClick={() => setSupplierPage((page) => Math.min(page + 1, Math.ceil(filteredSuppliers.length / suppliersPerPage)))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'analytics' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Vehicle Make Status Summary</h2>
                    <div className="space-y-4">
                      {orderStatusByMake.map((makeData) => (
                        <div key={makeData.make} className="rounded-lg border p-3 bg-slate-50">
                          <h3 className="font-semibold mb-2">{makeData.make}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            {makeData.data.map((entry) => (
                              <div key={`${makeData.make}-${entry.status}`} className="rounded bg-white p-2 shadow-sm">
                                <div className="font-semibold capitalize">{entry.status}</div>
                                <div>{entry.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Units Sold by Make</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={unitsSoldByMake} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="make" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Bar dataKey="sold" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Most Popular Units</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={popularUnits} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Bar dataKey="sold" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{revenueTrendLabel}</h2>
                      <p className="text-sm text-gray-600">Completed order revenue trend over time.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAnalyticsRevenueView('monthly')}
                        className={`px-3 py-2 rounded ${analyticsRevenueView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalyticsRevenueView('annually')}
                        className={`px-3 py-2 rounded ${analyticsRevenueView === 'annually' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Annual
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={revenueTrendData} margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis width={90} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                      <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {currentView === 'customer-service' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Customer Service Tickets</h1>
                    <p className="text-sm text-gray-600">Search tickets by ID, customer, subject, or status.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={ticketSearch}
                      onChange={(e) => {
                        setTicketSearch(e.target.value);
                        setTicketPage(1);
                      }}
                      placeholder="Search tickets..."
                      className="w-full sm:w-64 border rounded px-3 py-2"
                    />
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => {
                        setTicketStatusFilter(e.target.value);
                        setTicketPage(1);
                      }}
                      className="w-full sm:w-48 border rounded px-3 py-2"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Ticket ID</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Customer</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Subject</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Category</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paginatedTickets.map((ticket) => (
                          <TicketRow key={ticket.id} ticket={ticket} onUpdate={() => setTickets((current) => current.map((t) => (t.id === ticket.id ? { ...t, status: ticket.status } : t)))} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Showing {paginatedTickets.length} of {filteredTickets.length} tickets</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={ticketPage <= 1}
                      onClick={() => setTicketPage((page) => Math.max(page - 1, 1))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {ticketPage} of {Math.max(1, Math.ceil(filteredTickets.length / ticketsPerPage))}</span>
                    <button
                      type="button"
                      disabled={ticketPage >= Math.ceil(filteredTickets.length / ticketsPerPage)}
                      onClick={() => setTicketPage((page) => Math.min(page + 1, Math.ceil(filteredTickets.length / ticketsPerPage)))}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
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

// Ticket Row Component with Response Functionality
const TicketRow: React.FC<{ ticket: any; onUpdate: () => void }> = ({ ticket, onUpdate }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      const responses = ticket.responses ? JSON.parse(ticket.responses) : [];
      responses.push({
        message: responseText,
        timestamp: new Date().toISOString(),
        admin: true,
      });
      
      await updateTicket(ticket.id, {
        responses: JSON.stringify(responses),
      });

      toast.success('Response added successfully');
      setResponseText('');
      setShowResponse(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateTicket(ticket.id, { status: newStatus });
      toast.success(`Ticket status updated to ${newStatus}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'closed') return 'bg-gray-100 text-gray-800';
    if (status === 'resolved') return 'bg-green-100 text-green-800';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <>
      <tr>
        <td className="px-4 py-3 text-sm font-mono text-blue-600">#{ticket.ticket_id}</td>
        <td className="px-4 py-3 text-sm">{ticket.username}</td>
        <td className="px-4 py-3 text-sm font-medium">{ticket.title}</td>
        <td className="px-4 py-3 text-sm capitalize">{ticket.nature_of_concern}</td>
        <td className="px-4 py-3">
          <select
            value={ticket.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(ticket.status)}`}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </td>
        <td className="px-4 py-3 text-sm">{new Date(ticket.created_at).toLocaleDateString()}</td>
        <td className="px-4 py-3 text-sm">
          <button
            onClick={() => setShowResponse(!showResponse)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
          >
            {showResponse ? 'Cancel' : 'Reply'}
          </button>
        </td>
      </tr>
      {showResponse && (
        <tr>
          <td colSpan={7} className="px-4 py-3 bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Message:</label>
                <p className="bg-white p-3 rounded text-sm text-gray-700 mb-3">{ticket.body}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Response:</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResponse(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResponse}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};