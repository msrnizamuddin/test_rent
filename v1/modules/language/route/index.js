import express from "express";
import { createLanguage, deleteLanguage, getLanguageById, getLanguages, updateLanguage } from "../controller/language.controller.js";
import validateSchema from "../middleware/validate.js";
import { createLanguageSchema } from "../validation/language.validation.js";
// import LanguageController from "../controller/language.controller.js";
const router = express.Router();

router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Language  module routes are active! 🚀"
    });
});
router.post('/create', validateSchema(createLanguageSchema), createLanguage);
router.get('/getLanguage', getLanguages);
router.get('/getLanguage/:id',getLanguageById);
router.patch('/update/:id', updateLanguage);
router.delete('/delete/:id', deleteLanguage);


export default router;