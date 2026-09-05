import pricingService from "../service/pricing.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await pricingService.getAll();
  return { message: "All pricing rules fetched successfully", data };
});

export const searchPricing = handle(async (req) => {
  const data = await pricingService.search(req.query);
  return { message: "Pricing rules fetched successfully", data };
});

export const getPricingById = handle(async (req) => {
  const data = await pricingService.getById(req.params.pricingId);
  return { message: "Pricing rule fetched successfully", data };
});

export const createPricing = handle(async (req) => {
  const data = await pricingService.create(req.body);
  return { statusCode: 201, message: "Pricing rule created successfully", data };
});

export const updatePricing = handle(async (req) => {
  const data = await pricingService.update(req.params.pricingId, req.body);
  return { message: "Pricing rule updated successfully", data };
});

export const deletePricing = handle(async (req) => {
  const data = await pricingService.remove(req.params.pricingId);
  return { message: "Pricing rule deleted successfully", data };
});
