import express from "express"

import EmployeeRouter from "./employee.route.js"


const router = express.Router()

router.get('/health', (req, res) => {
	res.json({ message: 'Employee route working Good ✅' });
});

router.use('/', EmployeeRouter)


export default router
