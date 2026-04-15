export interface Vehicle {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_img_url: string;
  vehicle_description: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_base_price: number;
  vehicle_color: string;
  vehicle_year: string;
  vehicle_fuel_economy: string;
  vehicle_fuel_type: string;
  vehicle_transmission: string;
  vehicle_lifting_capacity: string;
  vehicle_towing_capacity: string;
  vehicle_payload_capacity: string;
  stock_quantity: number;
}

export interface User {
  id: number;
  user_email: string;
  user_password: string;
  user_role: string;
  user_phone_number: string;
  user_address: string;
  user_name: string;
}

export interface Order {
  order_id: number;
  product_name: string;
  product_img_url: string;
  product_model: string;
  product_color: string;
  product_pl_capacity: string;
  product_tw_capacity: string;
  product_transmission: string;
  product_quantity: number;
  product_base_price: number;
  product_total_price: number;
  product_shipping_option: string;
  product_payment: string;
  product_status: string;
  product_payment_status: string;
  product_transaction: string;
  order_timestamp: string;
  user_id: string;
  username: string;
}

export interface TestDrive {
  id: number;
  user_id: string;
  vehicle_id: number;
  requested_date: string;
  requested_time: string;
  status: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export interface Ticket {
  id: number;
  user_id: string;
  username: string;
  user_email: string;
  nature_of_concern: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
}