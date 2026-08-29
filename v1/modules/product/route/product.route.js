import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controller/product.controller.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../validation/product.validation.js";
import { validate } from "../../auth/middleware/validate.middleware.js";
import authMiddleware from "../../../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.post(
  "/",
  //authMiddleware("tenant", "superadmin"),
  validate(createProductValidation),
  createProduct,
);

productRouter.get(
  "/",
  //authMiddleware("tenant", "superadmin"),
  getAllProducts,
);

productRouter.get(
  "/:id",
  //authMiddleware("tenant", "superadmin"),
  getProductById,
);

productRouter.patch(
  "/:id",
  //authMiddleware("tenant", "superadmin"),
  validate(updateProductValidation),
  updateProduct,
);

export default productRouter;
