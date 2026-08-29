const validate = (schema, property = 'body') => {
	return (req, res, next) => {
		const { error } = schema.validate(req[property], { abortEarly: false });

		if (error) {
			const errorMessage = error.details
				.map(detail => detail.message)
				.join(', ');
			return res.status(400).json({
				success: false,
				message: 'Validation Error',
				errors: errorMessage
			});
		}

		next();
	};
};

const validateCountrySchema = validate;
export default validateCountrySchema;
