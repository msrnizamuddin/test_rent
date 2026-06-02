import { Router } from "express";
import createBrand from "../controller/createBrand.js";
const router = Router();

router.post("/createBrand",createBrand );



export default router;