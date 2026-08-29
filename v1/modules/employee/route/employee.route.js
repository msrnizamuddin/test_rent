import express from 'express'
import { createEmployee, getEmployeeById, getEmployees, updateEmployee } from '../controller/employee.controller.js'

const router = express.Router()



router.post('/', createEmployee)
router.get('/',getEmployees)
router.get('/', getEmployeeById)
router.patch('/',updateEmployee)

export default router