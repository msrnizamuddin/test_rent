-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('superadmin', 'manager', 'driver', 'customer');

-- CreateEnum
CREATE TYPE "central_status" AS ENUM ('active', 'inactive', 'suspended', 'blocked');

-- CreateEnum
CREATE TYPE "driver_status" AS ENUM ('pending', 'approved', 'available', 'assigned', 'on-trip', 'offline', 'suspended', 'inactive');

-- CreateEnum
CREATE TYPE "otp_purpose" AS ENUM ('registration', 'login', 'reset-password', 'change-mobile');

-- CreateEnum
CREATE TYPE "category_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "vehicle_type" AS ENUM ('sedan', 'suv', 'hatchback', 'microbus', 'minibus', 'bus', 'pickup', 'van', 'coaster', 'other');

-- CreateEnum
CREATE TYPE "fuel_type" AS ENUM ('petrol', 'diesel', 'cng', 'electric', 'hybrid');

-- CreateEnum
CREATE TYPE "transmission" AS ENUM ('manual', 'automatic');

-- CreateEnum
CREATE TYPE "vehicle_availability_status" AS ENUM ('pending', 'approved', 'rejected', 'available', 'assigned', 'on-trip', 'maintenance', 'inactive');

-- CreateEnum
CREATE TYPE "location_type" AS ENUM ('pickup', 'dropoff', 'popular');

-- CreateEnum
CREATE TYPE "trip_type" AS ENUM ('single', 'round', 'down');

-- CreateEnum
CREATE TYPE "rental_request_status" AS ENUM ('draft', 'submitted', 'under_review', 'estimate_provided', 'waiting_confirmation', 'confirmed', 'vehicle_assigned', 'driver_assigned', 'trip_started', 'trip_completed', 'cancelled', 'rejected');

-- CreateEnum
CREATE TYPE "trip_status" AS ENUM ('confirmed', 'vehicle_assigned', 'driver_assigned', 'driver_accepted', 'driver_on_the_way', 'customer_picked_up', 'trip_started', 'trip_in_progress', 'destination_reached', 'return_started', 'trip_completed', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('advance', 'full');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cash', 'online', 'mobile_banking', 'card');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('push', 'in_app', 'sms', 'email');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'customer',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "full_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "address" JSONB,
    "identification" JSONB,
    "driving_license" JSONB,
    "profile_picture" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "central_status" "central_status" NOT NULL DEFAULT 'active',
    "is_activated" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "driver_status" "driver_status",
    "otp_code" TEXT,
    "otp_purpose" "otp_purpose",
    "otp_expires_at" TIMESTAMPTZ,
    "verification_token" TEXT,
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMPTZ,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_login_ip" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" "category_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "vehicle_name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "vehicle_model" TEXT NOT NULL,
    "category_id" UUID,
    "vehicle_type" "vehicle_type" NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "registration_number" TEXT NOT NULL,
    "model_year" INTEGER NOT NULL,
    "seating_capacity" INTEGER NOT NULL,
    "fuel_type" "fuel_type" NOT NULL,
    "transmission" "transmission" NOT NULL,
    "is_ac" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "color" TEXT,
    "location" JSONB,
    "estimated_rental_rate" JSONB,
    "availability_status" "vehicle_availability_status" NOT NULL DEFAULT 'pending',
    "driver_required" BOOLEAN NOT NULL DEFAULT false,
    "owner_info" JSONB,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "latitude" DECIMAL,
    "longitude" DECIMAL,
    "type" "location_type" NOT NULL DEFAULT 'popular',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_requests" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "trip_type" "trip_type" NOT NULL,
    "vehicle_id" UUID,
    "pickup_location" JSONB NOT NULL,
    "destination" JSONB NOT NULL,
    "return_location" JSONB,
    "pickup_date" DATE NOT NULL,
    "pickup_time" TEXT NOT NULL,
    "return_date" DATE,
    "return_time" TEXT,
    "passenger_count" INTEGER NOT NULL DEFAULT 1,
    "driver_required" BOOLEAN NOT NULL DEFAULT false,
    "special_instructions" TEXT,
    "contact_number" TEXT NOT NULL,
    "estimated_distance_km" DECIMAL,
    "estimated_rent" JSONB,
    "final_rent" DECIMAL,
    "status" "rental_request_status" NOT NULL DEFAULT 'draft',
    "assigned_vehicle_id" UUID,
    "assigned_driver_id" UUID,
    "admin_notes" TEXT,
    "call_notes" TEXT,
    "cancellation_reason" TEXT,
    "confirmed_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rental_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL,
    "rental_request_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "vehicle_id" UUID,
    "driver_id" UUID,
    "trip_type" "trip_type" NOT NULL,
    "pickup_location" JSONB NOT NULL,
    "destination" JSONB NOT NULL,
    "return_location" JSONB,
    "pickup_date" DATE NOT NULL,
    "pickup_time" TEXT NOT NULL,
    "return_date" DATE,
    "return_time" TEXT,
    "estimated_distance_km" DECIMAL,
    "final_rent" DECIMAL,
    "payment_status" "payment_status" NOT NULL DEFAULT 'pending',
    "status" "trip_status" NOT NULL DEFAULT 'confirmed',
    "driver_current_location" JSONB,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "amount" DECIMAL NOT NULL,
    "payment_type" "payment_type" NOT NULL DEFAULT 'full',
    "method" "payment_method" NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "rental_charge" DECIMAL NOT NULL DEFAULT 0,
    "driver_charge" DECIMAL NOT NULL DEFAULT 0,
    "additional_charges" DECIMAL NOT NULL DEFAULT 0,
    "tax" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL NOT NULL DEFAULT 0,
    "due_amount" DECIMAL NOT NULL DEFAULT 0,
    "payment_status" "payment_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "channel" "notification_channel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "driver_id" UUID,
    "vehicle_id" UUID,
    "driver_rating" INTEGER,
    "vehicle_rating" INTEGER,
    "review_text" TEXT,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_number_key" ON "users"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_central_status_idx" ON "users"("central_status");

-- CreateIndex
CREATE INDEX "users_driver_status_idx" ON "users"("driver_status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_categories_name_key" ON "vehicle_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_number_key" ON "vehicles"("registration_number");

-- CreateIndex
CREATE INDEX "vehicles_category_id_idx" ON "vehicles"("category_id");

-- CreateIndex
CREATE INDEX "vehicles_vehicle_type_idx" ON "vehicles"("vehicle_type");

-- CreateIndex
CREATE INDEX "vehicles_availability_status_idx" ON "vehicles"("availability_status");

-- CreateIndex
CREATE INDEX "locations_city_idx" ON "locations"("city");

-- CreateIndex
CREATE INDEX "rental_requests_customer_id_idx" ON "rental_requests"("customer_id");

-- CreateIndex
CREATE INDEX "rental_requests_status_idx" ON "rental_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trips_rental_request_id_key" ON "trips"("rental_request_id");

-- CreateIndex
CREATE INDEX "trips_customer_id_idx" ON "trips"("customer_id");

-- CreateIndex
CREATE INDEX "trips_driver_id_idx" ON "trips"("driver_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "payments_trip_id_idx" ON "payments"("trip_id");

-- CreateIndex
CREATE INDEX "payments_customer_id_idx" ON "payments"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_trip_id_key" ON "invoices"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "reviews_driver_id_idx" ON "reviews"("driver_id");

-- CreateIndex
CREATE INDEX "reviews_vehicle_id_idx" ON "reviews"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_trip_id_customer_id_key" ON "reviews"("trip_id", "customer_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vehicle_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_assigned_vehicle_id_fkey" FOREIGN KEY ("assigned_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
