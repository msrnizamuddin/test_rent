-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_category_id_fkey";

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vehicle_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
