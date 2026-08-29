import express from "express";
const router = express.Router();
import {
  getAllCaterogires,
  createCategory,
  updateCategory,
  getCategoryByID,
} from "../controller/categories.controller.js";
import {
  createCategorySchemaValidation,
  updateCategorySchemaValidation,
} from "../Validation/categoryValidation.js";

import { validate } from "../../../middleware/validate.middleware.js";

//ROUTES
router.post("/", validate(createCategorySchemaValidation), createCategory);

router.get("/", getAllCaterogires);
router.get("/:id", getCategoryByID);

router.patch("/:id", validate(updateCategorySchemaValidation), updateCategory);

export default router;
