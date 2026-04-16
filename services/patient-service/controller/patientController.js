const patientService = require('../services/patientService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and document files are allowed'));
        }
    }
});

const addMedicalHistory = async (req, res) => {
    try {
        const medicalRecord = await patientService.addMedicalHistory(req.user._id, req.body);
        res.status(201).json(medicalRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMedicalHistory = async (req, res) => {
    try {
        const records = await patientService.getMedicalHistory(req.user._id);
        res.status(200).json(records);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const uploadMedicalReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const reportData = {
            patientId: req.user._id,
            reportType: req.body.reportType || 'other',
            title: req.body.title,
            description: req.body.description,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            uploadedBy: req.user._id
        };

        const report = await patientService.uploadMedicalReport(reportData);
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMedicalReports = async (req, res) => {
    try {
        const reports = await patientService.getMedicalReports(req.user._id);
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMedicalReport = async (req, res) => {
    try {
        const report = await patientService.deleteMedicalReport(req.params.id, req.user._id);
        res.status(200).json({ message: 'Report deleted successfully', report });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await patientService.getPrescriptions(req.user._id);
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await patientService.getPrescriptionById(req.user._id, req.params.id);
        res.status(200).json(prescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addPrescription = async (req, res) => {
    try {
        const prescription = await patientService.addPrescription(req.user._id, req.body);
        res.status(201).json(prescription);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await patientService.getProfile(req.user._id);
        res.status(200).json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const result = await patientService.updateProfile(req.user._id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addMedicalHistory,
    getMedicalHistory,
    uploadMedicalReport: [upload.single('medicalReport'), uploadMedicalReport],
    getMedicalReports,
    deleteMedicalReport,
    addPrescription,
    getPrescriptions,
    getPrescriptionById,
    getProfile,
    updateProfile
};
