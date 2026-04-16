const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");
const { sendSuccess } = require("../utils/apiResponse");

const getPaymentModuleInfo = asyncHandler(async (req, res) => {
  const result = await paymentService.getModuleInfo();

  return sendSuccess(res, result, "Payment module base route is working");
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { appointmentId, amount, currency, provider } = req.body;

  const result = await paymentService.createCheckoutSession({
    appointmentId,
    amount,
    currency,
    provider
  });

  return sendSuccess(res, result, "Payment checkout session created", 201);
});

const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];

    const result = await paymentService.handleStripeWebhook({
      rawBody: req.body,
      signature
    });

    return res.status(200).json({
      success: true,
      message: "Stripe webhook processed successfully",
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPaymentModuleInfo,
  createCheckoutSession,
  handleStripeWebhook
};