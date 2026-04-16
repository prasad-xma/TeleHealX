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

  return sendSuccess(res, result, "Doctor appointments fetched successfully");
});

const getDoctorsForPatient = asyncHandler(async (req, res) => {
  const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
  const specialty =
    typeof req.query.specialty === "string" ? req.query.specialty.trim() : "";
  const limit = Number(req.query.limit || 10);

  const result = await appointmentService.getDoctorsForPatient({
    name,
    specialty,
    limit
  });

  return sendSuccess(res, result, "Doctors fetched successfully");
});

const getDoctorDetailsForPatient = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const result = await appointmentService.getDoctorDetailsForPatient({ doctorId });

  return sendSuccess(res, result, "Doctor details fetched successfully");
});

const getDoctorSlotsForPatient = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const date = typeof req.query.date === "string" ? req.query.date.trim() : "";

  const result = await appointmentService.getDoctorSlotsForPatient({
    doctorId,
    date
  });

  return sendSuccess(res, result, "Doctor slots fetched successfully");
});

const createAppointmentForPatient = asyncHandler(async (req, res) => {
  const {
    doctorId,
    doctorName,
    date,
    time,
    type,
    notes,
    isVideoConsultation,
    patientName,
    paymentMode,
    consultationFee
  } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "doctorId, date and time are required"
    });
  }

  const result = await appointmentService.createAppointmentForPatient({
    patientId: req.user.userId,
    patientName: patientName || "Patient",
    doctorId,
    doctorName,
    date,
    time,
    type,
    notes,
    isVideoConsultation,
    paymentMode,
    consultationFee
  });

  return sendSuccess(res, result, "Appointment created successfully", 201);
});

const getMyPatientAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointmentsForPatient(req.user.userId);

  return sendSuccess(res, result, "Patient appointments fetched successfully");
});

const getPatientAppointmentById = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const result = await appointmentService.getPatientAppointmentById({
    appointmentId,
    patientId: req.user.userId
  });

  return sendSuccess(res, result, "Patient appointment fetched successfully");
});

const cancelPatientAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

  const result = await appointmentService.cancelPatientAppointment({
    appointmentId,
    patientId: req.user.userId,
    reason
  });

  return sendSuccess(res, result, "Appointment cancelled successfully");
});

const reschedulePatientAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { date, time } = req.body;

  const result = await appointmentService.reschedulePatientAppointment({
    appointmentId,
    patientId: req.user.userId,
    date,
    time
  });

  return sendSuccess(res, result, "Appointment rescheduled successfully");
});

const cancelDoctorAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

  const result = await appointmentService.cancelDoctorAppointment({
    appointmentId,
    doctorId: req.user.userId,
    reason
  });

  return sendSuccess(res, result, "Doctor cancelled appointment successfully");
});

const completeDoctorAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const result = await appointmentService.completeDoctorAppointment({
    appointmentId,
    doctorId: req.user.userId
  });

  return sendSuccess(res, result, "Appointment marked as completed");
});

const updateAppointmentPaymentStatusInternal = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { paymentStatus, appointmentStatus, note, paymentReference } = req.body;

  const result = await appointmentService.updateAppointmentPaymentStatusInternal({
    appointmentId,
    paymentStatus,
    appointmentStatus,
    note,
    paymentReference
  });

  return sendSuccess(res, result, "Appointment payment status updated successfully");
});

const getMeetingAccess = asyncHandler(async (req, res) => {
  const roomName = typeof req.query.roomName === "string" ? req.query.roomName.trim() : "";

  const result = await appointmentService.getMeetingAccessForUser({
    roomName,
    userId: req.user.userId,
    role: req.user.role
  });

  return sendSuccess(res, result, "Meeting access validated successfully");
});

const createMeetingForDoctorAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "appointmentId is required"
    });
  }

  const result = await appointmentService.createMeetingForAppointment({
    appointmentId,
    doctorUserId: req.user.userId
  });

  return sendSuccess(res, result, "Meeting created successfully");
});

module.exports = {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  getDoctorDetailsForPatient,
  getDoctorSlotsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  getPatientAppointmentById,
  cancelPatientAppointment,
  reschedulePatientAppointment,
  cancelDoctorAppointment,
  completeDoctorAppointment,
  updateAppointmentPaymentStatusInternal,
  createMeetingForDoctorAppointment,
  getMeetingAccess
};