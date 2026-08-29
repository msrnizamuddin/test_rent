import express from "express";
import * as controller from "../controller/auth.controller.js";



import { signupValidation, loginValidation, updateUserValidation } from "../validation/auth.validation.js";
import { logModule } from '../../../utils/moduleLogger.js';
import { validate } from "../../../middleware/validate.middleware.js";
logModule(import.meta.url);
const router = express.Router();

router.post(
	'/reg',
	 validate(signupValidation),
	controller.register
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
  validate(updateUserValidation),
  controller.updateUser,
);

export default router;