const Stripe = require("stripe");
const env = require("../config/env");

const stripe = new Stripe(env.stripeSecretKey);

const createCheckoutSession = async ({ amount, currency, metadata }) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: "Doctor Appointment Payment"
          },
          unit_amount: amount * 100
        },
        quantity: 1
      }
    ],
    metadata,
    success_url: `${env.clientUrl}/payments/success`,
    cancel_url: `${env.clientUrl}/payments/fail`
  });

  return session;
};

module.exports = {
  createCheckoutSession
};