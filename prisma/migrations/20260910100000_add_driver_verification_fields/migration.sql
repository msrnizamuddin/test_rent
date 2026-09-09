-- AlterTable
ALTER TABLE "users" ADD COLUMN "inactive_reason" TEXT,
ADD COLUMN "profile_submitted_at" TIMESTAMPTZ;
