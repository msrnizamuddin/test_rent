import express from "express";
import RoleRouter from "./role.route.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "ROle route working Good ✅" });
});

router.use("/", RoleRouter);

export default router;
