const express = require("express");
const {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  getDoctorDetailsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  createMeetingForDoctorAppointment,
  getMeetingAccess
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("patient", "doctor", "admin"), getMyAppointmentAccessInfo);

router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorAppointments);

router.patch("/doctor/:appointmentId/meeting", protect, authorize("doctor"), createMeetingForDoctorAppointment);

router.get("/meeting/access", protect, authorize("patient", "doctor"), getMeetingAccess);

router.get("/patient/doctors", protect, authorize("patient"), getDoctorsForPatient);
router.get("/patient/doctors/:doctorId", protect, authorize("patient"), getDoctorDetailsForPatient);

router.get("/patient/me", protect, authorize("patient"), getMyPatientAppointments);

router.post("/patient/book", protect, authorize("patient"), createAppointmentForPatient);

module.exports = router;