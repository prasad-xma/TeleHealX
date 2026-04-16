const express = require("express");
const {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  getAppointmentById,
  getAppointmentByRoomName,
  updateMeetingRoomForAppointment
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("patient", "doctor", "admin"), getMyAppointmentAccessInfo);

router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorAppointments);

router.get('/:appointmentId', protect, authorize('patient', 'doctor', 'admin'), getAppointmentById);

router.get('/meeting/room/:roomName', protect, authorize('patient', 'doctor'), getAppointmentByRoomName);

router.patch('/:appointmentId/meeting-room', protect, authorize('doctor'), updateMeetingRoomForAppointment);

router.get('/patient/doctors', protect, authorize('patient'), getDoctorsForPatient);

router.get('/patient/me', protect, authorize('patient'), getMyPatientAppointments);

router.post('/patient/book', protect, authorize('patient'), createAppointmentForPatient);

module.exports = router;