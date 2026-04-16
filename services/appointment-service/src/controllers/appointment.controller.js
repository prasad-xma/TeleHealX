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

const getDoctorsForPatient = asyncHandler(async (req, res) => {
  const { name = '', limit = 5 } = req.query;
  const result = await appointmentService.getDoctorsForPatient({ name, limit });

  return sendSuccess(res, result, 'Doctors fetched successfully');
});

const createAppointmentForPatient = asyncHandler(async (req, res) => {
  const { doctorId, doctorName, date, time, type, notes, isVideoConsultation, patientName } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'doctorId, date and time are required'
    });
  }

  const result = await appointmentService.createAppointmentForPatient({
    patientId: req.user.userId,
    patientName: patientName || 'Patient',
    doctorId,
    doctorName,
    date,
    time,
    type,
    notes,
    isVideoConsultation
  });

  return sendSuccess(res, result, 'Appointment created successfully', 201);
});

const getMyPatientAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointmentsForPatient(req.user.userId);

  return sendSuccess(res, result, 'Patient appointments fetched successfully');
});

const getMeetingAccess = asyncHandler(async (req, res) => {
  const { roomName = '' } = req.query;

  const result = await appointmentService.getMeetingAccessForUser({
    roomName,
    userId: req.user.userId,
    role: req.user.role
  });

  return sendSuccess(res, result, 'Meeting access validated successfully');
});

const createMeetingForDoctorAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: 'appointmentId is required'
    });
  }

  const result = await appointmentService.createMeetingForAppointment({
    appointmentId,
    doctorUserId: req.user.userId
  });

  return sendSuccess(res, result, 'Meeting created successfully');
});

module.exports = {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  createMeetingForDoctorAppointment,
  getMeetingAccess
};