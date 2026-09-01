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
      // Express 5's req.query is a live getter that re-parses req.url on every
      // access (no caching), so mutating the object it returns is a no-op —
      // the next read just recomputes from scratch. Replace the getter itself
      // with the validated, coerced value instead.
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[property] = value;
    }

    next();
  };
};
