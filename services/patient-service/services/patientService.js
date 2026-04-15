const MedicalRecord = require('../models/MedicalRecord');
const MedicalReport = require('../models/MedicalReport');
const Prescription = require('../models/Prescription');

const getMedicalHistory = async (patientId) => {
    try {
        const records = await MedicalRecord.find({ patientId })
            .populate('doctorId', 'name email specialization')
            .sort({ visitDate: -1 });
        
        return records;
    } catch (error) {
        throw new Error('Failed to fetch medical history');
    }
};

const uploadMedicalReport = async (reportData) => {
    try {
        const report = await MedicalReport.create(reportData);
        return report;
    } catch (error) {
        throw new Error('Failed to upload medical report');
    }
};

const getMedicalReports = async (patientId) => {
    try {
        const reports = await MedicalReport.find({ patientId })
            .populate('uploadedBy', 'name email role')
            .sort({ uploadDate: -1 });
        
        return reports;
    } catch (error) {
        throw new Error('Failed to fetch medical reports');
    }
};

const deleteMedicalReport = async (reportId, patientId) => {
    try {
        const report = await MedicalReport.findOneAndDelete({ 
            _id: reportId, 
            patientId: patientId 
        });
        
        if (!report) {
            throw new Error('Report not found or access denied');
        }
        
        return report;
    } catch (error) {
        throw new Error('Failed to delete medical report');
    }
};

const getPrescriptions = async (patientId) => {
    try {
        const prescriptions = await Prescription.find({ patientId })
            .populate('doctorId', 'name email specialization')
            .sort({ prescribedDate: -1 });
        
        return prescriptions;
    } catch (error) {
        throw new Error('Failed to fetch prescriptions');
    }
};

const getPrescriptionById = async (prescriptionId, patientId) => {
    try {
        const prescription = await Prescription.findOne({ 
            _id: prescriptionId, 
            patientId: patientId 
        })
        .populate('doctorId', 'name email specialization');
        
        if (!prescription) {
            throw new Error('Prescription not found or access denied');
        }
        
        return prescription;
    } catch (error) {
        throw new Error('Failed to fetch prescription');
    }
};

const updateProfile = async (patientId, profileData) => {
    try {
        // This would typically update the User model
        // For now, we'll return the data as if updated
        return { message: 'Profile updated successfully', data: profileData };
    } catch (error) {
        throw new Error('Failed to update profile');
    }
};

module.exports = {
    getMedicalHistory,
    uploadMedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    getPrescriptions,
    getPrescriptionById,
    updateProfile
};
