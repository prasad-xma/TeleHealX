const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};