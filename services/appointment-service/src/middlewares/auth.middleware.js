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

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  return String(role).trim().toUpperCase();
};

const protect = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return next(new AppError("Access token is missing or invalid", 401));
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: decoded.userId || decoded.id || decoded._id || decoded.sub || null,
      email: decoded.email || null,
      role: normalizeRole(decoded.role),
      raw: decoded,
      token
    };

    if (!req.user.userId) {
      return next(new AppError("Invalid token payload: user id not found", 401));
    }

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

    const normalizedAllowedRoles = allowedRoles.map((role) =>
      String(role).trim().toUpperCase()
    );

    const userRole = normalizeRole(req.user.role);

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return next(
        new AppError(
          `Forbidden: insufficient permissions. Required roles: ${normalizedAllowedRoles.join(
            ", "
          )}. Your role: ${userRole || "UNKNOWN"}`,
          403
        )
      );
    }

    return next();
  };
};

const allowInternalServiceOrUser = (...allowedRoles) => {
  return (req, res, next) => {
    const internalSecret = req.headers["x-internal-service-secret"];

    if (
      internalSecret &&
      env.internalServiceSecret &&
      internalSecret === env.internalServiceSecret
    ) {
      req.user = {
        userId: "internal-payment-service",
        email: null,
        role: "ADMIN",
        raw: { internalService: true }
      };

      req.isInternalServiceRequest = true;
      return next();
    }

    return protect(req, res, (error) => {
      if (error) {
        return next(error);
      }

      return authorize(...allowedRoles)(req, res, next);
    });
  };
};

module.exports = {
  protect,
  authorize,
  allowInternalServiceOrUser
};