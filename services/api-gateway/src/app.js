const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const appointmentProxy = require("./routes/appointment.routes");
const paymentProxy = require("./routes/payment.routes");
const webhookProxy = require("./routes/webhook.routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));

/**
 * 🔥 VERY IMPORTANT
 * Webhook must be BEFORE express.json()
 */
app.use("/api/webhooks", webhookProxy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 🔥 HEALTH ROUTE (THIS WAS MISSING)
 */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API Gateway is healthy"
  });
});

/**
 * 🔥 PROXY ROUTES
 */
app.use("/api/appointments", appointmentProxy);
app.use("/api/payments", paymentProxy);

module.exports = app;