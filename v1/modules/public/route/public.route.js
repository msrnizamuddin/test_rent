import { Router } from "express";
import {
  getAllCaterogires,
  getCategoryByID,
} from "../../category/controller/categories.controller.js";
import {
  getAllProducts,
  getProductById,
} from "../../product/controller/product.controller.js";
import {
  getAllChildCaterogires,
  getChildCategoryByID,
} from "../../child-category/controller/childCategories.controller.js";
import {
  getAllSUbCaterogires,
  getSubCategoryByID,
} from "../../sub-category/controller/subCategory.controller.js";
import {
  getBrands,
  getBrandsById,
} from "../../brands/controller/brand.controller.js";

const router = Router();
//category get
router.get("/category", getAllCaterogires);
router.get("/category/:id", getCategoryByID);

//sub category get

router.get("/sub-category", getAllSUbCaterogires);
router.get("/sub-category/:id", getSubCategoryByID);

// child category get

router.get("/child-category", getAllChildCaterogires);
router.get("/child-category/:id", getChildCategoryByID);

//product get

router.get("/product", getAllProducts);
router.get("/product/:id", getProductById);

// Brand get

router.get("/brand", getBrands);
router.get("/brand/:id", getBrandsById);

export default router;
