import Joi from "joi";
// Reusable helper for validating MongoDB ObjectIds (24-character hex strings)
const objectId = Joi.string().hex().length(24).messages({
	'string.hex': 'Invalid ID format',
	'string.length': 'ID must be exactly 24 characters'
});
const brandValidationSchema = Joi.object({
	tenantId: Joi.string().trim().required().messages({
		'any.required': 'Tenant ID is required'
	}),

	centralStatus: Joi.string()
		.valid('active', 'inactive')
		.default('active')
		.messages({
			'any.only': 'centralStatus must be either active or inactive'
		}),

	name: Joi.string().trim().min(2).max(100).required().messages({
		'string.min': 'Brand name must be at least 2 characters',
		'string.max': 'Brand name cannot exceed 100 characters',
		'any.required': 'Brand name is required'
	}),

	slug: Joi.string()
		.trim()
		.lowercase()
		// Regex ensures standard slug format: lowercase letters, numbers, and hyphens only
		.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.required()
		.messages({
			'any.required': 'Slug is required',
			'string.pattern.base':
				'Slug can only contain lowercase letters, numbers, and hyphens'
		}),

	profileImage: Joi.string().trim().allow('').optional().default(''),

	status: Joi.string().valid('active', 'inactive').default('active').messages({
		'any.only': 'status must be either active or inactive'
	}),

	createdBy: objectId.required().messages({
		'any.required': 'Creator ID is required'
	}),

	updatedBy: objectId.allow(null).optional()
});
const schema=brandValidationSchema
export default schema