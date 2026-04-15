const env = require("../config/env");

const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Appointment service is healthy",
    service: env.serviceName,
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealthStatus
};