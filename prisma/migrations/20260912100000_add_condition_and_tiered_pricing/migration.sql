-- Vehicle condition (new/old) — new vehicles command a higher price than
-- old ones in the same category, used to pick the right pricing rule.
CREATE TYPE "vehicle_condition" AS ENUM ('new', 'old');

ALTER TABLE "vehicles"
  ADD COLUMN "condition" "vehicle_condition" NOT NULL DEFAULT 'new';

-- Tiered base/extra pricing on pricing_rules: a rule now names a base
-- package (basePrice covering baseHours/includedKm) plus an extra-hour
-- rate; the extra-km rate reuses the existing extra_km_charge column.
ALTER TABLE "pricing_rules"
  ADD COLUMN "vehicle_condition" "vehicle_condition",
  ADD COLUMN "base_price" DECIMAL,
  ADD COLUMN "base_hours" DECIMAL,
  ADD COLUMN "included_km" DECIMAL,
  ADD COLUMN "extra_hour_price" DECIMAL;

CREATE INDEX "pricing_rules_category_id_vehicle_condition_idx"
  ON "pricing_rules" ("category_id", "vehicle_condition");
