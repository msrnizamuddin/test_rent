import express from "express";
// import { createLanguage, deleteLanguage, getLanguageById, getLanguages, updateLanguage } from "../controller/language.controller.js";
import validateSchema from "../middleware/validate.js";
import { createLanguageSchema } from "../validation/language.validation.js";
import {
  createLanguageService,
  getLanguageByIdService,
  getLanguagesService,
} from "../service/language.service.js";
import {
  deleteLanguage,
  updateLanguage,
} from "../controller/language.controller.js";
import languageRouter from "./language.route.js";
// import LanguageController from "../controller/language.controller.js";
const router = express.Router();

router.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Language  module routes are active! 🚀'
	});
});
router.use(languageRouter);

export default router;
