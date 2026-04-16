const env = require("../config/env");

const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    service: env.serviceName,
    status: "OK",
    timestamp: new Date()
  });
};

module.exports = { getHealthStatus };