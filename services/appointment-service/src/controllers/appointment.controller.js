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
  const limit = Number(req.query.limit || 10);

  const result = await appointmentService.getDoctorsForPatient({ name, limit });

  return sendSuccess(res, result, "Doctors fetched successfully");
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
    patientName
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
    isVideoConsultation
  });

  return sendSuccess(res, result, "Appointment created successfully", 201);
});

const getMyPatientAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointmentsForPatient(req.user.userId);

  return sendSuccess(res, result, "Patient appointments fetched successfully");
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const result = await appointmentService.getAppointmentById(appointmentId);

  return sendSuccess(res, result, 'Appointment fetched successfully');
});

const getAppointmentByRoomName = asyncHandler(async (req, res) => {
  const { roomName = '' } = req.params;
  const result = await appointmentService.getAppointmentByRoomName(roomName);

  return sendSuccess(res, result, 'Appointment fetched successfully');
});

const updateMeetingRoomForAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { meetingRoomName } = req.body;

  if (!appointmentId || !meetingRoomName) {
    return res.status(400).json({
      success: false,
      message: 'appointmentId and meetingRoomName are required'
    });
  }

  const result = await appointmentService.updateMeetingRoomForAppointment({
    appointmentId,
    meetingRoomName
  });

  return sendSuccess(res, result, 'Meeting room updated successfully');
});

module.exports = {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  getAppointmentById,
  getAppointmentByRoomName,
  updateMeetingRoomForAppointment
};