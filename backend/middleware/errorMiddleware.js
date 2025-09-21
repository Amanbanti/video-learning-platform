const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passes error to the errorHandler
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose-specific errors
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    // Duplicate key error
    statusCode = 400;
    const field = Object.keys(err.keyValue);
    message = `Duplicate field value: ${field}`;
  }

  if (err.name === "CastError") {
    // Invalid ObjectId
    statusCode = 404;
    message = `Resource not found`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? "🥮" : err.stack,
  });
};

export { notFound, errorHandler };
