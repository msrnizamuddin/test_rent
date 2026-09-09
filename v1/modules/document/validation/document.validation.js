import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchDocumentValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.optional(),
  status: Joi.string().valid("pending", "verified", "rejected").optional(),
  category: Joi.string().trim().optional(),
});

export const documentIdParamValidation = Joi.object({
  documentId: objectId.required().messages(requiredMessage("Document id")),
});

export const ownerParamValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").required().messages(requiredMessage("Owner type")),
  ownerId: objectId.required().messages(requiredMessage("Owner id")),
});

// ownerId is required when ownerType is "vehicle". When ownerType is "user"
// it's optional — omitted for self-upload, or an admin can pass another
// user's id to upload on their behalf (see document.service.js's upload()).
export const uploadDocumentValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.when("ownerType", {
    is: "vehicle",
    then: Joi.required().messages(requiredMessage("Owner id")),
    otherwise: Joi.optional(),
  }),
  category: Joi.string().trim().required().messages(requiredMessage("Category")),
  fileUrl: Joi.string().uri().required().messages(requiredMessage("File URL")),
  expiryDate: Joi.date().optional(),
});

// Multipart form fields arrive as strings (multer doesn't type-coerce), and
// the file itself is validated separately (req.file, see the controller) —
// this only covers req.body.
export const uploadDocumentFileValidation = Joi.object({
  ownerType: Joi.string().valid("user", "vehicle").optional(),
  ownerId: objectId.when("ownerType", {
    is: "vehicle",
    then: Joi.required().messages(requiredMessage("Owner id")),
    otherwise: Joi.optional(),
  }),
  category: Joi.string().trim().required().messages(requiredMessage("Category")),
  expiryDate: Joi.date().optional(),
});

export const rejectDocumentValidation = Joi.object({
  rejectionReason: Joi.string().trim().required().messages(requiredMessage("Rejection reason")),
});
