import touristSpotService from "../service/tourist-spot.service.js";

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

export const searchTouristSpots = handle(async (req) => {
  const data = await touristSpotService.searchTouristSpots(req.query);
  return { message: "Tourist spots fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await touristSpotService.getAll();
  return { message: "All tourist spots fetched successfully", data };
});

export const getTouristSpotById = handle(async (req) => {
  const data = await touristSpotService.getTouristSpotById(req.params.touristSpotId);
  return { message: "Tourist spot fetched successfully", data };
});

export const createTouristSpot = handle(async (req) => {
  const data = await touristSpotService.createTouristSpot(req.body);
  return { statusCode: 201, message: "Tourist spot created successfully", data };
});

export const updateTouristSpot = handle(async (req) => {
  const data = await touristSpotService.updateTouristSpot(req.params.touristSpotId, req.body);
  return { message: "Tourist spot updated successfully", data };
});

export const deleteTouristSpot = handle(async (req) => {
  const data = await touristSpotService.deleteTouristSpot(req.params.touristSpotId);
  return { message: "Tourist spot deleted successfully", data };
});
