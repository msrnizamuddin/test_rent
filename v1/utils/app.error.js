class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // trusted, thrown-on-purpose error vs a bug
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
