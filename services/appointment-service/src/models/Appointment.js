const mongoose = require("mongoose");

const appointmentStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true
    },
    note: {
      type: String,
      trim: true,
      default: ""
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      sparse: true,
      index: true
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
      enum: [
        "PENDING",
        "PENDING_PAYMENT",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED"
      ],
      default: "PENDING"
    },
    paymentMode: {
      type: String,
      enum: ["MANUAL", "ONLINE"],
      default: "MANUAL"
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "UNPAID"
    },
    consultationFee: {
      type: Number,
      default: null
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: ""
    },
    cancelledBy: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "SYSTEM", ""],
      default: ""
    },
    rescheduleCount: {
      type: Number,
      default: 0
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
    },
    statusHistory: {
      type: [appointmentStatusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ doctorUserId: 1, date: 1, time: 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ doctorUserId: 1, createdAt: -1 });
appointmentSchema.index({ meetingRoomName: 1 });
appointmentSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);