const emailService = require('./src/services/emailService');
require('dotenv').config();

async function testEmail() {
  console.log('=== Testing Email Service ===');
  console.log('TO_EMAIL:', process.env.TO_EMAIL);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  
  const result = await emailService.sendEmail(
    process.env.TO_EMAIL || 'test@example.com',
    'TeleHealX Email Test',
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #e8f5e8; border-radius: 8px; color: white;">
        <h2>Email Test Successful!</h2>
        <p>This email confirms that your TeleHealX Notification Service is working correctly.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Using:</strong> Nodemailer + Gmail SMTP</p>
      </div>
    `,
    `TeleHealX email test - ${new Date().toLocaleString()}`
  );
  
  console.log('Result:', result);
}

testEmail();
