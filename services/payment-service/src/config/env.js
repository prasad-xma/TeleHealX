const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 5006,
  mongoUri: process.env.MONGODB_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "payment-service",

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  appointmentServiceUrl: process.env.APPOINTMENT_SERVICE_URL || "",
  internalServiceSecret: process.env.INTERNAL_SERVICE_SECRET || "",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: process.env.STRIPE_CURRENCY || "usd"
};

if (!env.mongoUri) {
  console.warn("⚠️ MONGODB_URI is not configured for payment-service");
}

if (!env.stripeSecretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY is not configured for payment-service");
}

if (!env.appointmentServiceUrl) {
  console.warn("⚠️ APPOINTMENT_SERVICE_URL is not configured for payment-service");
}

if (!env.internalServiceSecret) {
  console.warn("⚠️ INTERNAL_SERVICE_SECRET is not configured for payment-service");
}

module.exports = env;