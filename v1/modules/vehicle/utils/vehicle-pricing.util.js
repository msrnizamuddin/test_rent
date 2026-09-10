// Pricing helper used by vehicle.service.js's search(). Kept separate so the
// "find the right rule" and "turn a rule into a price" logic can be tested
// and reasoned about on its own.

/**
 * Inclusive random integer in [min, max]. Used to turn a single computed
 * price into a per-vehicle randomized display price — every vehicle gets
 * its own draw, not a shared fixed +/- offset.
 */
function randomInt(min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  if (hi <= lo) return lo;
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Fetches every PricingRule that could possibly apply to the given batch of
 * vehicles in ONE query (avoids an N+1 query per vehicle), then returns a
 * lookup function `getRuleFor(vehicle)` that picks the single best match
 * per vehicle, most specific first:
 *   1. a rule pinned to this exact vehicleId
 *   2. a rule for this vehicle's categoryId + condition (new/old)
 *   3. a rule for this vehicle's categoryId (any condition)
 *   4. a fully generic rule (no categoryId, no vehicleId) as a fallback
 * If `tripType` is supplied, rules tied to a *different* tripType are
 * skipped first — but a rule with tripType=null (applies to any trip type)
 * is always still eligible.
 */
export async function buildPricingRuleLookup(prisma, vehicles, tripType) {
  const categoryIds = [
    ...new Set(vehicles.map((v) => v.categoryId).filter(Boolean)),
  ];
  const vehicleIds = vehicles.map((v) => v.id);

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [
        { vehicleId: { in: vehicleIds } },
        { categoryId: { in: categoryIds } },
        { categoryId: null, vehicleId: null },
      ],
    },
  });

  const eligibleForTripType = tripType
    ? rules.filter((r) => !r.tripType || r.tripType === tripType)
    : rules;

  return function getRuleFor(vehicle) {
    return (
      eligibleForTripType.find((r) => r.vehicleId === vehicle.id) ||
      eligibleForTripType.find(
        (r) =>
          r.categoryId === vehicle.categoryId &&
          r.vehicleCondition === vehicle.condition,
      ) ||
      eligibleForTripType.find((r) => r.categoryId === vehicle.categoryId) ||
      eligibleForTripType.find((r) => !r.categoryId && !r.vehicleId) ||
      null
    );
  };
}

/**
 * Turns a PricingRule + trip distance into:
 *   - actualPrice: the "real" computed price (base + extra-km cost +
 *     driver/night/service charges + tax)
 *   - displayPrice: actualPrice randomized within the rule's
 *     viewPriceLowOffset/viewPriceHighOffset range — this is what the
 *     frontend should show, and it's a fresh random draw per vehicle per
 *     request (not a fixed formula every vehicle shares).
 *
 * Returns null if there's no applicable rule at all for this vehicle.
 */
export function calculateVehiclePrice({
  pricingRule,
  distanceKm = 0,
  driverRequired = false,
}) {
  if (!pricingRule) return null;

  // IMPORTANT: PricingRule's numeric columns are Prisma `Decimal` fields,
  // not plain JS numbers. A Decimal object's `+` behaves like string
  // concatenation ("3500" + 3344 -> "35003344") instead of numeric
  // addition, even though `-` and `*` happen to coerce correctly. Every
  // field is explicitly Number()-converted here, up front, so nothing
  // downstream ever does arithmetic directly on a raw Decimal object.
  const basePrice = Number(pricingRule.basePrice) || 0;
  const includedKm = Number(pricingRule.includedKm) || 0;
  const perKmRate = Number(pricingRule.perKmRate) || 0;
  const extraKmCharge = Number(pricingRule.extraKmCharge) || 0;
  const driverCharge = Number(pricingRule.driverCharge) || 0;
  const nightCharge = Number(pricingRule.nightCharge) || 0;
  const serviceCharge = Number(pricingRule.serviceCharge) || 0;
  const taxPercent = Number(pricingRule.taxPercent) || 0;
  const viewPriceLowOffset =
    pricingRule.viewPriceLowOffset != null
      ? Number(pricingRule.viewPriceLowOffset)
      : 100;
  const viewPriceHighOffset =
    pricingRule.viewPriceHighOffset != null
      ? Number(pricingRule.viewPriceHighOffset)
      : 100;

  const distanceKmNum = Number(distanceKm) || 0;

  const extraKm = Math.max(0, distanceKmNum - includedKm);
  // extraKmCharge is the per-km rate specifically for km beyond includedKm;
  // fall back to the general perKmRate if the rule didn't set one.
  const kmCost = extraKm * (extraKmCharge || perKmRate);

  let subtotal = basePrice + kmCost + serviceCharge + nightCharge;
  if (driverRequired) subtotal += driverCharge;

  const tax = subtotal * (taxPercent / 100);
  const actualPrice = Math.round(subtotal + tax);

  const low = Math.max(0, actualPrice - viewPriceLowOffset);
  const high = actualPrice + viewPriceHighOffset;
  const displayPrice = randomInt(low, high);

  return { actualPrice, displayPrice };
}
