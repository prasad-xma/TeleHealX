const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 5005,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "",
  patientServiceUrl: process.env.PATIENT_SERVICE_URL || "",
  doctorServiceUrl: process.env.DOCTOR_SERVICE_URL || "",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  defaultTimezone: process.env.DEFAULT_TIMEZONE || "Asia/Colombo",
  nodeEnv: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "appointment-service",
  useMockDoctorService: process.env.USE_MOCK_DOCTOR_SERVICE || "true",
  useMockPatientService: process.env.USE_MOCK_PATIENT_SERVICE || "true",
  maxRescheduleCount: Number(process.env.MAX_RESCHEDULE_COUNT || 2)
};

if (!env.mongoUri) {
  console.warn(" MONGODB_URI is not configured for appointment-service");
}

if (!env.jwtSecret) {
  console.warn(" JWT_SECRET is not configured for appointment-service");
}

module.exports = env;