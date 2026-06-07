import { Router } from "express";
import Country from "./country.route.js"
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Country route working Good ✅" });
});

router.use("/", Country)


export default router;