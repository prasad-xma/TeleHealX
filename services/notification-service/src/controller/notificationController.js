const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const NotificationTemplates = require('../services/notificationTemplates');
const logger = require('../utils/logger');
const Joi = require('joi');

const notificationSchema = Joi.object({
  recipientId: Joi.string().required(),
  recipientType: Joi.string().valid('patient', 'doctor', 'admin').required(),
  type: Joi.string().valid('appointment_booked', 'appointment_accepted', 'appointment_cancelled', 'consultation_completed', 'prescription_issued', 'payment_confirmed').required(),
  channels: Joi.object({
    email: Joi.boolean().default(true),
    sms: Joi.boolean().default(true)
  }).default(),
  recipientEmail: Joi.string().email().when('channels.email', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  recipientPhone: Joi.string().when('channels.sms', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  appointmentId: Joi.string().optional(),
  data: Joi.object().optional()
});

class NotificationController {
  
  async sendNotification(req, res) {
    try {
      const { error, value } = notificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }

      const notification = new Notification({
        recipientId: value.recipientId,
        recipientType: value.recipientType,
        type: value.type,
        channels: value.channels,
        appointmentId: value.appointmentId,
        metadata: value.data || {}
      });

      let template;
      switch (value.type) {
        case 'appointment_booked':
          template = NotificationTemplates.getAppointmentBookedTemplate(value.data);
          break;
        case 'appointment_accepted':
          template = NotificationTemplates.getAppointmentAcceptedTemplate(value.data);
          break;
        case 'appointment_cancelled':
          template = NotificationTemplates.getAppointmentCancelledTemplate(value.data);
          break;
        case 'consultation_completed':
          template = NotificationTemplates.getConsultationCompletedTemplate(value.data);
          break;
        case 'prescription_issued':
          template = NotificationTemplates.getPrescriptionIssuedTemplate(value.data);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported notification type'
          });
      }

      // Send Email
      if (value.channels.email && value.recipientEmail) {
        notification.email.address = value.recipientEmail;
        notification.email.subject = template.email.subject;
        notification.email.body = template.email.html;

        const emailResult = await emailService.sendEmail(
          value.recipientEmail,
          template.email.subject,
          template.email.html,
          template.email.text
        );

        if (emailResult.success) {
          notification.email.status = 'sent';
          notification.email.sentAt = new Date();
        } else {
          notification.email.status = 'failed';
          notification.email.error = emailResult.error;
        }
      }

      // Send SMS
      if (value.channels.sms && value.recipientPhone) {
        notification.sms.phoneNumber = value.recipientPhone;
        notification.sms.message = template.sms;

        const smsResult = await smsService.sendSMS(value.recipientPhone, template.sms);

        if (smsResult.success) {
          notification.sms.status = 'sent';
          notification.sms.sentAt = new Date();
        } else {
          notification.sms.status = 'failed';
          notification.sms.error = smsResult.error;
        }
      }

      await notification.save();

      logger.info(`Notification sent: ${notification._id}`, {
        recipientId: value.recipientId,
        type: value.type,
        emailStatus: notification.email.status,
        smsStatus: notification.sms.status
      });

      res.status(201).json({
        success: true,
        message: 'Notification processed',
        data: {
          notificationId: notification._id,
          emailStatus: notification.email.status,
          smsStatus: notification.sms.status
        }
      });

    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const { recipientId, type, status, page = 1, limit = 10 } = req.query;
      
      const filter = {};
      if (recipientId) filter.recipientId = recipientId;
      if (type) filter.type = type;
      if (status) {
        filter['$or'] = [
          { 'email.status': status },
          { 'sms.status': status }
        ];
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-metadata');

      const total = await Notification.countDocuments(filter);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getNotificationById(req, res) {
    try {
      const notification = await Notification.findById(req.params.id);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {
      logger.error('Error fetching notification by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async retryFailedNotification(req, res) {
    try {
      const notification = await Notification.findById(req.params.id);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      let retrySuccess = false;

      // Retry Email
      if (notification.email.status === 'failed' && notification.email.address) {
        const emailResult = await emailService.sendEmail(
          notification.email.address,
          notification.email.subject,
          notification.email.body
        );

        if (emailResult.success) {
          notification.email.status = 'sent';
          notification.email.sentAt = new Date();
          notification.email.error = undefined;
          retrySuccess = true;
        }
      }

      // Retry SMS
      if (notification.sms.status === 'failed' && notification.sms.phoneNumber) {
        const smsResult = await smsService.sendSMS(
          notification.sms.phoneNumber,
          notification.sms.message
        );

        if (smsResult.success) {
          notification.sms.status = 'sent';
          notification.sms.sentAt = new Date();
          notification.sms.error = undefined;
        } else {
          notification.sms.error = smsResult.error;
        }
      }

      await notification.save();

      if (retrySuccess) {
        logger.info(`Notification retry successful: ${notification._id}`);
      }

      res.json({
        success: true,
        message: retrySuccess ? 'Notification retry successful' : 'No failed notifications to retry',
        data: {
          emailStatus: notification.email.status,
          smsStatus: notification.sms.status
        }
      });

    } catch (error) {
      logger.error('Error retrying notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getNotificationStats(req, res) {
    try {
      const { recipientId, startDate, endDate } = req.query;
      
      const matchStage = {};
      if (recipientId) matchStage.recipientId = recipientId;
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }

      const stats = await Notification.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            emailSent: { $sum: { $cond: [{ $eq: ['$email.status', 'sent'] }, 1, 0] } },
            emailFailed: { $sum: { $cond: [{ $eq: ['$email.status', 'failed'] }, 1, 0] } },
            smsSent: { $sum: { $cond: [{ $eq: ['$sms.status', 'sent'] }, 1, 0] } },
            smsFailed: { $sum: { $cond: [{ $eq: ['$sms.status', 'failed'] }, 1, 0] } }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error fetching notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Send appointment booking notifications to both patient and doctor
  async sendAppointmentBookingNotifications(req, res) {
    console.log('📨 [NOTIFICATION CONTROLLER] Received appointment booking notification request');
    console.log('📨 [NOTIFICATION CONTROLLER] Request body:', req.body);

    try {
      const { appointmentData, patientData, doctorData } = req.body;

      console.log('🔍 [NOTIFICATION CONTROLLER] Validating notification data...');
      // Validate required data
      if (!appointmentData || !patientData || !doctorData) {
        console.error('❌ [NOTIFICATION CONTROLLER] Missing required data:', { appointmentData: !!appointmentData, patientData: !!patientData, doctorData: !!doctorData });
        return res.status(400).json({
          success: false,
          message: 'Missing required data: appointmentData, patientData, or doctorData'
        });
      }

      console.log('⚙️ [NOTIFICATION CONTROLLER] Calling notification service...');
      const notificationService = require('../services/notificationService');
      const result = await notificationService.sendAppointmentBookingNotifications(
        appointmentData,
        patientData,
        doctorData
      );

      if (result.success) {
        console.log('✅ [NOTIFICATION CONTROLLER] Appointment booking notifications sent successfully');
        res.status(200).json({
          success: true,
          message: 'Appointment booking notifications sent successfully',
          data: result
        });
      } else {
        console.error('❌ [NOTIFICATION CONTROLLER] Failed to send notifications:', result.error);
        res.status(500).json({
          success: false,
          message: 'Failed to send appointment booking notifications',
          error: result.error
        });
      }

    } catch (error) {
      console.error('❌ [NOTIFICATION CONTROLLER] Error in sendAppointmentBookingNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Send consultation completion notifications to both patient and doctor
  async sendConsultationCompletedNotifications(req, res) {
    try {
      const { appointmentData, patientData, doctorData, prescriptionIssued = false } = req.body;

      // Validate required data
      if (!appointmentData || !patientData || !doctorData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required data: appointmentData, patientData, or doctorData'
        });
      }

      const notificationService = require('../services/notificationService');
      const result = await notificationService.sendConsultationCompletedNotifications(
        appointmentData,
        patientData,
        doctorData,
        prescriptionIssued
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Consultation completion notifications sent successfully',
          data: result
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send consultation completion notifications',
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Error sending consultation completion notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async sendAppointmentAcceptedNotifications(req, res) {
    try {
      const { appointmentData, patientData, doctorData } = req.body;

      if (!appointmentData || !patientData || !doctorData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required data: appointmentData, patientData, or doctorData'
        });
      }

      const notificationService = require('../services/notificationService');
      const result = await notificationService.sendAppointmentAcceptedNotifications(
        appointmentData,
        patientData,
        doctorData
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Appointment acceptance notifications sent successfully',
          data: result
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send appointment acceptance notifications',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error sending appointment acceptance notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new NotificationController();
