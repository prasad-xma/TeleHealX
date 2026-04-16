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
    this.verifiedToNumber = process.env.TWILIO_VERIFIED_TO_NUMBER || '';
    this.forceVerifiedOnly = process.env.SMS_FORCE_VERIFIED_ONLY === 'true';
  }

  getSmsDestination(to) {
    const formattedOriginal = this.formatPhoneNumber(String(to || ''));

    if (this.forceVerifiedOnly && this.verifiedToNumber) {
      const formattedVerified = this.formatPhoneNumber(this.verifiedToNumber);
      logger.info(`SMS free-tier mode active. Routing SMS to verified number ${formattedVerified} instead of ${formattedOriginal}`);
      return formattedVerified;
    }

    return formattedOriginal;
  }

  async sendSMS(to, message) {
    const destination = this.getSmsDestination(to);

    try {
      const messageResponse = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: destination
      });

      logger.info(`SMS sent successfully to ${destination}. SID: ${messageResponse.sid}`);
      return { success: true, sid: messageResponse.sid };
    } catch (error) {
      const twilioCode = Number(error.code || 0);
      const formattedVerified = this.verifiedToNumber
        ? this.formatPhoneNumber(this.verifiedToNumber)
        : '';

      // Twilio trial accounts fail with 21608 for unverified recipient numbers.
      // Retry once to the verified number when available.
      if (
        twilioCode === 21608 &&
        formattedVerified &&
        destination !== formattedVerified
      ) {
        try {
          logger.warn(`SMS destination ${destination} is unverified. Retrying with verified number ${formattedVerified}.`);

          const retryResponse = await this.client.messages.create({
            body: message,
            from: this.fromNumber,
            to: formattedVerified
          });

          logger.info(`SMS retry sent successfully to ${formattedVerified}. SID: ${retryResponse.sid}`);
          return { success: true, sid: retryResponse.sid };
        } catch (retryError) {
          logger.error('SMS retry to verified number failed:', retryError);
          return { success: false, error: retryError.message };
        }
      }

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
