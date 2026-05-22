import { Router } from "express";
import createTenant from "../controller/createTenant.js";
const router = Router();

router.post("/createTenant", createTenant);



export default router;