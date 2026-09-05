-- CreateEnum
CREATE TYPE "document_owner" AS ENUM ('user', 'vehicle');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('pending', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "owner_type" "document_owner" NOT NULL,
    "owner_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "expiry_date" DATE,
    "status" "document_status" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "verified_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_owner_type_owner_id_idx" ON "documents"("owner_type", "owner_id");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");
