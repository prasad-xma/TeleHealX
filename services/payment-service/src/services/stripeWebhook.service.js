const Payment = require("../models/payment.model");
const axios = require("axios");
const env = require("../config/env");

const updateAppointmentPaymentStatus = async ({
  appointmentId,
  paymentStatus,
  paymentReferenceId,
  note
}) => {
  try {
    await axios.patch(
      `${env.appointmentServiceUrl}/api/appointments/${appointmentId}/payment-status`,
      {
        paymentStatus,
        paymentReferenceId,
        note
      },
      {
        headers: {
          "x-internal-service-secret": env.internalServiceSecret
        }
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to notify Appointment Service:",
      error.response?.data || error.message
    );
  }
};

const handleCheckoutSessionCompleted = async (session) => {
  const payment = await Payment.findOne({
    stripeSessionId: session.id
  });

  if (!payment) {
    console.warn("⚠️ Payment not found for checkout.session.completed:", session.id);
    return;
  }

  payment.status = "SUCCESS";
  payment.stripePaymentIntentId = session.payment_intent || payment.stripePaymentIntentId;
  payment.paidAt = new Date();

  await payment.save();

  await updateAppointmentPaymentStatus({
    appointmentId: payment.appointmentId,
    paymentStatus: "PAID",
    paymentReferenceId: payment.paymentReference,
    note: "Stripe payment completed successfully"
  });
};

const handlePaymentIntentFailed = async (intent) => {
  const payment = await Payment.findOne({
    stripePaymentIntentId: intent.id
  });

  if (!payment) {
    console.warn("⚠️ Payment not found for payment_intent.payment_failed:", intent.id);
    return;
  }

  payment.status = "FAILED";
  payment.failureReason = intent.last_payment_error?.message || "Payment failed";

  await payment.save();

  await updateAppointmentPaymentStatus({
    appointmentId: payment.appointmentId,
    paymentStatus: "FAILED",
    paymentReferenceId: payment.paymentReference,
    note: payment.failureReason
  });
};

const handleStripeEvent = async (event) => {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    default:
      console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
      break;
  }
};

module.exports = {
  handleStripeEvent
};