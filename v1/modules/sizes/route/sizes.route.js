import express from "express"
import {createSizesController,getAllSizesController,getSizesByIDController,updateSizesController} from "../controller/sizes.controller.js"
import { validate } from "../../../middleware/validate.middleware.js"
import { createSizesValidation,updateSizesValidation } from "../validation/sizes.validation.js"

const router = express.Router()

router.post("/", validate(createSizesValidation), createSizesController)
router.get("/", getAllSizesController)
router.get("/:id", getSizesByIDController)
router.patch("/:id", validate(updateSizesValidation), updateSizesController)

export default router;