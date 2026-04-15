const getModuleInfo = async () => {
  return {
    module: "appointment-service",
    version: "v1",
    featuresComingNext: [
      "doctor search integration",
      "doctor details integration",
      "slot generation",
      "appointment creation",
      "appointment cancellation",
      "appointment rescheduling",
      "patient appointment listing",
      "doctor appointment listing"
    ]
  };
};

const getMyAppointmentAccessInfo = async (user) => {
  return {
    authenticated: true,
    user
  };
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo
};