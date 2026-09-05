import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchDocumentValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.optional(),
  status: Joi.string().valid("pending", "verified", "rejected").optional(),
  category: Joi.string().trim().optional(),
});

export const documentIdParamValidation = Joi.object({
  documentId: objectId.required(),
});

export const ownerParamValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").required(),
  ownerId: objectId.required(),
});

export const uploadDocumentValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.when("ownerType", { is: "vehicle", then: Joi.required(), otherwise: Joi.forbidden() }),
  category: Joi.string().trim().required(),
  fileUrl: Joi.string().uri().required(),
  expiryDate: Joi.date().optional(),
});

export const rejectDocumentValidation = Joi.object({
  rejectionReason: Joi.string().trim().required(),
});
