import express from "express";
import * as controller from "../controller/setting.controller.js";

import {
  settingKeyParamValidation,
  updateSettingValidation,
} from "../validation/setting.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Settings (currency, tax, website name, etc.) are needed to render the
// public site, so reads are open; only Super Admin can change them.
router.get("/all", controller.getAll);
router.get("/:key", validate(settingKeyParamValidation, "params"), controller.getByKey);

router.patch(
  "/:key",
  authenticate,
  authorize("superadmin"),
  validate(settingKeyParamValidation, "params"),
  validate(updateSettingValidation),
  controller.updateSetting,
);

export default router;
