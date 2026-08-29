import express from "express";
import {
  createDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignation,
} from "../controller/designation.controller.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  createDesignationSchema,
  updateDesignationSchema,
} from "../validation/designation.validation.js";

const router = express.Router();

router.post("/", validate(createDesignationSchema), createDesignation);
router.get("/", getAllDesignation);
router.get("/:id", getDesignationById);
router.patch("/:id", validate(updateDesignationSchema), updateDesignation);

export default router;
