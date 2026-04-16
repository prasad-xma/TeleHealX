const mongoose = require("mongoose");
const {
  APPOINTMENT_STATUS,
  PAYMENT_MODE,
  PAYMENT_STATUS
} = require("../utils/constants");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ""
    },
    changedBy: {
      userId: { type: String, default: null },
      role: { type: String, default: null }
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const doctorSnapshotSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, required: true },
    profileImage: { type: String, default: "" },
    profileSummary: { type: String, default: "" }
  },
  { _id: false }
);

const patientSnapshotSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    patientId: {
      type: String,
      required: true,
      index: true
    },
    doctorId: {
      type: String,
      required: true,
      index: true
    },
    doctorSnapshot: {
      type: doctorSnapshotSchema,
      required: true
    },
    patientSnapshot: {
      type: patientSnapshotSchema,
      required: true
    },
    appointmentDate: {
      type: String,
      required: true,
      index: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    appointmentStart: {
      type: Date,
      required: true,
      index: true
    },
    appointmentEnd: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: "Asia/Colombo"
    },
    slotDurationMinutes: {
      type: Number,
      required: true
    },
    bookingReason: {
      type: String,
      default: ""
    },
    paymentMode: {
      type: String,
      enum: Object.values(PAYMENT_MODE),
      required: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    appointmentStatus: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      required: true
    },
    paymentReferenceId: {
      type: String,
      default: null
    },
    rescheduleCount: {
      type: Number,
      default: 0
    },
    cancellationReason: {
      type: String,
      default: ""
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);