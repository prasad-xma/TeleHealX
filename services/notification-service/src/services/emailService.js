const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
      }

      const fromEmail = process.env.FROM_EMAIL || 'noreply@telehealx.com';

      const mailOptions = {
        from: fromEmail,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Send appointment booking confirmation email
  async sendAppointmentBookingEmail(to, data) {
    const subject = 'Appointment Confirmed - TeleHealX';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Appointment Confirmed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          
          <p>Your appointment has been successfully booked with the following details:</p>

          <div style="background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Type:</strong> ${data.type || 'Consultation'}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>

          <p>Please join the video consultation 5 minutes before the scheduled time.</p>
          <p>For any queries, contact our support team.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.consultationLink || '#'}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Join Consultation</a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from TeleHealX. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  // Send consultation completion email
  async sendConsultationCompletedEmail(to, data) {
    const subject = 'Consultation Completed - TeleHealX';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Consultation Completed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          
          <p>Your consultation with Dr. ${data.doctorName} has been completed successfully.</p>

          <div style="background: white; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Consultation Summary</h3>
            <p><strong>Doctor:</strong> Dr. ${data.doctorName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Duration:</strong> ${data.duration || '30 minutes'}</p>
          </div>

          ${data.prescriptionIssued ? `
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Prescription Available</h4>
            <p style="margin: 0;">Your digital prescription has been issued. You can view it in your TeleHealX account.</p>
          </div>
          ` : ''}

          <p>Thank you for using TeleHealX. Your health records have been updated.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${data.recordsLink || '#'}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Medical Records</a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from TeleHealX. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }
}

module.exports = new EmailService();
