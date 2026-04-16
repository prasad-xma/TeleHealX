import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));

const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:5004";
const appointmentServiceUrl =
  process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5005";
const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:5006";

/**
 * Helper to create proxy with proper path rewrite.
 */
const createServiceProxy = (target, rewritePrefix) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => {
      return `${rewritePrefix}${path}`;
    },
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: "Gateway proxy error",
        details: err.message
      });
    }
  });

/**
 * IMPORTANT:
 * Stripe webhook should be forwarded before express.json()
 * to avoid body-parsing issues.
 */
app.use(
  "/api/webhooks",
  createProxyMiddleware({
    target: paymentServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/webhooks": "/api/webhooks"
    },
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: "Gateway webhook proxy error",
        details: err.message
      });
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health route
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway is healthy"
  });
});

/**
 * Existing service proxies
 */
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/api/auth"
    }
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "/api/users"
    }
  })
);

app.use(
  "/api/ai",
  createProxyMiddleware({
    target: aiServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/ai": "/api/ai"
    }
  })
);

/**
 * New proxies for your contribution
 */
app.use(
  "/api/appointments",
  createProxyMiddleware({
    target: appointmentServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/appointments": "/api/appointments"
    },
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: "Appointment Service proxy error",
        details: err.message
      });
    }
  })
);

app.use(
  "/api/payments",
  createProxyMiddleware({
    target: paymentServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/payments": "/api/payments"
    },
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: "Payment Service proxy error",
        details: err.message
      });
    }
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway running...");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});