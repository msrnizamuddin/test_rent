-- CreateEnum
CREATE TYPE "offer_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "discount_type" AS ENUM ('percentage', 'fixed');

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "trip_type" "trip_type",
    "status" "offer_status" NOT NULL DEFAULT 'active',
    "from_location" TEXT,
    "to_location" TEXT,
    "discount_type" "discount_type" NOT NULL DEFAULT 'percentage',
    "discount_value" DECIMAL NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "banner_image" TEXT,
    "offer_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");
