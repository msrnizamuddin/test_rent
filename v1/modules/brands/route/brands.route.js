import express from "express";

import {
  createBrands,
  getBrands,
  getBrandsById,
  updateBrands,
} from "../controller/brand.controller.js";

import { validate } from "../../../middleware/validate.middleware.js";

import {
  createBrandValidation,
  updateBrandValidation,
} from "../validation/brands.validation.js";

const router = express.Router();

router.post("/", validate(createBrandValidation), createBrands);
router.get("/", getBrands);
router.get("/:id", getBrandsById);
router.patch("/:id", validate(updateBrandValidation), updateBrands);
const BrandsRouter = router;

export default BrandsRouter;
