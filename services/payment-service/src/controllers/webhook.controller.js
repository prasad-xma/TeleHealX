const Stripe = require("stripe");
const env = require("../config/env");
const { handleStripeEvent } = require("../services/stripeWebhook.service");

const stripe = new Stripe(env.stripeSecretKey);

const handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("❌ Missing Stripe signature header");

    return res.status(400).json({
      success: false,
      message: "Missing Stripe signature header"
    });
  }

  if (!env.stripeWebhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is missing in .env");

    return res.status(500).json({
      success: false,
      message: "Webhook secret is not configured"
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed");
    console.error("Reason:", error.message);
    console.error("Webhook secret in env starts with:", String(env.stripeWebhookSecret).slice(0, 10));

    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`
    });
  }

  try {
    console.log(`✅ Stripe webhook verified: ${event.type}`);

    await handleStripeEvent(event);

    return res.status(200).json({
      success: true,
      message: "Webhook received successfully"
    });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed"
    });
  }
};

module.exports = {
  handleWebhook
};