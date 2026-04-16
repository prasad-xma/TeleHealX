const express = require('express');
const router = express.Router();
const { patientAuth } = require('../middleware/auth');
const {
    getMedicalHistory,
    addMedicalHistory,
    uploadMedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    downloadMedicalReport,
    addPrescription,
    getPrescriptions,
    getPrescriptionById,
    getProfile,
    updateProfile
} = require('../controller/patientController');

// Apply patient authentication to all routes
router.use(patientAuth);

// Medical History
router.post('/medical-history', addMedicalHistory);
router.get('/medical-history', getMedicalHistory);

// Medical Reports
router.post('/reports', uploadMedicalReport);
router.get('/reports', getMedicalReports);
router.get('/reports/:id', downloadMedicalReport);
router.delete('/reports/:id', deleteMedicalReport);

// Prescriptions
router.post('/prescriptions', addPrescription);
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
