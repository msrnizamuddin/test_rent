import express from 'express';

const router = express.Router();
import { logModule } from '../../../utils/moduleLogger.js';
import { countryValidation } from '../validation/country.validation.js';
import { createCountry, getCountry, getCountryByID, updateCountry } from '../controller/country.controller.js';
import { validate } from "../../../middleware/validate.middleware.js";

logModule(import.meta.url);
router.post(
	'/',
	validate(countryValidation.createCountry),
createCountry
);
router.get('/', getCountry);
router.get('/:id', getCountryByID);
router.patch('/:id',
	validate(countryValidation.updateCountry),
	updateCountry);
const CountryRouter = router;

export default CountryRouter;
