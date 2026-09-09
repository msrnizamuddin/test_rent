import TouristSpot from "../model/tourist-spot.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const searchTouristSpots = async (query) => TouristSpot.search(query);

// Safe "get everything" — no filters, no conditions.
const getAll = async () => TouristSpot.getAll();

const getTouristSpotById = async (touristSpotId) => {
  const spot = await TouristSpot.findById(touristSpotId);
  if (!spot) throw buildError("Tourist spot not found", 404);
  return spot;
};

const createTouristSpot = async (payload) => TouristSpot.create(payload);

const updateTouristSpot = async (touristSpotId, payload) => {
  const spot = await TouristSpot.updateById(touristSpotId, payload);
  if (!spot) throw buildError("Tourist spot not found", 404);
  return spot;
};

const deleteTouristSpot = async (touristSpotId) => {
  const deleted = await TouristSpot.deleteById(touristSpotId);
  if (!deleted) throw buildError("Tourist spot not found", 404);
  return { deleted: true };
};

export default {
  searchTouristSpots,
  getAll,
  getTouristSpotById,
  createTouristSpot,
  updateTouristSpot,
  deleteTouristSpot,
};
