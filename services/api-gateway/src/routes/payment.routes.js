const { createProxyMiddleware } = require("http-proxy-middleware");
const env = require("../config/env");

const paymentProxy = createProxyMiddleware({
  target: env.paymentServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    "^/api/payments": "/api/payments"
  },
  onError: (error, req, res) => {
    res.status(502).json({
      success: false,
      message: "Payment Service is unavailable",
      details: error.message
    });
  }
});

module.exports = paymentProxy;