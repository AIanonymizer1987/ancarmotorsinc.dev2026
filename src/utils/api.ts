import type { Vehicle, User, Order } from '../types';

const API_URL = import.meta.env.VITE_NEON_API_URL;
const ANON_KEY = import.meta.env.VITE_NEON_ANON_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
};

// Vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await fetch(`${API_URL}/vehicle_details?select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await fetch(`${API_URL}/vehicle_details?id=eq.${id}&select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  const data = await response.json();
  return data[0];
};

export const updateVehicle = async (id: number, updates: Partial<Vehicle>): Promise<void> => {
  const response = await fetch(`${API_URL}/vehicle_details?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
};

export const addVehicle = async (vehicle: Omit<Vehicle, 'vehicle_id'>): Promise<Vehicle> => {
  const response = await fetch(`${API_URL}/vehicle_details`, {
    method: 'POST',
    headers,
    body: JSON.stringify(vehicle),
  });
  if (!response.ok) throw new Error('Failed to add vehicle');
  return response.json();
};

export const deleteVehicle = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/vehicle_details?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete vehicle');
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users?select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getUser = async (email: string): Promise<User | null> => {
  const response = await fetch(`${API_URL}/users?user_email=eq.${email}&select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch user');
  const data = await response.json();
  return data[0] || null;
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Failed to add user');
  return response.json();
};

export const updateUser = async (id: number, updates: Partial<User>): Promise<void> => {
  const response = await fetch(`${API_URL}/users?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update user');
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders?select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}&select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch order');
  const data = await response.json();
  return data[0];
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders?user_id=eq.${userId}&select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch user orders');
  return response.json();
};

export const addOrder = async (order: Omit<Order, 'order_id' | 'order_timestamp'>): Promise<Order> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error('Failed to add order');
  return response.json();
};

export const updateOrder = async (id: number, updates: Partial<Order>): Promise<void> => {
  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update order');
};

export const deleteOrder = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/orders?order_id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete order');
};

// Test Drives (assuming table name test_drives)
export const getTestDrives = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/test_drives?select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch test drives');
  return response.json();
};

export const addTestDrive = async (testDrive: any): Promise<any> => {
  const response = await fetch(`${API_URL}/test_drives`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testDrive),
  });
  if (!response.ok) throw new Error('Failed to add test drive');
  return response.json();
};

// Suppliers
export const getSuppliers = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/suppliers?select=*`, { headers });
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  return response.json();
};

export const addSupplier = async (supplier: any): Promise<any> => {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(supplier),
  });
  if (!response.ok) throw new Error('Failed to add supplier');
  return response.json();
};

export const updateSupplier = async (id: number, updates: any): Promise<void> => {
  const response = await fetch(`${API_URL}/suppliers?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update supplier');
};

export const deleteSupplier = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/suppliers?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) throw new Error('Failed to delete supplier');
};