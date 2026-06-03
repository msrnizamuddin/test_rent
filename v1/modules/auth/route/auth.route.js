import express from "express";
import * as controller from "../controller/auth.controller.js";

const router = express.Router();

router.post("/reg", controller.register);
router.post("/login", controller.login);
router.get("/user", controller.getAllUsers);

export default router;
