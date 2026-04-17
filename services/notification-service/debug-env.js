require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('TO_EMAIL:', process.env.TO_EMAIL);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

// Test if nodemailer can be created with these credentials
const nodemailer = require('nodemailer');

try {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.TO_EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('Transporter created successfully');
} catch (error) {
  console.error('Transporter creation failed:', error.message);
}
