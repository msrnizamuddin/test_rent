import express from "express";
const router = express.Router();
import {
  getAllCaterogires,
  getAllSUbCaterogires,
  getAllChildCaterogires,
  createCategory,
  createChildCategory,
  createSubCategory,
} from "../controller/Categories.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCategorySchemaValidation } from "../validation/categoryValidation.js";
import { createSubCategorySchemaValidation } from "../validation/subCategoryValidation.js";
import { createChildCategorySchemaValidation } from "../validation/childCategoryValidation.js";

//ROUTES
router.post(
  "/createCategory",
  validate(createCategorySchemaValidation),
  createCategory,
);
router.post(
  "/createSubCategory",
  validate(createSubCategorySchemaValidation),
  createSubCategory,
);
router.post(
  "/createChildCategory",
  validate(createChildCategorySchemaValidation),
  createChildCategory,
);
router.get("/allCategories", getAllCaterogires);
router.get("/allSubCategories", getAllSUbCaterogires);
router.get("/allChildCategories", getAllChildCaterogires);

export default router;
