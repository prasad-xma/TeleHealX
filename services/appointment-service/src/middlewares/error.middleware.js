const { sendError } = require("../utils/apiResponse");

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Appointment Service Error:", {
      message: error.message,
      stack: error.stack,
      details: error.details || null
    });
  }

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV !== "production"
      ? error.details || error.stack
      : undefined
  );
};

module.exports = errorMiddleware;