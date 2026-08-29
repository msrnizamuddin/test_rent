import Joi from 'joi';


export const createLanguageSchema = Joi.object({
					name: Joi.string().trim().required().messages({
						'string.empty': '"name" cannot be an empty field',
						'any.required': '"name" is a required field'
					}),

					code: Joi.string().trim().messages({
						'string.empty': '"code" cannot be an empty field',
						'any.required': '"code" is a required field'
					}),

					centralStatus: Joi.string()
						.valid('active', 'inactive')
						.default('active')
						.messages({
							'any.only':
								'"centralStatus" must be either "active" or "inactive"'
						})
				});


export const updateLanguageSchema = Joi.object({
	name: Joi.string().trim().optional(),

	code: Joi.string().trim().optional(),

	centralStatus: Joi.string().valid('active', 'inactive').optional()
});
const languageSchema = createLanguageSchema;
