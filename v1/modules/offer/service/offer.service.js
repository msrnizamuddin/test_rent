import Offer from "../model/offer.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const searchOffers = async (query) => {
  return Offer.search(query);
};

// Safe "get everything" — no filters, no conditions.
const getAll = async () => Offer.getAll();

const getOfferById = async (offerId) => {
  const offer = await Offer.findById(offerId);
  if (!offer) throw buildError("Offer not found", 404);
  return offer;
};

const createOffer = async (payload) => Offer.create(payload);

const updateOffer = async (offerId, payload) => {
  const offer = await Offer.updateById(offerId, payload);
  if (!offer) throw buildError("Offer not found", 404);
  return offer;
};

const deleteOffer = async (offerId) => {
  const deleted = await Offer.deleteById(offerId);
  if (!deleted) throw buildError("Offer not found", 404);
  return { deleted: true };
};

export default {
  searchOffers,
  getAll,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
