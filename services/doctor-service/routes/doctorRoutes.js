const express = require('express');
const doctorController = require('../controller/doctorController');
const { protect, verifyDoctor } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', doctorController.getAllDoctors);
router.get('/:doctorId', doctorController.getDoctorById);
router.get('/me/profile', protect, verifyDoctor, doctorController.getDoctorProfile);
router.put('/me/profile', protect, verifyDoctor, doctorController.updateDoctorProfile);
router.post('/me/profile', protect, verifyDoctor, doctorController.createDoctorProfile);
router.get('/me/patients/:patientId/reports', protect, verifyDoctor, doctorController.getPatientReports);

module.exports = router;
