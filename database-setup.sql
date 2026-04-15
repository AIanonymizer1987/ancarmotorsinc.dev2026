-- Create the vehicles table with correct structure
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(255) NOT NULL,
  vehicle_img_url TEXT,
  vehicle_description TEXT,
  vehicle_make VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_base_price DECIMAL(10,2) NOT NULL,
  vehicle_color VARCHAR(50) DEFAULT 'Various',
  vehicle_year VARCHAR(4) NOT NULL,
  vehicle_fuel_economy VARCHAR(50) DEFAULT '25 mpg',
  vehicle_fuel_type VARCHAR(50) NOT NULL,
  vehicle_transmission VARCHAR(255) DEFAULT '',
  vehicle_lifting_capacity VARCHAR(255) DEFAULT '',
  vehicle_towing_capacity VARCHAR(255) DEFAULT '',
  vehicle_payload_capacity VARCHAR(255) DEFAULT '',
  stock_quantity INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample vehicle data
INSERT INTO vehicles (vehicle_name, vehicle_img_url, vehicle_description, vehicle_make, vehicle_model, vehicle_base_price, vehicle_color, vehicle_year, vehicle_fuel_economy, vehicle_fuel_type, stock_quantity) VALUES
('2022 Toyota Camry', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Reliable mid-size sedan with a comfortable interior, great fuel economy, and advanced safety features. One-owner, full service history.', 'Toyota', 'Camry', 24999.00, 'Silver', '2022', '32 mpg city/41 mpg highway', 'Gasoline', 5),
('2023 Honda CR-V', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Compact SUV offering roomy cargo space and a smooth ride, perfect for families and daily commuters. Excellent safety equipment.', 'Honda', 'CR-V', 28999.00, 'Blue', '2023', '28 mpg city/34 mpg highway', 'Gasoline', 3),
('2021 BMW 3 Series', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Luxury sports sedan with exceptional performance, premium interior, and cutting-edge technology. Low mileage, excellent condition.', 'BMW', '3 Series', 32999.00, 'Black', '2021', '25 mpg city/36 mpg highway', 'Gasoline', 2),
('2022 Ford F-150', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'Powerful pickup truck with impressive towing capacity and rugged design. Perfect for work or recreation.', 'Ford', 'F-150', 35999.00, 'Red', '2022', '20 mpg city/24 mpg highway', 'Gasoline', 4);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on vehicles" ON vehicles FOR ALL USING (true);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) DEFAULT 'user',
  user_phone_number VARCHAR(20),
  user_address TEXT,
  user_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_img_url TEXT,
  product_model VARCHAR(255),
  product_color VARCHAR(50),
  product_pl_capacity VARCHAR(50),
  product_tw_capacity VARCHAR(50),
  product_transmission VARCHAR(50),
  product_quantity INTEGER NOT NULL,
  product_base_price DECIMAL(10,2) NOT NULL,
  product_total_price DECIMAL(10,2) NOT NULL,
  product_shipping_option VARCHAR(100),
  product_payment VARCHAR(100),
  product_status VARCHAR(50) DEFAULT 'pending',
  product_payment_status VARCHAR(50) DEFAULT 'pending',
  product_transaction VARCHAR(255),
  order_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255)
);

-- Create test_drives table
CREATE TABLE IF NOT EXISTS test_drives (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(12) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  user_email VARCHAR(255),
  nature_of_concern VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  responses TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on test_drives" ON test_drives FOR ALL USING (true);
CREATE POLICY "Allow all operations on suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);