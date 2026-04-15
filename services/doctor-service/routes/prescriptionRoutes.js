const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const { protect, verifyDoctor } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, verifyDoctor, prescriptionController.createPrescription);
router.get('/doctor/me', protect, verifyDoctor, prescriptionController.getDoctorPrescriptions);
router.get('/:id', protect, prescriptionController.getPrescriptionById);
router.get('/patient/:patientId', protect, prescriptionController.getPatientPrescriptions);
router.patch('/:id/status', protect, verifyDoctor, prescriptionController.updatePrescriptionStatus);

module.exports = router;
