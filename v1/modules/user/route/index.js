import express from 'express'
import UserRouter from "./user.route.js"

const router = express.Router()


router.get('/health', (req, res) => {
	res.json({ message: 'User route working Good ✅' });
});

router.use("/", UserRouter)

export default router