// Simple test script to verify POST endpoint works
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock medical history data
let medicalHistory = [];

// POST endpoint for adding medical history
app.post('/api/patients/medical-history', (req, res) => {
    console.log('POST request received:', req.body);
    
    const { diagnosis, symptoms, treatment, notes, visitDate, followUpDate, isEmergency } = req.body;
    
    // Basic validation
    if (!diagnosis || !treatment) {
        return res.status(400).json({
            message: 'Diagnosis and treatment are required'
        });
    }
    
    const newRecord = {
        _id: Date.now().toString(),
        patientId: 'test-patient-id',
        diagnosis,
        symptoms: symptoms || [],
        treatment,
        notes: notes || '',
        visitDate: visitDate || new Date(),
        followUpDate: followUpDate || null,
        isEmergency: isEmergency || false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    medicalHistory.push(newRecord);
    
    console.log('Medical record added:', newRecord);
    res.status(201).json({
        message: 'Medical history added successfully',
        data: newRecord
    });
});

// GET endpoint for retrieving medical history
app.get('/api/patients/medical-history', (req, res) => {
    console.log('GET request received');
    res.status(200).json({
        message: 'Medical history retrieved successfully',
        data: medicalHistory
    });
});

const PORT = 5015;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Use these endpoints for testing:');
    console.log('POST: http://localhost:5015/api/patients/medical-history');
    console.log('GET: http://localhost:5015/api/patients/medical-history');
});
