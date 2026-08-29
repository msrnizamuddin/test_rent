
import express from 'express';
import { currencyValidation } from '../validation/currency.validation.js';
import { validate } from "../../../middleware/validate.middleware.js";

import {
	createCurrency,
	getCurrencies,
	getCurrencyById,
	updateCurrency
} from '../controller/currency.controller.js';

const router = express.Router();

router.post(
	'/',
	validate(currencyValidation.createCurrency),
	createCurrency
);
router.get('/', getCurrencies);
router.get('/:id', getCurrencyById);
router.patch(
	'/:id',
	validate(currencyValidation.updateCurrency),
	updateCurrency
);
const CurrencyRouter = router;

export default CurrencyRouter;