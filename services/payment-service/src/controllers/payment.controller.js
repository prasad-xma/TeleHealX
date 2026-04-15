const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");
const { sendSuccess } = require("../utils/apiResponse");

const createPayment = asyncHandler(async (req, res) => {
  const { amount, appointmentId } = req.body;

  const session = await paymentService.createPaymentSession({
    amount,
    appointmentId,
    patientId: req.user?.userId
  });

  return sendSuccess(res, session, "Payment session created");
});

module.exports = {
  createPayment
};