import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchTicketValidation = Joi.object({
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").optional(),
  userId: objectId.optional(),
});

export const ticketIdParamValidation = Joi.object({
  ticketId: objectId.required(),
});

export const createTicketValidation = Joi.object({
  subject: Joi.string().trim().required(),
  message: Joi.string().trim().required(),
  category: Joi.string().trim().optional(),
});

export const replyTicketValidation = Joi.object({
  adminReply: Joi.string().trim().required(),
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").optional(),
});

export const updateTicketStatusValidation = Joi.object({
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").required(),
});
