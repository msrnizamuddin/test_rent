import express from "express";
import * as controller from "../controller/notification.controller.js";

import {
  getMyNotificationsValidation,
  notificationIdParamValidation,
  sendNotificationValidation,
  getAllNotificationsValidation,
} from "../validation/notification.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// ---------------- GET /mine ----------------
router.get(
  "/mine",
  authenticate,
  validate(getMyNotificationsValidation, "query"),
  controller.getMyNotifications,
);

// ---------------- PATCH /read-all ----------------
router.patch("/read-all", authenticate, controller.markAllRead);

// ---------------- PATCH /:notificationId/read ----------------
router.patch(
  "/:notificationId/read",
  authenticate,
  validate(notificationIdParamValidation, "params"),
  controller.markRead,
);

// ---------------- DELETE /:notificationId ----------------
router.delete(
  "/:notificationId",
  authenticate,
  validate(notificationIdParamValidation, "params"),
  controller.deleteNotification,
);

// ---------------- POST / (superadmin/manager manual send) ----------------
router.post(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(sendNotificationValidation),
  controller.sendNotification,
);

// ---------------- GET / (superadmin/manager list all) ----------------
router.get(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(getAllNotificationsValidation, "query"),
  controller.getAllNotifications,
);

export default router;
