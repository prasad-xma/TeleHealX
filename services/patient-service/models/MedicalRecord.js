const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    symptoms: [{
        type: String,
        required: true
    }],
    treatment: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    visitDate: {
        type: Date,
        default: Date.now
    },
    followUpDate: {
        type: Date
    },
    isEmergency: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
