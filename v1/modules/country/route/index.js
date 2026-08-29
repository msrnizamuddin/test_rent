import { Router } from "express";
import CountryRouter from "./country.route.js";
const router = Router();

router.get("/health", (req, res) => {
  res.json({ "message" : "country route working Good ✅" });
});
router.use(CountryRouter);
export default router;