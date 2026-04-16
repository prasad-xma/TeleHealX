const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        specialization: {
            type: String,
            required: true,
            trim: true,
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        hospital: {
            type: String,
            required: true,
            trim: true,
        },
        yearsOfExperience: {
            type: Number,
            required: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
            trim: true,
        },
        consultationFee: {
            type: Number,
            required: true,
        },
        languages: {
            type: [String],
            default: [],
        },
        ratings: {
            type: [{
                patientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                score: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                review: {
                    type: String,
                    trim: true,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
            }],
            default: [],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

doctorProfileSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return 0;
    const total = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
    return (total / this.ratings.length).toFixed(1);
});

doctorProfileSchema.set('toJSON', { virtuals: true });
doctorProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
