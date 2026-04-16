require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

// Create a simple test email transporter
const nodemailer = require('nodemailer');

console.log('\n=== Creating Transporter ===');
try {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('Transporter created successfully');
  
  // Test sending email
  transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.EMAIL_USER,
    subject: 'Test Email',
    text: 'This is a test email'
  }).then(result => {
    console.log('Email sent successfully:', result.messageId);
  }).catch(error => {
    console.error('Email send failed:', error.message);
  });
  
} catch (error) {
  console.error('Transporter creation failed:', error.message);
}
