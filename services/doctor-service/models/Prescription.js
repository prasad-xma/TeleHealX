const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
    {
        prescriptionNumber: {
            type: String,
            unique: true,
            trim: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        medications: {
            type: [{
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                dosage: {
                    type: String,
                    required: true,
                    trim: true,
                },
                frequency: {
                    type: String,
                    required: true,
                    trim: true,
                },
                duration: {
                    type: String,
                    required: true,
                    trim: true,
                },
                instructions: {
                    type: String,
                    trim: true,
                },
            }],
            required: true,
        },
        diagnosis: {
            type: String,
            required: true,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['active', 'expired'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique prescription number before saving
prescriptionSchema.pre('save', async function(next) {
    if (!this.prescriptionNumber) {
        const Prescription = mongoose.model('Prescription');
        const count = await Prescription.countDocuments();
        const year = new Date().getFullYear();
        this.prescriptionNumber = `RX${year}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
