const asyncHandler = require("../middlewares/asyncHandler");
const appointmentService = require("../services/appointment.service");
const { sendSuccess } = require("../utils/apiResponse");

const getAppointmentModuleInfo = asyncHandler(async (req, res) => {
  const result = await appointmentService.getModuleInfo();

  return sendSuccess(res, result, "Appointment module base route is working");
});

const getMyAppointmentAccessInfo = asyncHandler(async (req, res) => {
  const result = await appointmentService.getMyAppointmentAccessInfo(req.user);

  return sendSuccess(res, result, "Protected appointment route is working");
});

const getMyDoctorAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointmentsForDoctor(req.user.userId);

  return sendSuccess(res, result, 'Doctor appointments fetched successfully');
});

module.exports = {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments
};