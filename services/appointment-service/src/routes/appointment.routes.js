const express = require("express");
const {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments,
  getDoctorsForPatient,
  createAppointmentForPatient,
  getMyPatientAppointments,
  createMeetingForDoctorAppointment,
  getMeetingAccess,
  completeConsultation
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Add route logging middleware for appointment service
router.use((req, res, next) => {
  console.log(`🏥 [APPOINTMENT ROUTES] ${req.method} ${req.url}`);
  console.log(`🏥 [APPOINTMENT ROUTES] User:`, req.user ? { id: req.user.userId, role: req.user.role } : 'No user');
  next();
});

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("patient", "doctor", "admin"), getMyAppointmentAccessInfo);

router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorAppointments);

router.patch('/doctor/:appointmentId/meeting', protect, authorize('doctor'), createMeetingForDoctorAppointment);

router.patch('/doctor/:appointmentId/complete', protect, authorize('doctor'), completeConsultation);

router.get('/meeting/access', protect, authorize('patient', 'doctor'), getMeetingAccess);

router.get('/patient/doctors', protect, authorize('patient'), getDoctorsForPatient);

router.get('/patient/me', protect, authorize('patient'), getMyPatientAppointments);

router.post('/patient/book', protect, authorize('patient'), createAppointmentForPatient);

module.exports = router;