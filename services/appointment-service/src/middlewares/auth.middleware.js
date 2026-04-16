const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/appError");

const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const protect = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return next(new AppError("Access token is missing or invalid", 401));
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email || null,
      role: decoded.role || null,
      raw: decoded
    };

    return next();
  } catch (error) {
    return next(new AppError("Unauthorized access", 401));
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized access", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }

    return next();
  };
};

const protectInternalService = (req, res, next) => {
  const internalSecret = req.headers["x-internal-service-secret"];

  if (!internalSecret) {
    return next(new AppError("Internal service secret is missing", 401));
  }

  if (!env.internalServiceSecret) {
    return next(new AppError("INTERNAL_SERVICE_SECRET is not configured", 500));
  }

  if (internalSecret !== env.internalServiceSecret) {
    return next(new AppError("Invalid internal service secret", 403));
  }

  return next();
};

module.exports = {
  protect,
  authorize,
  protectInternalService
};