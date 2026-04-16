const mongoose = require('mongoose');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

// MongoDB connection
mongoose.connect(process.env.MONGODB || 'mongodb://localhost:27017/medicaltelehealx', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const addMedicalHistory = async () => {
    try {
        console.log('Connecting to database...');
        
        // Find a patient user
        const patient = await User.findOne({ role: 'patient' });
        if (!patient) {
            console.log('No patient found. Please create a patient user first.');
            return;
        }
        
        // Find a doctor user
        const doctor = await User.findOne({ role: 'doctor' });
        if (!doctor) {
            console.log('No doctor found. Please create a doctor user first.');
            return;
        }
        
        console.log('Found patient:', patient.email);
        console.log('Found doctor:', doctor.email);
        
        // Add sample medical history records
        const medicalRecords = [
            {
                patientId: patient._id,
                doctorId: doctor._id,
                diagnosis: 'Hypertension',
                symptoms: ['Headache', 'Dizziness', 'Chest pain'],
                treatment: 'Prescribed ACE inhibitors and lifestyle modifications',
                notes: 'Patient advised to reduce sodium intake and exercise regularly',
                visitDate: new Date('2024-01-15'),
                followUpDate: new Date('2024-02-15'),
                isEmergency: false
            },
            {
                patientId: patient._id,
                doctorId: doctor._id,
                diagnosis: 'Type 2 Diabetes',
                symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
                treatment: 'Metformin 500mg twice daily, dietary changes',
                notes: 'Blood sugar monitoring required twice daily',
                visitDate: new Date('2024-02-20'),
                followUpDate: new Date('2024-03-20'),
                isEmergency: false
            },
            {
                patientId: patient._id,
                doctorId: doctor._id,
                diagnosis: 'Upper Respiratory Infection',
                symptoms: ['Fever', 'Cough', 'Sore throat'],
                treatment: 'Antibiotics and rest',
                notes: 'Patient responded well to treatment',
                visitDate: new Date('2024-03-10'),
                followUpDate: new Date('2024-03-17'),
                isEmergency: true
            }
        ];
        
        // Clear existing medical records for this patient
        await MedicalRecord.deleteMany({ patientId: patient._id });
        console.log('Cleared existing medical records');
        
        // Insert new medical records
        const insertedRecords = await MedicalRecord.insertMany(medicalRecords);
        console.log(`Added ${insertedRecords.length} medical history records`);
        
        console.log('Medical history data added successfully!');
        
    } catch (error) {
        console.error('Error adding medical history:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
};

// Load environment variables
require('dotenv').config();

// Run the script
addMedicalHistory();
