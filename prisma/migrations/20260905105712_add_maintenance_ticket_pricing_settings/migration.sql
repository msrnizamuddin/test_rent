-- CreateEnum
CREATE TYPE "maintenance_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateTable
CREATE TABLE "vehicle_maintenance" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "service_date" DATE NOT NULL,
    "next_service_date" DATE,
    "cost" DECIMAL,
    "notes" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "status" "maintenance_status" NOT NULL DEFAULT 'scheduled',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT,
    "status" "ticket_status" NOT NULL DEFAULT 'open',
    "assigned_to" UUID,
    "admin_reply" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trip_type" "trip_type",
    "category_id" UUID,
    "vehicle_id" UUID,
    "per_km_rate" DECIMAL,
    "per_hour_rate" DECIMAL,
    "per_day_rate" DECIMAL,
    "driver_charge" DECIMAL,
    "waiting_charge" DECIMAL,
    "extra_km_charge" DECIMAL,
    "night_charge" DECIMAL,
    "service_charge" DECIMAL,
    "tax_percent" DECIMAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "vehicle_maintenance_vehicle_id_idx" ON "vehicle_maintenance"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_status_idx" ON "vehicle_maintenance"("status");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "pricing_rules_category_id_idx" ON "pricing_rules"("category_id");

-- CreateIndex
CREATE INDEX "pricing_rules_vehicle_id_idx" ON "pricing_rules"("vehicle_id");
