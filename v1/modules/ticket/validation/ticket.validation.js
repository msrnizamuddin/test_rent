import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchTicketValidation = Joi.object({
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").optional(),
  userId: objectId.optional(),
});

export const ticketIdParamValidation = Joi.object({
  ticketId: objectId.required().messages(requiredMessage("Ticket id")),
});

export const createTicketValidation = Joi.object({
  subject: Joi.string().trim().required().messages(requiredMessage("Subject")),
  message: Joi.string().trim().required().messages(requiredMessage("Message")),
  category: Joi.string().trim().optional(),
});

export const replyTicketValidation = Joi.object({
  adminReply: Joi.string().trim().required().messages(requiredMessage("Reply")),
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").optional(),
});

export const updateTicketStatusValidation = Joi.object({
  status: Joi.string()
    .valid("open", "in_progress", "resolved", "closed")
    .required()
    .messages(requiredMessage("Status")),
});
