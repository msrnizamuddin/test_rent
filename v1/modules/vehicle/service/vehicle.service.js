import Vehicle from "../model/vehicle.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Browsing only shows vehicles that are actually rentable/visible to the public
const PUBLICLY_VISIBLE_STATUSES = ["available", "assigned", "on-trip"];

// ---------------- 2.1 Search + 2.2 Filter (combined) ----------------
const searchVehicles = async (query) => {
  const {
    search,
    brand,
    category,
    location,
    vehicleType,
    seatingCapacity,
    minPrice,
    maxPrice,
    isAC,
    transmission,
    fuelType,
    availability,
    page,
    limit,
    sortBy,
    sortOrder,
  } = query;

  const filter = {
    availabilityStatus: availability
      ? availability
      : { $in: PUBLICLY_VISIBLE_STATUSES },
  };

  if (search) {
    filter.$or = [
      { vehicleName: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (brand) filter.brand = { $regex: `^${brand}$`, $options: "i" };
  if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
  if (vehicleType) filter.vehicleType = vehicleType;
  if (seatingCapacity) filter.seatingCapacity = { $gte: seatingCapacity };
  if (typeof isAC === "boolean") filter.isAC = isAC;
  if (transmission) filter.transmission = transmission;
  if (fuelType) filter.fuelType = fuelType;

  if (location) {
    filter.$or = (filter.$or || []).concat([
      { "location.city": { $regex: location, $options: "i" } },
      { "location.district": { $regex: location, $options: "i" } },
      { "location.address": { $regex: location, $options: "i" } },
    ]);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter["estimatedRentalRate.perDay"] = {};
    if (minPrice !== undefined)
      filter["estimatedRentalRate.perDay"].$gte = minPrice;
    if (maxPrice !== undefined)
      filter["estimatedRentalRate.perDay"].$lte = maxPrice;
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  return {
    vehicles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------- 2.3 Vehicle Details ----------------
const getVehicleById = async (vehicleId) => {
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    availabilityStatus: { $in: PUBLICLY_VISIBLE_STATUSES },
  });
  if (!vehicle) throw buildError("Vehicle not found or not available", 404);
  return vehicle;
};

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
const createVehicle = async (payload, userId) => {
  const existing = await Vehicle.findOne({
    registrationNumber: payload.registrationNumber,
  });
  if (existing) throw buildError("Registration number already exists", 409);

  const vehicle = await Vehicle.create({
    ...payload,
    createdBy: userId,
    availabilityStatus: payload.availabilityStatus || "pending",
  });

  return vehicle;
};

const updateVehicle = async (vehicleId, payload, userId) => {
  if (payload.registrationNumber) {
    const existing = await Vehicle.findOne({
      _id: { $ne: vehicleId },
      registrationNumber: payload.registrationNumber,
    });
    if (existing) throw buildError("Registration number already in use", 409);
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    { ...payload, updatedBy: userId },
    { new: true, runValidators: true },
  );
  if (!vehicle) throw buildError("Vehicle not found", 404);
  return vehicle;
};

const deleteVehicle = async (vehicleId) => {
  const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
  if (!vehicle) throw buildError("Vehicle not found", 404);
  return { deleted: true };
};

export default {
  searchVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
