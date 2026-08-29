import Currency  from '../model/currency.model1.js';

const createCurrency = async currencyData => {
	return await Currency.create(currencyData);
};

const getCurrencies = async (filter = {}) => {
	return await Currency.find(filter);
};

const getCurrencyById = async id => {
	return await Currency.findById(id);
};

const updateCurrency = async (id, updateData) => {
	return await Currency.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true
	});
};

const deleteCurrency = async id => {
	return await Currency.findByIdAndDelete(id);
};

export const currencyService = {
	createCurrency,
	getCurrencies,
	getCurrencyById,
	updateCurrency,
	deleteCurrency
};
