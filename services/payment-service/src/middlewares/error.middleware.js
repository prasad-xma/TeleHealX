const { sendError } = require("../utils/apiResponse");

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  console.error("❌ Payment Service Error:", error.message);

  return sendError(res, message, statusCode);
};

module.exports = errorMiddleware;