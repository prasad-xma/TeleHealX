const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/appError");

const createPayment = asyncHandler(async (req, res) => {
  const { amount, appointmentId } = req.body;

  // 🔥 FIX: Support multiple token formats
  const patientId =
    req.user?.userId ||
    req.user?.id ||
    req.user?._id ||
    req.user?.sub;

  if (!patientId) {
    throw new AppError("Patient ID not found in token", 401);
  }

  if (!amount || !appointmentId) {
    throw new AppError("amount and appointmentId are required", 400);
  }

  const result = await paymentService.createPaymentSession({
    amount,
    appointmentId,
    patientId
  });

  return sendSuccess(res, result, "Payment session created");
});

module.exports = {
  createPayment
};