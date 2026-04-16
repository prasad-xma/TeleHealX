const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    }

    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+12603682484';
  }

  async sendSMS(to, message) {
    try {
      const messageResponse = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to)
      });

      logger.info(`SMS sent successfully to ${to}. SID: ${messageResponse.sid}`);
      return { success: true, sid: messageResponse.sid };
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If the number doesn't start with country code, add Sri Lanka's country code (+94)
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return `+94${cleaned}`;
    }

    // If it starts with 0, replace with +94
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `+94${cleaned.substring(1)}`;
    }

    // If it already has country code format
    if (cleaned.startsWith('94') && cleaned.length === 11) {
      return `+${cleaned}`;
    }

    // Return as-is if it already has + sign
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }

    // Default fallback
    return phoneNumber;
  }

  validatePhoneNumber(phoneNumber) {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(this.formatPhoneNumber(phoneNumber));
  }

  // Send appointment booking confirmation SMS
  async sendAppointmentBookingSMS(to, data) {
    const message = `TeleHealX: Appointment confirmed with Dr. ${data.doctorName} on ${data.date} at ${data.time}. Join consultation 5 mins early.`;
    return this.sendSMS(to, message);
  }

  // Send consultation completion SMS
  async sendConsultationCompletedSMS(to, data) {
    const message = `TeleHealX: Your consultation with Dr. ${data.doctorName} is completed. ${data.prescriptionIssued ? 'Prescription available in your account.' : ''} Thank you for using TeleHealX.`;
    return this.sendSMS(to, message);
  }
}

module.exports = new SMSService();
