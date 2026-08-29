import { Router } from "express";
import sizesRoute from "./sizes.route.js";

const router = Router();

router.get("/health", (req, res) => {res.json({ message: "sizes route working Good ✅" })})

router.use("/", sizesRoute);

export default router;