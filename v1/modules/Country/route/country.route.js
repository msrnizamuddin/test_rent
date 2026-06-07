
import express from "express";
import * as Controller from "../Controller/Country.controller.js"

const router = express.Router()


router.post("/createCountry" , Controller.createCountry)
router.get("/all", Controller.getCountry)
router.get('/country/:id', Controller.getCountryByID)
router.patch("/editCountry/:id", Controller.updateCountry)

export default router