const emailService = require('./emailService');
const smsService = require('./smsService');
const notificationTemplates = require('./notificationTemplates');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // Send appointment booking notifications to both patient and doctor
  async sendAppointmentBookingNotifications(appointmentData, patientData, doctorData) {
    console.log('📧 [NOTIFICATION SERVICE] Starting appointment booking notifications');
    console.log('📧 [NOTIFICATION SERVICE] Appointment data:', appointmentData);
    console.log('📧 [NOTIFICATION SERVICE] Patient data:', patientData);
    console.log('📧 [NOTIFICATION SERVICE] Doctor data:', doctorData);

    try {
      const notifications = [];

      // Prepare patient notification data
      const patientNotificationData = {
        patientName: patientData.name,
        doctorName: doctorData.name,
        specialization: doctorData.specialization,
        date: appointmentData.date,
        time: appointmentData.time,
        appointmentId: appointmentData._id,
        consultationLink: appointmentData.consultationLink
      };

      const patientPhone = String(patientData.phone || '').trim();
      const doctorPhone = String(doctorData.phone || '').trim();

      console.log('📧 [NOTIFICATION SERVICE] Sending email to patient...');
      // Send email to patient
      if (patientData.email) {
        const patientEmailResult = await this.emailService.sendAppointmentBookingEmail(
          patientData.email,
          patientNotificationData
        );
        notifications.push({
          type: 'email',
          recipient: 'patient',
          recipientEmail: patientData.email,
          success: patientEmailResult.success,
          error: patientEmailResult.error
        });
        console.log('📧 [NOTIFICATION SERVICE] Patient email result:', patientEmailResult);
      }

      console.log('📱 [NOTIFICATION SERVICE] Sending SMS to patient...');
      // Send SMS only to the registered patient number.
      // The free Twilio account is limited to a single verified recipient, so
      // we avoid sending appointment-booking SMS to the doctor here.
      if (patientPhone) {
        const patientSmsResult = await this.smsService.sendAppointmentBookingSMS(
          patientPhone,
          patientNotificationData
        );
        notifications.push({
          type: 'sms',
          recipient: 'patient',
          recipientPhone: patientPhone,
          success: patientSmsResult.success,
          error: patientSmsResult.error
        });
        console.log('📱 [NOTIFICATION SERVICE] Patient SMS result:', patientSmsResult);
      } else {
        console.log('📱 [NOTIFICATION SERVICE] Skipping patient SMS because no registered phone number was provided');
      }

      console.log('📧 [NOTIFICATION SERVICE] Sending email to doctor...');
      // Send email to doctor
      if (doctorData.email) {
        const doctorEmailResult = await this.emailService.sendAppointmentBookingEmail(
          doctorData.email,
          patientNotificationData
        );
        notifications.push({
          type: 'email',
          recipient: 'doctor',
          recipientEmail: doctorData.email,
          success: doctorEmailResult.success,
          error: doctorEmailResult.error
        });
        console.log('📧 [NOTIFICATION SERVICE] Doctor email result:', doctorEmailResult);
      }

      if (doctorPhone) {
        console.log('📱 [NOTIFICATION SERVICE] Doctor SMS skipped for booking notifications (free-tier single-recipient mode)');
      }

      console.log('✅ [NOTIFICATION SERVICE] Appointment booking notifications completed');
      logger.info('Appointment booking notifications sent', {
        appointmentId: appointmentData._id,
        notifications: notifications.length
      });

      return {
        success: true,
        notifications,
        appointmentId: appointmentData._id
      };

    } catch (error) {
      console.error('❌ [NOTIFICATION SERVICE] Error sending appointment booking notifications:', error);
      return {
        success: false,
        error: error.message,
        appointmentId: appointmentData._id
      };
    }
  }

  async sendAppointmentAcceptedNotifications(appointmentData, patientData, doctorData) {
    console.log('[NOTIFICATION SERVICE] Starting appointment accepted notifications');

    try {
      const notifications = [];

      const acceptedNotificationData = {
        patientName: patientData.name,
        doctorName: doctorData.name,
        specialization: doctorData.specialization,
        date: appointmentData.date,
        time: appointmentData.time,
        appointmentId: appointmentData._id
      };

      const patientPhone = String(patientData.phone || '').trim();

      if (patientData.email) {
        const template = notificationTemplates.getAppointmentAcceptedTemplate(acceptedNotificationData);
        const patientEmailResult = await this.emailService.sendEmail(
          patientData.email,
          template.email.subject,
          template.email.html,
          template.email.text
        );

        notifications.push({
          type: 'email',
          recipient: 'patient',
          recipientEmail: patientData.email,
          success: patientEmailResult.success,
          error: patientEmailResult.error
        });
      }

      if (patientPhone) {
        const template = notificationTemplates.getAppointmentAcceptedTemplate(acceptedNotificationData);
        const patientSmsResult = await this.smsService.sendSMS(patientPhone, template.sms);

        notifications.push({
          type: 'sms',
          recipient: 'patient',
          recipientPhone: patientPhone,
          success: patientSmsResult.success,
          error: patientSmsResult.error
        });
      }

      logger.info('Appointment accepted notifications sent', {
        appointmentId: appointmentData._id,
        notifications: notifications.length
      });

      return {
        success: true,
        notifications,
        appointmentId: appointmentData._id
      };
    } catch (error) {
      logger.error('Failed to send appointment accepted notifications:', error);
      return {
        success: false,
        error: error.message,
        appointmentId: appointmentData._id
      };
    }
  }

  // Send consultation completion notifications to both patient and doctor
  async sendConsultationCompletedNotifications(appointmentData, patientData, doctorData, prescriptionIssued = false) {
    try {
      const notifications = [];

      // Prepare consultation completion data
      const completionData = {
        patientName: patientData.name,
        doctorName: doctorData.name,
        date: appointmentData.date,
        duration: appointmentData.duration || '30 minutes',
        appointmentId: appointmentData._id,
        prescriptionIssued,
        recordsLink: appointmentData.recordsLink
      };

      // Send email to patient
      if (patientData.email) {
        const patientEmailResult = await this.emailService.sendConsultationCompletedEmail(
          patientData.email,
          completionData
        );
        notifications.push({
          type: 'email',
          recipient: 'patient',
          recipientEmail: patientData.email,
          success: patientEmailResult.success,
          error: patientEmailResult.error
        });
      }

      // Send SMS to patient
      if (patientData.phone) {
        const patientSmsResult = await this.smsService.sendConsultationCompletedSMS(
          patientData.phone,
          completionData
        );
        notifications.push({
          type: 'sms',
          recipient: 'patient',
          recipientPhone: patientData.phone,
          success: patientSmsResult.success,
          error: patientSmsResult.error
        });
      }

      // Send email to doctor
      if (doctorData.email) {
        const doctorEmailResult = await this.emailService.sendConsultationCompletedEmail(
          doctorData.email,
          completionData
        );
        notifications.push({
          type: 'email',
          recipient: 'doctor',
          recipientEmail: doctorData.email,
          success: doctorEmailResult.success,
          error: doctorEmailResult.error
        });
      }

      // Send SMS to doctor
      if (doctorData.phone) {
        const doctorSmsResult = await this.smsService.sendConsultationCompletedSMS(
          doctorData.phone,
          completionData
        );
        notifications.push({
          type: 'sms',
          recipient: 'doctor',
          recipientPhone: doctorData.phone,
          success: doctorSmsResult.success,
          error: doctorSmsResult.error
        });
      }

      logger.info('Consultation completion notifications sent', {
        appointmentId: appointmentData._id,
        notifications: notifications.length
      });

      return {
        success: true,
        notifications,
        appointmentId: appointmentData._id
      };

    } catch (error) {
      logger.error('Failed to send consultation completion notifications:', error);
      return {
        success: false,
        error: error.message,
        appointmentId: appointmentData._id
      };
    }
  }

  // Generic method to send custom notifications
  async sendCustomNotification(recipientEmail, recipientPhone, subject, message, htmlContent = null) {
    try {
      const notifications = [];

      // Send email if email provided
      if (recipientEmail) {
        const emailResult = await this.emailService.sendEmail(
          recipientEmail,
          subject,
          htmlContent || message
        );
        notifications.push({
          type: 'email',
          recipientEmail,
          success: emailResult.success,
          error: emailResult.error
        });
      }

      // Send SMS if phone provided
      if (recipientPhone) {
        const smsResult = await this.smsService.sendSMS(recipientPhone, message);
        notifications.push({
          type: 'sms',
          recipientPhone,
          success: smsResult.success,
          error: smsResult.error
        });
      }

      return {
        success: true,
        notifications
      };

    } catch (error) {
      logger.error('Failed to send custom notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotificationService();