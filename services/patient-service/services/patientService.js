const MedicalRecord = require('../models/MedicalRecord');
const MedicalReport = require('../models/MedicalReport');
const Prescription = require('../models/Prescription');

const getMedicalHistory = async (patientId) => {
    try {
        const records = await MedicalRecord.find({ patientId })
            .populate('doctorId', 'name email specialization')
            .sort({ visitDate: -1 });
        
        return { message: 'Medical history retrieved successfully', data: records };
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

const addPrescription = async (patientId, prescriptionData) => {
    try {
        console.log('Adding prescription for patient:', patientId);
        console.log('Prescription data received:', prescriptionData);
        
        // Validate required fields
        if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
            throw new Error('At least one medication is required');
        }
        
        const prescription = new Prescription({
            patientId: patientId,
            doctorId: prescriptionData.doctorId || undefined, // Use undefined instead of null for optional field
            diagnosis: prescriptionData.diagnosis || '',
            medications: prescriptionData.medications || [],
            instructions: prescriptionData.instructions || 'Follow medication instructions as prescribed',
            prescribedDate: prescriptionData.prescribedDate || new Date(),
            validUntil: prescriptionData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: prescriptionData.isActive !== undefined ? prescriptionData.isActive : true,
            refills: prescriptionData.refills || 0
        });
        
        console.log('Prescription created:', prescription);
        const savedPrescription = await prescription.save();
        console.log('Prescription saved:', savedPrescription);
        return { message: 'Prescription added successfully', data: savedPrescription };
    } catch (error) {
        console.error('Error in addPrescription:', error);
        throw new Error(`Failed to add prescription: ${error.message}`);
    }
};

const getProfile = async (patientId) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(patientId).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return { message: 'Profile retrieved successfully', data: user };
    } catch (error) {
        throw new Error('Failed to retrieve profile');
    }
};

const updateProfile = async (patientId, profileData) => {
    try {
        const User = require('../models/User');
        const updatedUser = await User.findByIdAndUpdate(
            patientId,
            { $set: profileData },
            { new: true }
        );
        
        return { message: 'Profile updated successfully', data: updatedUser };
    } catch (error) {
        throw new Error('Failed to update profile');
    }
};

const addMedicalHistory = async (patientId, medicalData) => {
    try {
        console.log('Adding medical history for patient:', patientId);
        console.log('Medical data received:', medicalData);
        console.log('Medical data type:', typeof medicalData);
        console.log('Is array?', Array.isArray(medicalData));
        
        // Handle both array and object formats
        let recordsToAdd = [];
        if (Array.isArray(medicalData)) {
            recordsToAdd = medicalData;
        } else {
            recordsToAdd = [medicalData];
        }
        
        // Validate required fields for each record
        for (const record of recordsToAdd) {
            if (!record.diagnosis) {
                throw new Error('Diagnosis is required');
            }
            if (!record.treatment) {
                throw new Error('Treatment is required');
            }
        }
        
        const MedicalRecord = require('../models/MedicalRecord');
        const savedRecords = [];
        
        for (const record of recordsToAdd) {
            const medicalRecord = new MedicalRecord({
                patientId: patientId,
                doctorId: record.doctorId || undefined,
                diagnosis: record.diagnosis,
                symptoms: record.symptoms || [],
                treatment: record.treatment,
                notes: record.notes || '',
                visitDate: record.visitDate || new Date(),
                followUpDate: record.followUpDate || null,
                isEmergency: record.isEmergency || false
            });
            
            console.log('Medical record created:', medicalRecord);
            const savedRecord = await medicalRecord.save();
            console.log('Medical record saved:', savedRecord);
            savedRecords.push(savedRecord);
        }
        
        return { message: 'Medical history added successfully', data: savedRecords };
    } catch (error) {
        console.error('Error in addMedicalHistory:', error);
        throw new Error(`Failed to add medical history: ${error.message}`);
    }
};

module.exports = {
    addMedicalHistory,
    getMedicalHistory,
    uploadMedicalReport,
    getMedicalReports,
    deleteMedicalReport,
    addPrescription,
    getPrescriptions,
    getPrescriptionById,
    getProfile,
    updateProfile
};
