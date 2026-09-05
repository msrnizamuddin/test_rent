import locationService from "../service/location.service.js";

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

export const searchLocations = handle(async (req) => {
  const data = await locationService.searchLocations(req.query);
  return { message: "Locations fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await locationService.getAll();
  return { message: "All locations fetched successfully", data };
});

export const getLocationById = handle(async (req) => {
  const data = await locationService.getLocationById(req.params.locationId);
  return { message: "Location fetched successfully", data };
});

export const createLocation = handle(async (req) => {
  const data = await locationService.createLocation(req.body);
  return { statusCode: 201, message: "Location created successfully", data };
});

export const updateLocation = handle(async (req) => {
  const data = await locationService.updateLocation(req.params.locationId, req.body);
  return { message: "Location updated successfully", data };
});

export const deleteLocation = handle(async (req) => {
  const data = await locationService.deleteLocation(req.params.locationId);
  return { message: "Location deleted successfully", data };
});
