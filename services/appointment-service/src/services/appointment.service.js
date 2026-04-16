const Appointment = require('../models/Appointment');

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

const getAppointmentsForDoctor = async (doctorId) => {
  const appointments = await Appointment.find({ doctorId })
    .sort({ date: 1, time: 1 })
    .lean();

  return {
    appointments,
    totalAppointments: appointments.length
  };
};

module.exports = {
  getModuleInfo,
  getMyAppointmentAccessInfo,
  getAppointmentsForDoctor
};