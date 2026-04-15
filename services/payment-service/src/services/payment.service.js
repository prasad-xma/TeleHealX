const { getPaymentProvider } = require("../factories/paymentProviderFactory");

const createPaymentSession = async (data) => {
  const provider = getPaymentProvider("STRIPE");

  const session = await provider.createCheckoutSession({
    amount: data.amount,
    currency: "usd",
    metadata: {
      appointmentId: data.appointmentId,
      patientId: data.patientId
    }
  });

  return session;
};

module.exports = {
  createPaymentSession
};