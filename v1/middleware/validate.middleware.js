/**
 * Generic Joi validation middleware.
 * Usage: router.post("/signup", validate(signupValidation), authController.signup)
 */
/**
 * Generic Joi validation middleware.
 * Usage: router.get("/", validate(searchVehicleValidation, "query"), controller.search)
 */
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    if (property === "query") {
      // Express 5 makes req.query a getter-only property — mutate in place instead of reassigning
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, value);
    } else {
      req[property] = value;
    }

    next();
  };
};
