const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientType: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  type: {
    type: String,
    enum: ['appointment_booked', 'appointment_cancelled', 'consultation_completed', 'prescription_issued', 'payment_confirmed'],
    required: true
  },
  channels: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  email: {
    address: { type: String },
    subject: { type: String },
    body: { type: String },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
    error: { type: String }
  },
  sms: {
    phoneNumber: { type: String },
    message: { type: String },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
    error: { type: String }
  },
  appointmentId: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'email.status': 1 });
notificationSchema.index({ 'sms.status': 1 });

module.exports = mongoose.model('Notification', notificationSchema);
