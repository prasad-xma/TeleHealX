const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Payment service is healthy",
    service: "payment-service"
  });
};

module.exports = {
  getHealthStatus
};