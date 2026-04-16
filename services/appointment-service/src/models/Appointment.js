const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    doctorName: {
      type: String,
      trim: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['consultation', 'checkup', 'followup', 'emergency'],
      default: 'consultation'
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      trim: true
    },
    isVideoConsultation: {
      type: Boolean,
      default: false
    },
    meetingRoomName: {
      type: String,
      trim: true,
      default: ''
    },
    meetingCreatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);