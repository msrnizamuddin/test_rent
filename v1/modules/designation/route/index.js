import express from "express"
import DesignationROuter from "./designation.route.js"

const router = express.Router()



router.get('/health', (req, res) => {
	res.json({ message: 'Designation route working Good ✅' });
});

router.use("/", DesignationROuter)

export default router