import { Router } from "express";
import imageGalleryRoute from "./imageGallery.route.js";

const router = Router()

router.get('/health', (req, res) => {
	res.json({ message: 'imageGallery route working Good ✅' });
});
router.use("/", imageGalleryRoute)

export default router