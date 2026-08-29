import { currencyService } from '../service/currency.service.js';
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
export const createCurrency = async (req, res, next) => {
	try {
		const data = await currencyService.createCurrency(req.body);

		res.status(201).json({
			success: true,
			message: 'Currency created successfully',
			data
		});
	} catch (error) {
		next(error);
	}
};

export const getCurrencies = async (req, res, next) => {
	try {
		const data = await currencyService.getCurrencies(req.query);

		res.status(200).json({
			success: true,
			message: 'Currencies fetched successfully',
			data
		});
	} catch (error) {
		next(error);
	}
};

export const getCurrencyById = async (req, res, next) => {
	try {
		const data = await currencyService.getCurrencyById(req.params.id);

		if (!data) {
			return res.status(404).json({
				success: false,
				message: 'Currency not found'
			});
		}

		res.status(200).json({
			success: true,
			message: 'Currency fetched successfully',
			data
		});
	} catch (error) {
		next(error);
	}
};

export const updateCurrency = async (req, res, next) => {
	try {
		const data = await currencyService.updateCurrency(req.params.id, req.body);

		if (!data) {
			return res.status(404).json({
				success: false,
				message: 'Currency not found'
			});
		}

		res.status(200).json({
			success: true,
			message: 'Currency updated successfully',
			data
		});
	} catch (error) {
		next(error);
	}
};

