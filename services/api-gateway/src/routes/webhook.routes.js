const { createProxyMiddleware } = require("http-proxy-middleware");
const env = require("../config/env");

/**
 * Stripe webhook must be forwarded to payment-service exactly.
 * Do not parse JSON before forwarding if your gateway app currently does that globally.
 */
const paymentWebhookProxy = createProxyMiddleware({
  target: env.paymentServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    "^/api/webhooks": "/api/webhooks"
  },
  onError: (error, req, res) => {
    res.status(502).json({
      success: false,
      message: "Payment webhook target is unavailable",
      details: error.message
    });
  }
});

module.exports = paymentWebhookProxy;