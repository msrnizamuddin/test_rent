-- CreateEnum
CREATE TYPE "tourist_spot_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "tourist_spots" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "location" TEXT,
    "status" "tourist_spot_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tourist_spots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tourist_spots_status_idx" ON "tourist_spots"("status");
