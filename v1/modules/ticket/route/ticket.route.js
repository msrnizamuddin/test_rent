import express from "express";
import * as controller from "../controller/ticket.controller.js";

import {
  searchTicketValidation,
  ticketIdParamValidation,
  createTicketValidation,
  replyTicketValidation,
  updateTicketStatusValidation,
} from "../validation/ticket.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate);

// Any signed-in user (customer or driver) can raise/view their own tickets.
router.post("/", validate(createTicketValidation), controller.createTicket);
router.get("/mine", controller.getMyTickets);

// Super Admin / Manager: full ticket management.
router.get("/all", authorize("superadmin", "manager"), controller.getAll);
router.get(
  "/",
  authorize("superadmin", "manager"),
  validate(searchTicketValidation, "query"),
  controller.searchTickets,
);
router.patch(
  "/:ticketId/reply",
  authorize("superadmin", "manager"),
  validate(ticketIdParamValidation, "params"),
  validate(replyTicketValidation),
  controller.replyTicket,
);
router.patch(
  "/:ticketId/status",
  authorize("superadmin", "manager"),
  validate(ticketIdParamValidation, "params"),
  validate(updateTicketStatusValidation),
  controller.updateTicketStatus,
);

router.get(
  "/:ticketId",
  validate(ticketIdParamValidation, "params"),
  controller.getTicketById,
);

export default router;
