const express = require("express");
const {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo,
  getMyDoctorAppointments
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("patient", "doctor", "admin"), getMyAppointmentAccessInfo);

router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorAppointments);

module.exports = router;