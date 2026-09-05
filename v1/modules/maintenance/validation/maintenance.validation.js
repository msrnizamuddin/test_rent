import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchMaintenanceValidation = Joi.object({
  vehicleId: objectId.optional(),
  status: Joi.string().valid("scheduled", "in_progress", "completed", "cancelled").optional(),
});

export const maintenanceIdParamValidation = Joi.object({
  maintenanceId: objectId.required(),
});

export const createMaintenanceValidation = Joi.object({
  vehicleId: objectId.required(),
  maintenanceType: Joi.string().trim().required(),
  serviceDate: Joi.date().required(),
  nextServiceDate: Joi.date().optional(),
  cost: Joi.number().min(0).optional(),
  notes: Joi.string().trim().allow("").optional(),
  documents: Joi.array().items(Joi.string().uri()).optional(),
  status: Joi.string().valid("scheduled", "in_progress", "completed", "cancelled").optional(),
});

export const updateMaintenanceValidation = Joi.object({
  maintenanceType: Joi.string().trim(),
  serviceDate: Joi.date(),
  nextServiceDate: Joi.date().allow(null),
  cost: Joi.number().min(0).allow(null),
  notes: Joi.string().trim().allow(""),
  documents: Joi.array().items(Joi.string().uri()),
  status: Joi.string().valid("scheduled", "in_progress", "completed", "cancelled"),
}).min(1);
