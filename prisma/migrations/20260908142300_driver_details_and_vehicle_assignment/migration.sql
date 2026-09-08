-- AlterTable
ALTER TABLE "users" ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "mother_name" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "assigned_driver_id" UUID;

-- CreateIndex
CREATE INDEX "vehicles_assigned_driver_id_idx" ON "vehicles"("assigned_driver_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
