import { createLanguage, deleteLanguage, getLanguageById, getLanguages, updateLanguage } from "../controller/language.controller.js";
import validateSchema from "../middleware/validate.js";
import { createLanguageSchema } from "../validation/language.validation.js";
import express from 'express';

const router=express.Router()
import { validate } from '../../../middleware/validate.middleware.js';

router.post('/', validate(createLanguageSchema), createLanguage);
router.get('/', getLanguages);
router.get('/:id', getLanguageById);
router.patch('/:id', updateLanguage);
router.delete('/:id', deleteLanguage);

const languageRouter = router
export default languageRouter
