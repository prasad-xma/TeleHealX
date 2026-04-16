const express = require("express");
const {
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
} = require("../controllers/appointment.controller");
const { protect, authorize, protectInternalService } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("patient", "doctor", "admin"), getMyAppointmentAccessInfo);

router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorAppointments);
router.patch("/doctor/:appointmentId/meeting", protect, authorize("doctor"), createMeetingForDoctorAppointment);
router.patch("/doctor/:appointmentId/cancel", protect, authorize("doctor"), cancelDoctorAppointment);
router.patch("/doctor/:appointmentId/complete", protect, authorize("doctor"), completeDoctorAppointment);

router.get("/meeting/access", protect, authorize("patient", "doctor"), getMeetingAccess);

router.get("/patient/doctors", protect, authorize("patient"), getDoctorsForPatient);
router.get("/patient/doctors/:doctorId", protect, authorize("patient"), getDoctorDetailsForPatient);
router.get("/patient/doctors/:doctorId/slots", protect, authorize("patient"), getDoctorSlotsForPatient);

router.get("/patient/me", protect, authorize("patient"), getMyPatientAppointments);
router.get("/patient/me/:appointmentId", protect, authorize("patient"), getPatientAppointmentById);

router.post("/patient/book", protect, authorize("patient"), createAppointmentForPatient);
router.patch("/patient/:appointmentId/cancel", protect, authorize("patient"), cancelPatientAppointment);
router.patch("/patient/:appointmentId/reschedule", protect, authorize("patient"), reschedulePatientAppointment);

router.patch(
  "/internal/:appointmentId/payment-status",
  protectInternalService,
  updateAppointmentPaymentStatusInternal
);

module.exports = router;