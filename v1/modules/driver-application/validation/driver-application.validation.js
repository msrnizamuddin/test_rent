import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const applicationIdParamValidation = Joi.object({
  applicationId: objectId.required(),
});

export const searchApplicationValidation = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
});

export const submitApplicationValidation = Joi.object({
  fullName: Joi.string().trim().required(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required(),
  email: Joi.string().email().optional(),
  licenseNumber: Joi.string().trim().required(),
  password: Joi.string().min(8).required(),
});

export const rejectApplicationValidation = Joi.object({
  rejectionReason: Joi.string().trim().required(),
});
