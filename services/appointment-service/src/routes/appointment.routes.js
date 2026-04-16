const express = require("express");
const {
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
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);
router.get("/me/access", protect, authorize("PATIENT", "DOCTOR", "ADMIN"), getMyAppointmentAccessInfo);

router.get("/doctors", protect, authorize("PATIENT", "ADMIN"), getDoctorsForBooking);
router.get("/doctors/:doctorId", protect, authorize("PATIENT", "ADMIN"), getDoctorDetailsForBooking);
router.get("/doctors/:doctorId/slots", protect, authorize("PATIENT", "ADMIN"), getDoctorSlots);

router.post("/", protect, authorize("PATIENT", "ADMIN"), createAppointment);
router.get("/me", protect, authorize("PATIENT", "ADMIN"), getMyAppointments);
router.get("/doctor/me", protect, authorize("DOCTOR", "ADMIN"), getDoctorAppointments);
router.get("/:id", protect, authorize("PATIENT", "DOCTOR", "ADMIN"), getAppointmentById);

router.patch("/:id/cancel", protect, authorize("PATIENT", "DOCTOR", "ADMIN"), cancelAppointment);
router.patch("/:id/reschedule", protect, authorize("PATIENT", "ADMIN"), rescheduleAppointment);
router.patch("/:id/status", protect, authorize("DOCTOR", "ADMIN"), updateAppointmentStatus);
router.patch("/:id/payment-status", protect, authorize("ADMIN", "DOCTOR", "PATIENT"), updateAppointmentPaymentStatus);

module.exports = router;