import { createDepartment, getAllDepartment, getDepartmentById, updateDepartment } from "../controller/department.controller.js"
import express from "express"
import { validate } from "../../../middleware/validate.middleware.js"
import { createDepartmentSchema, updateDepartmentSchema } from "../validation/department.validation.js"

const router = express.Router()

router.post('/', validate(createDepartmentSchema), createDepartment)

router.get('/', getAllDepartment)

router.get('/:id', getDepartmentById)

router.patch('/:id', validate(updateDepartmentSchema), updateDepartment)


export default router
