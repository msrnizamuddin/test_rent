import express from "express";
import { createProduct, getAllProducts, updateProduct } from "../controller/product.controller.js";

const router = express.Router();

router.post("/create", createProduct);
router.get("/all", getAllProducts);
router.put("/update/:id", updateProduct);

export default router;