const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:5002",
  appointmentServiceUrl: process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5005",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:5006",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};