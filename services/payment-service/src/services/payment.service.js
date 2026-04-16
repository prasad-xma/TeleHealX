const Payment = require("../models/payment.model");
const { getPaymentProvider } = require("../factories/paymentProviderFactory");
const AppError = require("../utils/appError");

const buildPaymentReference = () => {
  return `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const createPaymentSession = async (data) => {
  const { amount, appointmentId, patientId } = data;

  if (!amount || !appointmentId || !patientId) {
    throw new AppError("amount, appointmentId, and patientId are required", 400);
  }

  const existingActivePayment = await Payment.findOne({
    appointmentId,
    status: { $in: ["INITIATED", "SUCCESS"] }
  });

  if (existingActivePayment && existingActivePayment.status === "SUCCESS") {
    throw new AppError("This appointment has already been paid", 400);
  }

  const provider = getPaymentProvider("STRIPE");
  const paymentReference = buildPaymentReference();

  const session = await provider.createCheckoutSession({
    amount,
    currency: "usd",
    metadata: {
      appointmentId,
      patientId,
      paymentReference
    }
  });

  const payment = new Payment({
    paymentReference,
    appointmentId,
    patientId,
    provider: "STRIPE",
    amount,
    currency: "usd",
    status: "INITIATED",
    stripeSessionId: session.id,
    metadata: session.metadata || {
      appointmentId,
      patientId,
      paymentReference
    }
  });

  await payment.save();

  return {
    paymentReference,
    checkoutUrl: session.url,
    sessionId: session.id
  };
};

module.exports = {
  createPaymentSession
};