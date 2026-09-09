-- Adds the customer-facing "view price" range offsets to pricing rules.
-- The displayed range is (perKmRate * distance) - viewPriceLowOffset to
-- (perKmRate * distance) + viewPriceHighOffset; the raw perKmRate stays
-- the actual billing rate.
ALTER TABLE "pricing_rules"
  ADD COLUMN "view_price_low_offset" DECIMAL,
  ADD COLUMN "view_price_high_offset" DECIMAL;
