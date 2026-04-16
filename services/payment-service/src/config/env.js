const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5006,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  clientUrl: process.env.CLIENT_URL,
  serviceName: process.env.SERVICE_NAME || "payment-service"
};