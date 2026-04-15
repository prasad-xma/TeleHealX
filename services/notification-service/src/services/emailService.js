const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    
    if (this.provider === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'noreply@telehealx.com';
      
      if (this.provider === 'sendgrid') {
        const msg = {
          to,
          from: fromEmail,
          subject,
          html: htmlContent,
          text: textContent || this.stripHtml(htmlContent)
        };
        
        await sgMail.send(msg);
        logger.info(`Email sent successfully via SendGrid to ${to}`);
      } else {
        const mailOptions = {
          from: fromEmail,
          to,
          subject,
          html: htmlContent,
          text: textContent || this.stripHtml(htmlContent)
        };
        
        await this.transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully via SMTP to ${to}`);
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
