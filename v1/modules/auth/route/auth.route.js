import express from "express";
import * as controller from "../controller/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { signupValidation, loginValidation,} from "../validation/auth.validation.js";

const router = express.Router();

router.post(
  "/reg",
  validate(signupValidation),
  controller.register,
);

router.post(
  "/login",
  validate(loginValidation),
  controller.login,
);

router.get(
  "/user",
  controller.getAllUsers,
);

router.patch(
  "/user/:id",
  controller.updateUser,
);

export default router;