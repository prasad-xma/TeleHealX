const mongoose = require("mongoose");

const generateAppointmentNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APT-${timestamp}-${random}`;
};

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true
      index: true,
      trim: true
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
      required: true,
      trim: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["consultation", "checkup", "followup", "emergency"],
      default: "consultation"
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled"
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    isVideoConsultation: {
      type: Boolean,
      default: false
    },
    meetingRoomName: {
      type: String,
      trim: true,
      default: ""
    },
    meetingCreatedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate appointment number before validation/save
appointmentSchema.pre("validate", function (next) {
  if (!this.appointmentNumber) {
    this.appointmentNumber = generateAppointmentNumber();
  }
  next();
});

// Useful indexes for common queries
appointmentSchema.index({ doctorUserId: 1, date: 1, time: 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ doctorUserId: 1, createdAt: -1 });
appointmentSchema.index({ meetingRoomName: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);