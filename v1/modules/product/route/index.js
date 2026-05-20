import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct } from "../controller/product.controller.js";

const router = express.Router();

router.post("/", createProduct); 
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);

export default router;