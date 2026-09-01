import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

// ---------------- 2.1 Vehicle Search + 2.2 Vehicle Filter (combined) ----------------
// GET /vehicles?search=&brand=&category=&location=&vehicleType=&seatingCapacity=
//               &minPrice=&maxPrice=&isAC=&transmission=&fuelType=&availability=
//               &page=&limit=&sortBy=&sortOrder=
export const searchVehicleValidation = Joi.object({
  // 2.1 Search
  search: Joi.string().trim().optional(), // matches vehicleName / brand (text search)
  brand: Joi.string().trim().optional(),
  categoryId: objectId.optional(),
  location: Joi.string().trim().optional(), // matches city / district / address
  vehicleType: Joi.string()
    .valid(
      "sedan",
      "suv",
      "hatchback",
      "microbus",
      "minibus",
      "bus",
      "pickup",
      "van",
      "coaster",
      "other",
    )
    .optional(),

  // 2.2 Filter
  seatingCapacity: Joi.number().integer().min(1).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  isAC: Joi.boolean().optional(),
  transmission: Joi.string().valid("manual", "automatic").optional(),
  fuelType: Joi.string()
    .valid("petrol", "diesel", "cng", "electric", "hybrid")
    .optional(),
  availability: Joi.string()
    .valid("available", "assigned", "on-trip", "maintenance")
    .optional(),

  // pagination & sorting
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("estimatedRentalRate.perDay", "modelYear", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// ---------------- 2.3 Vehicle Details ----------------
export const vehicleIdParamValidation = Joi.object({
  vehicleId: objectId.required(),
});

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
const locationSchema = Joi.object({
  address: Joi.string().trim().optional(),
  city: Joi.string().trim().required(),
  district: Joi.string().trim().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

const rentalRateSchema = Joi.object({
  perDay: Joi.number().min(0).optional(),
  perHour: Joi.number().min(0).optional(),
  perKm: Joi.number().min(0).optional(),
}).min(1);

const ownerInfoSchema = Joi.object({
  name: Joi.string().trim().optional(),
  contactNumber: Joi.string().trim().optional(),
  nidNumber: Joi.string().trim().optional(),
});

export const createVehicleValidation = Joi.object({
  vehicleName: Joi.string().trim().required(),
  brand: Joi.string().trim().required(),
  vehicleModel: Joi.string().trim().required(),
  categoryId: objectId.required(),
  vehicleType: Joi.string()
    .valid(
      "sedan",
      "suv",
      "hatchback",
      "microbus",
      "minibus",
      "bus",
      "pickup",
      "van",
      "coaster",
      "other",
    )
    .required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  registrationNumber: Joi.string().trim().required(),
  modelYear: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .required(),
  seatingCapacity: Joi.number().integer().min(1).required(),
  fuelType: Joi.string()
    .valid("petrol", "diesel", "cng", "electric", "hybrid")
    .required(),
  transmission: Joi.string().valid("manual", "automatic").required(),
  isAC: Joi.boolean().optional(),
  color: Joi.string().trim().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  location: locationSchema.required(),
  estimatedRentalRate: rentalRateSchema.optional(),
  driverRequired: Joi.boolean().optional(),
  ownerInfo: ownerInfoSchema.optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required(),
        fileUrl: Joi.string().uri().required(),
      }),
    )
    .optional(),
  // superadmin/manager can create directly as available; otherwise defaults to pending review
  availabilityStatus: Joi.string()
    .valid("pending", "approved", "available")
    .optional(),
});

export const updateVehicleValidation = Joi.object({
  vehicleName: Joi.string().trim(),
  brand: Joi.string().trim(),
  vehicleModel: Joi.string().trim(),
  categoryId: objectId,
  vehicleType: Joi.string().valid(
    "sedan",
    "suv",
    "hatchback",
    "microbus",
    "minibus",
    "bus",
    "pickup",
    "van",
    "coaster",
    "other",
  ),
  images: Joi.array().items(Joi.string().uri()),
  registrationNumber: Joi.string().trim(),
  modelYear: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  seatingCapacity: Joi.number().integer().min(1),
  fuelType: Joi.string().valid("petrol", "diesel", "cng", "electric", "hybrid"),
  transmission: Joi.string().valid("manual", "automatic"),
  isAC: Joi.boolean(),
  color: Joi.string().trim(),
  features: Joi.array().items(Joi.string()),
  location: locationSchema,
  estimatedRentalRate: rentalRateSchema,
  driverRequired: Joi.boolean(),
  ownerInfo: ownerInfoSchema,
  documents: Joi.array().items(
    Joi.object({
      title: Joi.string().trim().required(),
      fileUrl: Joi.string().uri().required(),
    }),
  ),
  availabilityStatus: Joi.string().valid(
    "pending",
    "approved",
    "rejected",
    "available",
    "assigned",
    "on-trip",
    "maintenance",
    "inactive",
  ),
}).min(1);
