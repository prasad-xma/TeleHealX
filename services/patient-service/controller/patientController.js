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

        // Validate required fields
        if (!req.body.title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!req.body.description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Validate reportType if provided
        const validReportTypes = ['lab', 'imaging', 'prescription', 'discharge', 'other'];
        const reportType = req.body.reportType || 'other';
        if (!validReportTypes.includes(reportType)) {
            return res.status(400).json({ 
                message: `Invalid reportType. Must be one of: ${validReportTypes.join(', ')}` 
            });
        }

        const reportData = {
            patientId: req.user._id,
            reportType: reportType,
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

const downloadMedicalReport = async (req, res) => {
    try {
        console.log('downloadMedicalReport controller called');
        console.log('Report ID:', req.params.id);
        console.log('User ID:', req.user._id);
        const report = await patientService.downloadMedicalReport(req.params.id, req.user._id);
        console.log('Report found:', report);
        console.log('File path:', report.filePath);
        const fs = require('fs');
        const path = require('path');

        // Determine MIME type based on file extension
        const ext = path.extname(report.fileName).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        console.log('Detected MIME type:', mimeType);

        // Read file and convert to base64
        const fileData = fs.readFileSync(report.filePath);
        console.log('File read successfully, size:', fileData.length);
        const base64Data = fileData.toString('base64');
        console.log('Base64 conversion successful, length:', base64Data.length);

        res.status(200).json({
            fileName: report.fileName,
            fileData: base64Data,
            mimeType: mimeType
        });
        console.log('Response sent successfully');
    } catch (error) {
        console.error('Error in downloadMedicalReport controller:', error);
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
    downloadMedicalReport,
    addPrescription,
    getPrescriptions,
    getPrescriptionById,
    getProfile,
    updateProfile
};
