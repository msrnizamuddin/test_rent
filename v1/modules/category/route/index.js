import express from "express";
const router = express.Router();
import { getAllCaterogires, getAllSUbCaterogires, getAllChildCaterogires, createCategory, createChildCategory, createSubCategory } from "../controller/Categories.controller.js"

router.post("/createCategory", createCategory);
router.post("/createSubCategory", createSubCategory );
router.post("/createChildCategory", createChildCategory );
router.get("/allCategories", getAllCaterogires );
router.get("/allSubCategories", getAllSUbCaterogires );
router.get("/allChildCategories", getAllChildCaterogires );





export default router;