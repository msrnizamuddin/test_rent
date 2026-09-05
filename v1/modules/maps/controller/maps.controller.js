import mapsService from "../service/maps.service.js";

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

export const autocomplete = handle(async (req) => {
  const { input, sessionToken } = req.query;
  const data = await mapsService.autocomplete(input, sessionToken);
  return { message: "Location suggestions fetched successfully", data };
});

export const placeDetails = handle(async (req) => {
  const { placeId, sessionToken } = req.query;
  const data = await mapsService.placeDetails(placeId, sessionToken);
  return { message: "Location details fetched successfully", data };
});

export const geocode = handle(async (req) => {
  const data = await mapsService.geocode(req.query.address);
  return { message: "Address geocoded successfully", data };
});

export const distance = handle(async (req) => {
  const { origin, destination } = req.query;
  const data = await mapsService.distance(origin, destination);
  return { message: "Distance calculated successfully", data };
});
