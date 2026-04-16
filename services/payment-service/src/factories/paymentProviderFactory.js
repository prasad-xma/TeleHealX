const stripeProvider = require("../providers/stripe.provider");

const getPaymentProvider = (providerName) => {
  switch (providerName) {
    case "STRIPE":
      return stripeProvider;

    default:
      throw new Error(`Unsupported payment provider: ${providerName}`);
  }
};

module.exports = {
  getPaymentProvider
};