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

// ownerId is required when ownerType is "vehicle". When ownerType is "user"
// it's optional — omitted for self-upload, or an admin can pass another
// user's id to upload on their behalf (see document.service.js's upload()).
export const uploadDocumentValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.when("ownerType", { is: "vehicle", then: Joi.required(), otherwise: Joi.optional() }),
  category: Joi.string().trim().required(),
  fileUrl: Joi.string().uri().required(),
  expiryDate: Joi.date().optional(),
});

// Multipart form fields arrive as strings (multer doesn't type-coerce), and
// the file itself is validated separately (req.file, see the controller) —
// this only covers req.body.
export const uploadDocumentFileValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.when("ownerType", { is: "vehicle", then: Joi.required(), otherwise: Joi.optional() }),
  category: Joi.string().trim().required(),
  expiryDate: Joi.date().optional(),
});

export const rejectDocumentValidation = Joi.object({
  rejectionReason: Joi.string().trim().required(),
});
