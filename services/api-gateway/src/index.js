import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth'
    }
  })
);

app.use(
  '/api/users',
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/api/users'
    }
  })
);

app.get('/', (req, res) => {
  res.send('API Gateway running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
