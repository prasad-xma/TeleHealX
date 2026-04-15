const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Appointment service is healthy",
    service: "appointment-service"
  });
};

module.exports = {
  getHealthStatus
};