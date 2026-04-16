import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 [API GATEWAY] ${req.method} ${req.url}`);
  console.log(`🌐 [API GATEWAY] Headers:`, {
    authorization: req.headers.authorization ? 'Bearer ***' : 'None',
    'content-type': req.headers['content-type'],
    'x-internal-api-key': req.headers['x-internal-api-key'] ? '***' : 'None'
  });
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`🌐 [API GATEWAY] Body:`, req.body);
  }
  next();
});

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5002';
const patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:5015';
const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5010';
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5004';
const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5007';
const telemedicineServiceUrl = process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:5005';
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008';

const createServiceProxy = (target, prefix) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${prefix}${path}`,
  });

app.use(
  '/api/auth',
  createServiceProxy(authServiceUrl, '/api/auth')
);

app.use(
  '/api/users',
  createServiceProxy(userServiceUrl, '/api/users')
);

app.use(
  '/api/patients',
  createServiceProxy(patientServiceUrl, '/api/patients')
);

app.use(
  '/api/doctors',
  createServiceProxy(doctorServiceUrl, '/api/doctors')
);

app.use(
  '/api/prescriptions',
  createServiceProxy(doctorServiceUrl, '/api/prescriptions')
);

app.use(
  '/api/ai',
  createServiceProxy(aiServiceUrl, '/api/ai')
);

app.use(
  '/api/appointments',
  createServiceProxy(appointmentServiceUrl, '/api/appointments')
);

app.use(
  '/api/telemedicine',
  createServiceProxy(telemedicineServiceUrl, '/api/telemedicine')
);

app.use(
  '/api/notifications',
  createServiceProxy(notificationServiceUrl, '/api/notifications')
);

app.get('/', (req, res) => {
  res.send('API Gateway running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
