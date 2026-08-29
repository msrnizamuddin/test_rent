import express from "express"
import DeparmentRouter from "./department.route.js"


const router = express.Router()


router.get('/health', (req, res) => {
	res.json({ message: 'Department route working Good ✅' });
});

router.use("/", DeparmentRouter)

export default router
