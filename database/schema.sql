-- Rent-A-Car Management System — PostgreSQL schema
-- Run with: npm run migrate  (or: psql "$DATABASE_URL" -f database/schema.sql)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Users (Super Admin / Manager / Driver / Customer) — module 1, 6, 8, 9
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('superadmin', 'manager', 'driver', 'customer')),
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,

  full_name text NOT NULL,
  mobile_number text NOT NULL UNIQUE,
  email text UNIQUE,
  password text NOT NULL,

  address jsonb,
  identification jsonb,
  driving_license jsonb,
  profile_picture text,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,

  is_verified boolean NOT NULL DEFAULT false,
  central_status text NOT NULL DEFAULT 'active'
    CHECK (central_status IN ('active', 'inactive', 'suspended', 'blocked')),
  is_activated boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,

  driver_status text
    CHECK (driver_status IN ('pending', 'approved', 'available', 'assigned', 'on-trip', 'offline', 'suspended', 'inactive')),

  otp_code text,
  otp_purpose text CHECK (otp_purpose IN ('registration', 'login', 'reset-password', 'change-mobile')),
  otp_expires_at timestamptz,

  verification_token text,
  reset_password_token text,
  reset_password_expires timestamptz,

  failed_login_attempts int NOT NULL DEFAULT 0,
  last_login_ip text,

  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_central_status ON users(central_status);
CREATE INDEX IF NOT EXISTS idx_users_driver_status ON users(driver_status);

-- ---------------------------------------------------------------------------
-- 2. Vehicle Categories — module 20
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Vehicles — module 2, 7
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  vehicle_name text NOT NULL,
  brand text NOT NULL,
  vehicle_model text NOT NULL,
  category_id uuid REFERENCES vehicle_categories(id),
  vehicle_type text NOT NULL
    CHECK (vehicle_type IN ('sedan', 'suv', 'hatchback', 'microbus', 'minibus', 'bus', 'pickup', 'van', 'coaster', 'other')),

  images text[] NOT NULL DEFAULT '{}',
  registration_number text NOT NULL UNIQUE,
  model_year int NOT NULL,
  seating_capacity int NOT NULL,

  fuel_type text NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'electric', 'hybrid')),
  transmission text NOT NULL CHECK (transmission IN ('manual', 'automatic')),
  is_ac boolean NOT NULL DEFAULT true,
  features text[] NOT NULL DEFAULT '{}',
  color text,

  location jsonb,
  estimated_rental_rate jsonb,

  availability_status text NOT NULL DEFAULT 'pending'
    CHECK (availability_status IN ('pending', 'approved', 'rejected', 'available', 'assigned', 'on-trip', 'maintenance', 'inactive')),

  driver_required boolean NOT NULL DEFAULT false,
  owner_info jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_by uuid REFERENCES users(id),
  updated_by uuid REFERENCES users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(availability_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_name_brand ON vehicles USING gin (to_tsvector('simple', vehicle_name || ' ' || brand));

-- ---------------------------------------------------------------------------
-- 4. Locations — module 21
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  district text,
  latitude numeric,
  longitude numeric,
  type text NOT NULL DEFAULT 'popular' CHECK (type IN ('pickup', 'dropoff', 'popular')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

-- ---------------------------------------------------------------------------
-- 5. Rental Requests — module 3, 4, 5, 10, 11, 12, 13
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id uuid NOT NULL REFERENCES users(id),
  trip_type text NOT NULL CHECK (trip_type IN ('single', 'round', 'down')),
  vehicle_id uuid REFERENCES vehicles(id),

  pickup_location jsonb NOT NULL,
  destination jsonb NOT NULL,
  return_location jsonb,

  pickup_date date NOT NULL,
  pickup_time text NOT NULL,
  return_date date,
  return_time text,

  passenger_count int NOT NULL DEFAULT 1,
  driver_required boolean NOT NULL DEFAULT false,
  special_instructions text,
  contact_number text NOT NULL,

  estimated_distance_km numeric,
  estimated_rent jsonb,
  final_rent numeric,

  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'estimate_provided',
    'waiting_confirmation', 'confirmed', 'vehicle_assigned', 'driver_assigned',
    'trip_started', 'trip_completed', 'cancelled', 'rejected'
  )),

  assigned_vehicle_id uuid REFERENCES vehicles(id),
  assigned_driver_id uuid REFERENCES users(id),

  admin_notes text,
  call_notes text,
  cancellation_reason text,
  confirmed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_requests_customer ON rental_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);

-- ---------------------------------------------------------------------------
-- 6. Trips — module 14, 15, 16
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  rental_request_id uuid NOT NULL UNIQUE REFERENCES rental_requests(id),
  customer_id uuid NOT NULL REFERENCES users(id),
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES users(id),

  trip_type text NOT NULL CHECK (trip_type IN ('single', 'round', 'down')),
  pickup_location jsonb NOT NULL,
  destination jsonb NOT NULL,
  return_location jsonb,

  pickup_date date NOT NULL,
  pickup_time text NOT NULL,
  return_date date,
  return_time text,

  estimated_distance_km numeric,
  final_rent numeric,

  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled')),

  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN (
    'confirmed', 'vehicle_assigned', 'driver_assigned', 'driver_accepted',
    'driver_on_the_way', 'customer_picked_up', 'trip_started', 'trip_in_progress',
    'destination_reached', 'return_started', 'trip_completed', 'cancelled'
  )),

  driver_current_location jsonb,
  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_customer ON trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- ---------------------------------------------------------------------------
-- 7. Payments — module 17
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  trip_id uuid NOT NULL REFERENCES trips(id),
  customer_id uuid NOT NULL REFERENCES users(id),

  amount numeric NOT NULL,
  payment_type text NOT NULL DEFAULT 'full' CHECK (payment_type IN ('advance', 'full')),
  method text NOT NULL CHECK (method IN ('cash', 'online', 'mobile_banking', 'card')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled')),

  transaction_id text,
  paid_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);

-- ---------------------------------------------------------------------------
-- 8. Invoices — module 18
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  trip_id uuid NOT NULL UNIQUE REFERENCES trips(id),
  invoice_number text NOT NULL UNIQUE,

  rental_charge numeric NOT NULL DEFAULT 0,
  driver_charge numeric NOT NULL DEFAULT 0,
  additional_charges numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  due_amount numeric NOT NULL DEFAULT 0,

  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 9. Notifications — module 19
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text,
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('push', 'in_app', 'sms', 'email')),
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ---------------------------------------------------------------------------
-- 10. Reviews & Ratings — module 26
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  trip_id uuid NOT NULL REFERENCES trips(id),
  customer_id uuid NOT NULL REFERENCES users(id),
  driver_id uuid REFERENCES users(id),
  vehicle_id uuid REFERENCES vehicles(id),

  driver_rating int CHECK (driver_rating BETWEEN 1 AND 5),
  vehicle_rating int CHECK (vehicle_rating BETWEEN 1 AND 5),
  review_text text,
  is_hidden boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_driver ON reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle ON reviews(vehicle_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_trip_customer ON reviews(trip_id, customer_id);
