import express from "express";

import customerRouter from "./customer.route.js";

const router = express.Router();

router.use("/customer", customerRouter);

export default router;