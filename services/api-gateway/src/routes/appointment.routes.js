const { createProxyMiddleware } = require("http-proxy-middleware");
const env = require("../config/env");

const appointmentProxy = createProxyMiddleware({
  target: env.appointmentServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    "^/api/appointments": "/api/appointments"
  },
  onError: (error, req, res) => {
    res.status(502).json({
      success: false,
      message: "Appointment Service is unavailable",
      details: error.message
    });
  }
});

module.exports = appointmentProxy;