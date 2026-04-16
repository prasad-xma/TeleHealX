const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    appointmentId: {
      type: String,
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ["STRIPE", "PAYHERE", "FRIMI", "PAYPAL"],
      default: "STRIPE"
    },
    currency: {
      type: String,
      default: "usd"
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
      default: "INITIATED"
    },
    stripeSessionId: {
      type: String,
      default: ""
    },
    stripePaymentIntentId: {
      type: String,
      default: ""
    },
    checkoutUrl: {
      type: String,
      default: ""
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ appointmentId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, provider: 1 });

module.exports = mongoose.model("Payment", paymentSchema);