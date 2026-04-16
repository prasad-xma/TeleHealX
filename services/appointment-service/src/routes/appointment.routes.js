const express = require("express");
const {
  getAppointmentModuleInfo,
  getMyAppointmentAccessInfo
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAppointmentModuleInfo);

router.get("/me", protect, authorize("PATIENT", "DOCTOR", "ADMIN"), getMyAppointmentAccessInfo);

module.exports = router;