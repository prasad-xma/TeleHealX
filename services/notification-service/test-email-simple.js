const emailService = require('./src/services/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('=== Testing Email Service ===');
  console.log('Email user:', process.env.EMAIL_USER);
  
  const result = await emailService.sendEmail(
    process.env.EMAIL_USER,
    'TeleHealX Email Test',
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #e8f5e8; border-radius: 8px; color: white;">
        <h2>Email Test Successful!</h2>
        <p>This email confirms that your TeleHealX Notification Service is working correctly.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Service:</strong> Nodemailer + Gmail SMTP</p>
      </div>
    `,
    `TeleHealX email test - ${new Date().toLocaleString()}`
  );
  
  console.log('Result:', result);
}

testEmail();
