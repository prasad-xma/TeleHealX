const Stripe = require("stripe");
const env = require("../config/env");

const stripe = new Stripe(env.stripeSecretKey);

const createStripeCheckoutSession = async ({
  paymentNumber,
  appointmentId,
  amount,
  currency
}) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `TeleHealX Appointment Payment (${paymentNumber})`
          },
          unit_amount: Math.round(Number(amount) * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
    cancel_url: `${env.clientUrl}/payment/cancel?appointmentId=${appointmentId}`,
    metadata: {
      paymentNumber,
      appointmentId
    }
  });

  return session;
};

module.exports = {
  createStripeCheckoutSession
};