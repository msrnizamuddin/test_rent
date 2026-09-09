-- CreateEnum
CREATE TYPE "driver_application_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "driver_applications" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT,
    "license_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "driver_application_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "driver_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_applications_status_idx" ON "driver_applications"("status");

-- CreateIndex
CREATE INDEX "driver_applications_mobile_number_idx" ON "driver_applications"("mobile_number");

-- AddForeignKey
ALTER TABLE "driver_applications" ADD CONSTRAINT "driver_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
