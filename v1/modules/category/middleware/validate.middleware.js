export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // remove unknown fields
    });
    if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.reduce((acc, err) => {
        acc[err.context.key] = err.message.replace(/"/g, "");
        return acc;
      }, {}),
    });
  }
    req.body = value;
    next();
  };
};