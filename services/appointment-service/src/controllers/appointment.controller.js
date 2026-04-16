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

const getDoctorsForBooking = asyncHandler(async (req, res) => {
  const result = await appointmentService.getDoctorsForBooking(req.query);

  return sendSuccess(res, result, "Doctors fetched successfully");
});

const getDoctorDetailsForBooking = asyncHandler(async (req, res) => {
  const result = await appointmentService.getDoctorDetailsForBooking(req.params.doctorId);

  return sendSuccess(res, result, "Doctor details fetched successfully");
});

const getDoctorSlots = asyncHandler(async (req, res) => {
  const result = await appointmentService.getDoctorSlots({
    doctorId: req.params.doctorId,
    date: req.query.date
  });

  return sendSuccess(res, result, "Doctor slots fetched successfully");
});

const createAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.createAppointment({
    user: req.user,
    payload: req.body
  });

  return sendSuccess(res, result, "Appointment created successfully", 201);
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getMyAppointments(req.user);

  return sendSuccess(res, result, "Patient appointments fetched successfully");
});

const getDoctorAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getDoctorAppointments(req.user);

  return sendSuccess(res, result, "Doctor appointments fetched successfully");
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointmentById({
    appointmentId: req.params.id,
    user: req.user
  });

  return sendSuccess(res, result, "Appointment fetched successfully");
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.cancelAppointment({
    appointmentId: req.params.id,
    user: req.user,
    payload: req.body
  });

  return sendSuccess(res, result, "Appointment cancelled successfully");
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.rescheduleAppointment({
    appointmentId: req.params.id,
    user: req.user,
    payload: req.body
  });

  return sendSuccess(res, result, "Appointment rescheduled successfully");
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const result = await appointmentService.updateAppointmentStatus({
    appointmentId: req.params.id,
    user: req.user,
    payload: req.body
  });

  return sendSuccess(res, result, "Appointment status updated successfully");
});

const updateAppointmentPaymentStatus = asyncHandler(async (req, res) => {
  const result = await appointmentService.updateAppointmentPaymentStatus({
    appointmentId: req.params.id,
    user: req.user,
    payload: req.body
  });

  return sendSuccess(res, result, "Appointment payment status updated successfully");
});

module.exports = {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getDoctorsForBooking,
  getDoctorDetailsForBooking,
  getDoctorSlots,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  updateAppointmentPaymentStatus
};