-- A vehicle can now support multiple fuel types (e.g. hybrid + electric),
-- so vehicles.fuel_type moves from a single fuel_type value to an array of
-- fuel_type values. Existing rows are preserved by wrapping their current
-- single value in a 1-element array — no data loss.
ALTER TABLE "vehicles" ADD COLUMN "fuel_type_new" "fuel_type"[];

UPDATE "vehicles" SET "fuel_type_new" = ARRAY["fuel_type"]::"fuel_type"[];

ALTER TABLE "vehicles" ALTER COLUMN "fuel_type_new" SET NOT NULL;

ALTER TABLE "vehicles" DROP COLUMN "fuel_type";

ALTER TABLE "vehicles" RENAME COLUMN "fuel_type_new" TO "fuel_type";
