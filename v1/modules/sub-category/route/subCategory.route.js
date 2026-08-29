import express from "express";
const router = express.Router();
import {
  getAllSUbCaterogires,
  createSubCategory,
  updateSubCategory,
  getSubCategoryByID,
} from "../controller/subCategory.controller.js";

import {
  createSubCategorySchemaValidation,
  updateSubCategorySchemaValidation,
} from "../Validation/subCategoryValidation.js";

import { validate } from "../../../middleware/validate.middleware.js";

//ROUTES

router.post(
  "/",
  validate(createSubCategorySchemaValidation),
  createSubCategory,
);
router.get("/", getAllSUbCaterogires);
router.get("/:id", getSubCategoryByID);
router.patch(
  "/:id",
  validate(updateSubCategorySchemaValidation),
  updateSubCategory,
);

export default router;
