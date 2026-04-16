require('dotenv').config();
const nodemailer = require('nodemailer');

async function testOutlookEmail() {
  console.log('=== Testing Outlook Email ===');
  
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Outlook Email',
      text: 'This is a test email via Outlook SMTP'
    });
    
    console.log('Outlook email sent successfully:', result.messageId);
  } catch (error) {
    console.error('Outlook email failed:', error.message);
  }
}

testOutlookEmail();
