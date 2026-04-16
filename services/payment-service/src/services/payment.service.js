const Payment = require("../models/Payment");
const AppError = require("../utils/appError");
const env = require("../config/env");
const { createStripeCheckoutSession } = require("../providers/stripe.provider");
const Stripe = require("stripe");
const axios = require("axios");

const stripe = new Stripe(env.stripeSecretKey);

const generatePaymentNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `PAY-${year}-${timestampPart}${randomPart}`;
};

const createUniquePaymentNumber = async () => {
  let paymentNumber = generatePaymentNumber();
  let exists = await Payment.exists({ paymentNumber });

  while (exists) {
    paymentNumber = generatePaymentNumber();
    exists = await Payment.exists({ paymentNumber });
  }

  return paymentNumber;
};

const generatePaymentReference = () => {
  const now = new Date();
  const year = now.getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `PREF-${year}-${timestampPart}${randomPart}`;
};

const createUniquePaymentReference = async () => {
  let paymentReference = generatePaymentReference();
  let exists = await Payment.exists({ paymentReference });

  while (exists) {
    paymentReference = generatePaymentReference();
    exists = await Payment.exists({ paymentReference });
  }

  return paymentReference;
};

const notifyAppointmentServicePaymentUpdate = async ({
  appointmentId,
  paymentStatus,
  appointmentStatus,
  note,
  paymentReference
}) => {
  if (!env.appointmentServiceUrl) {
    throw new AppError("APPOINTMENT_SERVICE_URL is not configured", 500);
  }

  if (!env.internalServiceSecret) {
    throw new AppError("INTERNAL_SERVICE_SECRET is not configured", 500);
  }

  await axios.patch(
    `${env.appointmentServiceUrl}/api/appointments/internal/${appointmentId}/payment-status`,
    {
      paymentStatus,
      appointmentStatus,
      note,
      paymentReference
    },
    {
      headers: {
        "x-internal-service-secret": env.internalServiceSecret
      },
      timeout: 8000
    }
  );
};

const getModuleInfo = async () => {
  return {
    module: "payment-service",
    version: "v1",
    status: "appointment-sync-ready",
    providersSupportedNow: ["STRIPE"],
    providersPlannedLater: ["PAYHERE", "FRIMI", "PAYPAL"],
    featuresAvailable: [
      "health check",
      "checkout session creation",
      "payment record creation",
      "stripe webhook handling",
      "appointment-service payment sync"
    ]
  };
};

const createCheckoutSession = async ({
  appointmentId,
  amount,
  currency,
  provider
}) => {
  if (!appointmentId) {
    throw new AppError("appointmentId is required", 400);
  }

  if (!amount || Number(amount) <= 0) {
    throw new AppError("amount must be greater than 0", 400);
  }

  const selectedProvider = String(provider || "STRIPE").trim().toUpperCase();

  if (selectedProvider !== "STRIPE") {
    throw new AppError("Only STRIPE is supported in current phase", 400);
  }

  const paymentNumber = await createUniquePaymentNumber();
  const paymentReference = await createUniquePaymentReference();
  const selectedCurrency = String(currency || env.stripeCurrency || "usd").toLowerCase();

  const stripeSession = await createStripeCheckoutSession({
    paymentNumber,
    appointmentId,
    amount: Number(amount),
    currency: selectedCurrency
  });

  const payment = await Payment.create({
    paymentNumber,
    paymentReference,
    appointmentId,
    provider: "STRIPE",
    currency: selectedCurrency,
    amount: Number(amount),
    status: "INITIATED",
    stripeSessionId: stripeSession.id,
    stripePaymentIntentId: stripeSession.payment_intent || "",
    checkoutUrl: stripeSession.url,
    metadata: {
      appointmentId
    }
  });

  return {
    paymentId: payment._id,
    paymentNumber: payment.paymentNumber,
    paymentReference: payment.paymentReference,
    appointmentId: payment.appointmentId,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    checkoutUrl: payment.checkoutUrl
  };
};

const markPaymentSuccessBySessionId = async (session) => {
  const payment = await Payment.findOne({ stripeSessionId: session.id });

  if (!payment) {
    return {
      handled: false,
      reason: "Payment record not found for session"
    };
  }

  payment.status = "SUCCESS";
  payment.stripePaymentIntentId =
    session.payment_intent || payment.stripePaymentIntentId || "";
  payment.metadata = {
    ...payment.metadata,
    stripeSessionCompleted: true,
    paymentStatus: session.payment_status || ""
  };

  await payment.save();

  await notifyAppointmentServicePaymentUpdate({
    appointmentId: payment.appointmentId,
    paymentStatus: "PAID",
    appointmentStatus: "CONFIRMED",
    note: "Online payment completed successfully",
    paymentReference: payment.paymentReference || payment.paymentNumber
  });

  return {
    handled: true,
    paymentId: String(payment._id),
    paymentNumber: payment.paymentNumber,
    paymentReference: payment.paymentReference,
    status: payment.status
  };
};

const markPaymentFailedByIntentId = async (paymentIntent) => {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });

  if (!payment) {
    return {
      handled: false,
      reason: "Payment record not found for payment intent"
    };
  }

  payment.status = "FAILED";
  payment.metadata = {
    ...payment.metadata,
    paymentIntentStatus: paymentIntent.status || ""
  };

  await payment.save();

  await notifyAppointmentServicePaymentUpdate({
    appointmentId: payment.appointmentId,
    paymentStatus: "FAILED",
    appointmentStatus: "PENDING_PAYMENT",
    note: "Online payment failed",
    paymentReference: payment.paymentReference || payment.paymentNumber
  });

  return {
    handled: true,
    paymentId: String(payment._id),
    paymentNumber: payment.paymentNumber,
    paymentReference: payment.paymentReference,
    status: payment.status
  };
};

const handleStripeWebhook = async ({ rawBody, signature }) => {
  if (!env.stripeWebhookSecret) {
    throw new AppError("STRIPE_WEBHOOK_SECRET is not configured", 500);
  }

  if (!signature) {
    throw new AppError("Missing Stripe signature header", 400);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    throw new AppError(`Stripe webhook signature verification failed: ${error.message}`, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      return await markPaymentSuccessBySessionId(session);
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      return await markPaymentFailedByIntentId(paymentIntent);
    }

    default:
      return {
        handled: true,
        ignored: true,
        eventType: event.type
      };
  }
};

module.exports = {
  getModuleInfo,
  createCheckoutSession,
  handleStripeWebhook
};