import Joi from 'joi';

// Validation for Creating a Country
const createCountry = Joi.object({
	name: Joi.string().trim().required().messages({
		'string.empty': 'Country name is required'
	}),

	centralStatus: Joi.string().valid('active', 'inactive').default('active'),

	status: Joi.string().valid('active', 'inactive').default('active'),

	code: Joi.string()
		.trim()
		.uppercase() // Optional: Good practice for country codes like 'US' or 'USA'
		.required()
		.messages({
			'string.empty': 'Country code is required'
		})
});

// Validation for Updating a Country
const updateCountry = Joi.object({
	name: Joi.string().trim(),
	centralStatus: Joi.string().valid('active', 'inactive'),
	status: Joi.string().valid('active', 'inactive'),
	code: Joi.string().trim().uppercase()
}).min(1); // Ensures at least one field is provided when updating

export const countryValidation = {
	createCountry,
	updateCountry
};
