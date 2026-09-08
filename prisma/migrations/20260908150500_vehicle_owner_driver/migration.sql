-- Records that a vehicle is personally owned by a driver (vs. a company
-- fleet vehicle any admin can assign to any driver).
ALTER TABLE "vehicles" ADD COLUMN "owner_driver_id" UUID;

-- CreateIndex
CREATE INDEX "vehicles_owner_driver_id_idx" ON "vehicles"("owner_driver_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_driver_id_fkey" FOREIGN KEY ("owner_driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
