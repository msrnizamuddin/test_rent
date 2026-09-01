import Location from "../model/location.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const searchLocations = async (query) => {
  return Location.search(query);
};

const getLocationById = async (locationId) => {
  const location = await Location.findById(locationId);
  if (!location) throw buildError("Location not found", 404);
  return location;
};

const createLocation = async (payload) => {
  return Location.create(payload);
};

const updateLocation = async (locationId, payload) => {
  const location = await Location.updateById(locationId, payload);
  if (!location) throw buildError("Location not found", 404);
  return location;
};

const deleteLocation = async (locationId) => {
  const deleted = await Location.deleteById(locationId);
  if (!deleted) throw buildError("Location not found", 404);
  return { deleted: true };
};

export default {
  searchLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
