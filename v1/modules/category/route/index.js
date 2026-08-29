import { Router } from "express";
import Category from "./category.route.js"
const router = Router();

router.get('/health', (req, res) => {
	res.json({ message: 'Category route working Good ✅' });
});

router.use("/", Category)


export default router;