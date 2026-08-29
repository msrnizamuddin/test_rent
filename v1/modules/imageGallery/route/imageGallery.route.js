import express from "express";
import upload from "../../../utils/multer.js";
import {
  createImageGalleryController,
  getAllImageGalleryController,
  updateImageGalleryController,
  uploadImageGalleryController,
  deleteImageGalleryController,
} from "../controller/imageGallery.controller.js";
import { createImageGalleryValidation } from "../validation/imageGallery.validation.js";
import { updateImageGalleryValidation } from "../validation/imageGallery.validation.js";
import { validate } from "../../../middleware/validate.middleware.js";

const router = express.Router();
router.post(
  "/",
  validate(createImageGalleryValidation),
  createImageGalleryController,
);
router.get("/", getAllImageGalleryController);
router.patch(
  "/:id",
  validate(updateImageGalleryValidation),
  updateImageGalleryController,
);
router.post("/upload", upload.single("image"), uploadImageGalleryController);

router.delete("/:id", deleteImageGalleryController);
export default router;
