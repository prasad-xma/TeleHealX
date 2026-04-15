const { sendError } = require("../utils/apiResponse");

const notFoundMiddleware = (req, res, next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFoundMiddleware;