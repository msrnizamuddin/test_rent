import express from 'express'
import PermissionRouter from "./permission.route.js"

const router = express.Router()


router.get('/health', (req, res) => {
	res.json({ message: 'Permisson route working Good ✅' });
});

router.use("/", PermissionRouter)


export default router