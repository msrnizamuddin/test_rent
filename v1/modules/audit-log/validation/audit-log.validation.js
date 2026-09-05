import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchAuditLogValidation = Joi.object({
  actorId: objectId.optional(),
  action: Joi.string().trim().optional(),
  entityType: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
