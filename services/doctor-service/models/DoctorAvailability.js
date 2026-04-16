const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        weeklySchedule: {
            type: [{
                dayOfWeek: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 6,
                },
                slots: {
                    type: [{
                        startTime: {
                            type: String,
                            required: true,
                        },
                        endTime: {
                            type: String,
                            required: true,
                        },
                        isBooked: {
                            type: Boolean,
                            default: false,
                        },
                        isAvailable: {
                            type: Boolean,
                            default: true,
                        },
                    }],
                    default: [],
                },
            }],
            default: [],
        },
        blockedDates: {
            type: [Date],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
