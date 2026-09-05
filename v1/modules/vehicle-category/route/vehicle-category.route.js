import express from "express";
import * as controller from "../controller/vehicle-category.controller.js";

import {
  searchCategoryValidation,
  categoryIdParamValidation,
  createCategoryValidation,
  updateCategoryValidation,
} from "../validation/vehicle-category.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Safe "get everything" — no filters, no conditions.
router.get("/all", controller.getAll);

router.get(
  "/",
  validate(searchCategoryValidation, "query"),
  controller.searchCategories,
);

router.post(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(createCategoryValidation),
  controller.createCategory,
);

router.patch(
  "/:categoryId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(categoryIdParamValidation, "params"),
  validate(updateCategoryValidation),
  controller.updateCategory,
);

router.delete(
  "/:categoryId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(categoryIdParamValidation, "params"),
  controller.deleteCategory,
);

router.get(
  "/:categoryId",
  validate(categoryIdParamValidation, "params"),
  controller.getCategoryById,
);

export default router;
