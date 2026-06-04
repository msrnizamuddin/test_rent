
const globalErrorHandler = (err, req, res, next) => {
  console.log(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";





  res.status(statusCode).json({
    success: false,
    message,
    error: err,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

    next(s)
};

export default globalErrorHandler;