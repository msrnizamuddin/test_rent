import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

// A vehicle can have more than one fuel type (e.g. hybrid + electric).
const FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid"];
const fuelTypeSchema = Joi.array().items(Joi.string().valid(...FUEL_TYPES)).min(1);

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
  // Query params may arrive as a single value (?fuelType=petrol) or repeated
  // (?fuelType=petrol&fuelType=diesel) — matches vehicles with ANY of these.
  fuelType: Joi.alternatives()
    .try(Joi.string().valid(...FUEL_TYPES), Joi.array().items(Joi.string().valid(...FUEL_TYPES)))
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
  vehicleId: objectId.required().messages(requiredMessage("Vehicle id")),
});

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
const locationSchema = Joi.object({
  address: Joi.string().trim().optional(),
  city: Joi.string().trim().required().messages(requiredMessage("City")),
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
  vehicleName: Joi.string().trim().required().messages(requiredMessage("Vehicle name")),
  brand: Joi.string().trim().required().messages(requiredMessage("Brand")),
  vehicleModel: Joi.string().trim().required().messages(requiredMessage("Vehicle model")),
  categoryId: objectId.required().messages(requiredMessage("Category")),
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
    .required()
    .messages(requiredMessage("Vehicle type")),
  images: Joi.array().items(Joi.string().uri()).optional(),
  registrationNumber: Joi.string().trim().required().messages(requiredMessage("Registration number")),
  modelYear: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages(requiredMessage("Model year")),
  seatingCapacity: Joi.number().integer().min(1).required().messages(requiredMessage("Seating capacity")),
  fuelType: fuelTypeSchema.required().messages(requiredMessage("Fuel type")),
  transmission: Joi.string().valid("manual", "automatic").required().messages(requiredMessage("Transmission")),
  isAC: Joi.boolean().optional(),
  color: Joi.string().trim().optional(),
  features: Joi.array().items(Joi.string()).optional(),
  location: locationSchema.optional(),
  estimatedRentalRate: rentalRateSchema.optional(),
  driverRequired: Joi.boolean().optional(),
  ownerInfo: ownerInfoSchema.optional(),
  // Present when a driver brings their own car rather than this being a
  // fleet vehicle any admin can assign. Must reference an existing driver
  // (checked in vehicle.service.js, since Joi can't hit the DB).
  ownerDriverId: objectId.optional(),
  // Defaults to ownerDriverId when omitted (a driver's own car is assigned
  // to them); rejected if that driver already has another vehicle assigned.
  assignedDriverId: objectId.optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required().messages(requiredMessage("Document title")),
        fileUrl: Joi.string().uri().required().messages(requiredMessage("Document file URL")),
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
  fuelType: fuelTypeSchema,
  transmission: Joi.string().valid("manual", "automatic"),
  isAC: Joi.boolean(),
  color: Joi.string().trim(),
  features: Joi.array().items(Joi.string()),
  location: locationSchema,
  estimatedRentalRate: rentalRateSchema,
  driverRequired: Joi.boolean(),
  ownerInfo: ownerInfoSchema,
  // null clears ownership (vehicle reverts to a plain fleet vehicle).
  ownerDriverId: objectId.allow(null),
  documents: Joi.array().items(
    Joi.object({
      title: Joi.string().trim().required().messages(requiredMessage("Document title")),
      fileUrl: Joi.string().uri().required().messages(requiredMessage("Document file URL")),
    }),
  ),
  // Persistent driver assignment ("this driver drives this car"); null unassigns.
  assignedDriverId: objectId.allow(null),
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
