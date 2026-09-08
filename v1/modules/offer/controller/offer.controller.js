import offerService from "../service/offer.service.js";

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

export const searchOffers = handle(async (req) => {
  const data = await offerService.searchOffers(req.query);
  return { message: "Offers fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await offerService.getAll();
  return { message: "All offers fetched successfully", data };
});

export const getOfferById = handle(async (req) => {
  const data = await offerService.getOfferById(req.params.offerId);
  return { message: "Offer fetched successfully", data };
});

export const createOffer = handle(async (req) => {
  const data = await offerService.createOffer(req.body);
  return { statusCode: 201, message: "Offer created successfully", data };
});

export const updateOffer = handle(async (req) => {
  const data = await offerService.updateOffer(req.params.offerId, req.body);
  return { message: "Offer updated successfully", data };
});

export const deleteOffer = handle(async (req) => {
  const data = await offerService.deleteOffer(req.params.offerId);
  return { message: "Offer deleted successfully", data };
});
