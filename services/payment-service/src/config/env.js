const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5006,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "",
  appointmentServiceUrl: process.env.APPOINTMENT_SERVICE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: process.env.STRIPE_CURRENCY || "usd",
  nodeEnv: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "payment-service"
};