const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true
    },
    appointmentId: {
      type: String,
      required: true
    },
    patientId: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      default: "STRIPE"
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "usd"
    },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
      default: "INITIATED"
    },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    metadata: Object,
    failureReason: String,
    paidAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);