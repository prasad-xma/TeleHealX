const express = require('express');
const router = express.Router();
const { patientAuth } = require('../middleware/auth');
const {
    getMedicalHistory,
    uploadMedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    getPrescriptions,
    getPrescriptionById,
    updateProfile
} = require('../controller/patientController');

// Apply patient authentication to all routes
router.use(patientAuth);

// Medical History
router.get('/medical-history', getMedicalHistory);

// Medical Reports
router.post('/reports', uploadMedicalReport);
router.get('/reports', getMedicalReports);
router.delete('/reports/:id', deleteMedicalReport);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);

// Profile Management
router.put('/profile', updateProfile);

module.exports = router;
