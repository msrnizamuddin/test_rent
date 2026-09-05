import express from "express";
import * as controller from "../controller/audit-log.controller.js";

import { searchAuditLogValidation } from "../validation/audit-log.validation.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Superadmin-only — audit trail of admin actions.
router.use(authenticate, authorize("superadmin"));

router.get("/all", controller.getAll);
router.get("/", validate(searchAuditLogValidation, "query"), controller.searchAuditLogs);

export default router;
