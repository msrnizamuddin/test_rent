const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  if (err.name === "CastError" || err.kind === "ObjectId" || err.name === "BSONError") {
    statusCode = 400;
    message = "Invalid ID format. Please provide a valid 24-character MongoDB ID.";
  }

  // ---- NAYA: Mongoose validation error (required field missing, enum mismatch, etc.) ----
  if (err.name === "ValidationError") {
    statusCode = 400;
    const validationErrors = Object.values(err.errors).map((e) => e.message);
    message = validationErrors.join(", ");
    errors = validationErrors;
  }

  if (err.isJoi) {
    statusCode = 400;
  }

  if (statusCode === 500) {
    console.error("🔥 [SERVER ERROR]:", err);
  }
  return res.status(statusCode).json({
    success: false,
    message: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;