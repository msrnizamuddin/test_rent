import Joi from 'joi';

// Validation for Creating a Currency
const createCurrency = Joi.object({
	centralStatus: Joi.string()
		.valid('active', 'inactive')
		.default('active')
		.messages({
			'any.only': 'Central status must be either active or inactive'
		}),

	name: Joi.string().trim().required().messages({
		'any.required': 'Currency name is required',
		'string.empty': 'Currency name is required'
	}),

	cc: Joi.string()
		.trim()
		.uppercase()
		.pattern(/^[A-Z]{3}$/)
		.required()
		.messages({
			'any.required': 'Currency code is required',
			'string.empty': 'Currency code is required',
			'string.pattern.base':
				'Currency code must contain exactly 3 uppercase letters (e.g., USD, BDT)'
		}),

	symbol: Joi.string().trim().required().messages({
		'any.required': 'Currency symbol is required',
		'string.empty': 'Currency symbol is required'
	})
});

// Validation for Updating a Currency
const updateCurrency = Joi.object({
	centralStatus: Joi.string().valid('active', 'inactive'),

	name: Joi.string().trim(),

	cc: Joi.string().trim().uppercase().length(3).messages({
		'string.length': 'Currency code must be exactly 3 letters'
	}),

	symbol: Joi.string().trim()
}).min(1); // Ensures at least one field is provided when updating

export const currencyValidation = {
	createCurrency,
	updateCurrency
};
