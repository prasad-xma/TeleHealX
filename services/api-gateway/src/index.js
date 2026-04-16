import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

app.use(cors());

const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5002';
const patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:5015';
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5004';
const telemedicineServiceUrl = process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:5005';

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
  '/api/ai',
  createServiceProxy(aiServiceUrl, '/api/ai')
);

app.use(
  '/api/telemedicine',
  createServiceProxy(telemedicineServiceUrl, '/api/telemedicine')
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
