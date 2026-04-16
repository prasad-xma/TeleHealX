const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    diagnosis: {
        type: String,
        required: true
    },
    medications: [{
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        instructions: {
            type: String
        }
    }],
    instructions: {
        type: String,
        required: true
    },
    prescribedDate: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    refills: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
