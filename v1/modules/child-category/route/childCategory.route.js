import express from "express";
const router = express.Router();
import {
  getAllChildCaterogires,
  createChildCategory,
  updateChildCategory,
  getChildCategoryByID,
} from "../controller/childCategories.controller.js";

import {
  createChildCategorySchemaValidation,
  updateChildCategorySchemaValidation,
} from "../Validation/childCategoryValidation.js";
import { validate } from "../../../middleware/validate.middleware.js";

//ROUTES

router.post(
  "/",
  validate(createChildCategorySchemaValidation),
  createChildCategory,
);
router.get("/", getAllChildCaterogires);
router.get("/:id", getChildCategoryByID);

router.patch(
  "/:id",
  validate(updateChildCategorySchemaValidation),
  updateChildCategory,
);
export default router;
