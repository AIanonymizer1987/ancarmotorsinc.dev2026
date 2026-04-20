import type { Vehicle, User, Order } from '../types';

const API_URL = '/api/neon';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('ancar_auth_state_v1') : null;
  if (token) {
    try {
      const authState = JSON.parse(token);
      if (authState.token) {
        headers.Authorization = `Bearer ${authState.token}`;
      }
    } catch {}
  }
  return headers;
};

// Generate 12-digit randomized ticket ID
export const generateTicketId = (): string => {
  return Math.floor(Math.random() * 999999999999)
    .toString()
    .padStart(12, '0');
};

// Vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await fetch(`${API_URL}/public.vehicles?select=*`, { headers: getHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error in getVehicles:', error);
    throw error;
  }
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await fetch(`${API_URL}/public.vehicles?vehicle_id=eq.${id}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  const data = await response.json();
  return data[0];
};

export const updateVehicle = async (id: number, updates: Partial<Vehicle>): Promise<void> => {
  const response = await fetch(`${API_URL}/public.vehicles?vehicle_id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'vehicle_id'>): Promise<Vehicle> => {
  const response = await fetch(`${API_URL}/public.vehicles`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vehicle),
  });
  if (!response.ok) throw new Error('Failed to add vehicle');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const deleteVehicle = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/public.vehicles?vehicle_id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete vehicle');
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users?select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getUser = async (email: string): Promise<User | null> => {
  const response = await fetch(`${API_URL}/users?user_email=eq.${encodeURIComponent(email)}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  return data[0] || null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const response = await fetch(`${API_URL}/users?id=eq.${id}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  return data[0] || null;
};

export const requestEmailVerification = async (userId: number, code: string, requestedAt: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      email_verification_code: code,
      verification_requested_at: requestedAt,
      user_email_verified: false,
    }),
  });
  if (!response.ok) throw new Error('Failed to request email verification');
};

export const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
  const user = await getUser(email);
  if (!user || user.email_verification_code !== code) return false;
  await updateUser(user.id, {
    user_email_verified: true,
    email_verification_code: null,
    verification_requested_at: null,
  });
  return true;
};

export const requestPasswordChangeVerification = async (userId: number, code: string, requestedAt: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      password_verification_code: code,
      verification_requested_at: requestedAt,
    }),
  });
  if (!response.ok) throw new Error('Failed to request password verification');
};

export const verifyPasswordChangeCode = async (userId: number, code: string): Promise<boolean> => {
  const user = await getUserById(userId);
  if (!user || user.password_verification_code !== code) return false;
  await updateUser(user.id, { password_verification_code: null, verification_requested_at: null });
  return true;
};

export const changePassword = async (userId: number, oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      user_password: newPassword,
      password_verification_code: null,
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to change password: ${error}`);
  }
};

export const changeEmail = async (userId: number, newEmail: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ user_email: newEmail, user_email_verified: false }),
  });
  if (!response.ok) throw new Error('Failed to change email');
};

export const updateProfilePicture = async (userId: number, pictureUrl: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ user_profile_picture: pictureUrl }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update profile picture: ${error}`);
  }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Failed to add user');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const updateUser = async (id: number, updates: Partial<User>): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update user');
};

export const claimVoucher = async (userId: number, code: string, amount: number): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const existingCodes = (user.voucher_codes || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (existingCodes.includes(code)) {
    throw new Error('Voucher already claimed');
  }

  const updatedCodes = [...existingCodes, code].join(', ');
  const updatedBalance = Number(user.voucher_balance || 0) + amount;

  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ voucher_codes: updatedCodes, voucher_balance: updatedBalance }),
  });

  if (!response.ok) throw new Error('Failed to claim voucher');
};

export const requestIdVerification = async (userId: number, idPhotoUrl: string, requestedAt: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      id_photo_url: idPhotoUrl,
      id_verification_status: 'pending',
      id_verification_requested_at: requestedAt,
    }),
  });
  if (!response.ok) throw new Error('Failed to request ID verification');
};

export const updateUserVerificationStatus = async (userId: number, status: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ id_verification_status: status }),
  });
  if (!response.ok) throw new Error('Failed to update verification status');
};

export const exportTableData = async (table?: string): Promise<any> => {
  const query = table ? `?table=${encodeURIComponent(table)}` : '?all=true';
  const response = await fetch(`/api/db-admin/export${query}`, { headers: getHeaders() });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to export table data: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

export const importTableData = async (
  table: string | undefined,
  records: any,
  mode: 'insert' | 'upsert'
): Promise<void> => {
  const response = await fetch(`/api/db-admin/import`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ table, records, mode }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to import table data: ${response.status} ${response.statusText} - ${errorText}`);
  }
};

export const getDatabaseHealth = async (): Promise<any> => {
  const response = await fetch('/api/db-admin/health', { headers: getHeaders() });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch database health: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders?select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getOrder = async (id: number): Promise<Order> => {
  if (Number.isNaN(id) || id <= 0) {
    throw new Error('Invalid order id');
  }

  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch order');
  const data = await response.json();
  return data[0];
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders?user_id=eq.${userId}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user orders');
  return response.json();
};

export const addOrder = async (order: Omit<Order, 'order_id' | 'order_timestamp'>): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add order: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const updateOrder = async (id: number, updates: Partial<Order>): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update order');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete order');
};

// Test Drives (assuming table name test_drives)
export const getTestDrives = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/test_drives?select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch test drives');
  return response.json();
};

export const getUserTestDrives = async (userId: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/test_drives?user_id=eq.${userId}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user test drives');
  return response.json();
};

export const updateTestDrive = async (id: number, updates: any): Promise<void> => {
  const response = await fetch(`${API_URL}/test_drives?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update test drive');
};

export const addTestDrive = async (testDrive: any): Promise<any> => {
  const response = await fetch(`${API_URL}/test_drives`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(testDrive),
  });
  if (!response.ok) throw new Error('Failed to add test drive');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

// Suppliers
export const getSuppliers = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/suppliers?select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  return response.json();
};

export const addSupplier = async (supplier: any): Promise<any> => {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) throw new Error('Failed to add supplier');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const updateSupplier = async (id: number, updates: any): Promise<void> => {
  const response = await fetch(`${API_URL}/suppliers?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update supplier');
};

export const deleteSupplier = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/suppliers?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete supplier');
};

// Tickets
export const getTickets = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/tickets?select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return response.json();
};

export const getUserTickets = async (userId: string): Promise<any[]> => {
  const response = await fetch(`${API_URL}/tickets?user_id=eq.${userId}&select=*`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user tickets');
  return response.json();
};

export const addTicket = async (ticket: any): Promise<any> => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ticket),
  });
  if (!response.ok) throw new Error('Failed to create ticket');
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
};

export const updateTicket = async (id: number, updates: any): Promise<void> => {
  const response = await fetch(`${API_URL}/tickets?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update ticket');
};

export const deleteTicket = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/tickets?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete ticket');
};

