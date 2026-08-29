// Translate known non-operational errors (Mongoose, JWT, Joi) into clean responses
const normalizeError = (err) => {
  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid value for field: ${err.path}` };
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return { statusCode: 409, message: `${field} already exists` };
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return { statusCode: 400, message };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid token" };
  }
  if (err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Token expired" };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong",
  };
};

// 404 handler — mount right after all routes, before errorHandler
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler — must be registered LAST, after all routes and notFound
// Express recognizes it as an error handler by its 4-argument signature.
export const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = normalizeError(err);

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${req.method}] ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
