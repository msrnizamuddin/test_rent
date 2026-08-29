import { Router } from "express";
const router = Router();
import subCategory from "./subCategory.route.js"
router.get('/health', (req, res) => {
	res.json({ message: 'subCategory route working Good ✅' });
});

router.use("/", subCategory)


export default router;