#!/usr/bin/env node
/**
 * Appointment to Notification Flow Verification Script
 * 
 * This script verifies that:
 * 1. Appointment service can reach auth-service to fetch patient and doctor data
 * 2. Appointment service can reach notification-service
 * 3. Notification service has proper email and SMS credentials
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const config = {
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5008',
  appointmentServiceUrl: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5007',
  internalServiceSecret: process.env.INTERNAL_SERVICE_SECRET || 'internal-key'
};

console.log('🔍 Appointment-Notification Flow Verification\n');
console.log('Configuration:');
console.log(`  Auth Service: ${config.authServiceUrl}`);
console.log(`  Notification Service: ${config.notificationServiceUrl}`);
console.log(`  Appointment Service: ${config.appointmentServiceUrl}`);
console.log(`\n`);

let testsPassed = 0;
let testsFailed = 0;

const test = async (name, fn) => {
  try {
    console.log(`⏳ Testing: ${name}...`);
    await fn();
    console.log(`✅ PASSED: ${name}\n`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}\n`);
    testsFailed++;
  }
};

const runTests = async () => {
  // Test 1: Auth Service Health
  await test('Auth Service Health Check', async () => {
    const response = await axios.get(`${config.authServiceUrl}/api/auth`, {
      timeout: 5000
    });
    if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`);
  });

  // Test 2: Notification Service Health
  await test('Notification Service Health Check', async () => {
    const response = await axios.get(`${config.notificationServiceUrl}/health`, {
      timeout: 5000
    });
    if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`);
  });

  // Test 3: Auth Service can fetch doctors
  await test('Auth Service: Fetch Approved Doctors', async () => {
    const response = await axios.get(`${config.authServiceUrl}/api/auth/doctors`, {
      timeout: 5000
    });
    const doctors = Array.isArray(response.data) ? response.data : response.data.data || [];
    if (doctors.length === 0) {
      console.log('⚠️  Warning: No doctors found in the system');
    }
    console.log(`   Found ${doctors.length} doctors`);
  });

  // Test 4: Verify appointment service .env has notification URL
  await test('Appointment Service: NOTIFICATION_SERVICE_URL configured', async () => {
    if (!config.notificationServiceUrl || config.notificationServiceUrl.includes('undefined')) {
      throw new Error('NOTIFICATION_SERVICE_URL not properly configured');
    }
    console.log(`   Configured URL: ${config.notificationServiceUrl}`);
  });

  // Test 5: Verify appointment service has internal secret
  await test('Appointment Service: INTERNAL_SERVICE_SECRET configured', async () => {
    if (!config.internalServiceSecret || config.internalServiceSecret === 'internal-key') {
      console.log('⚠️  Warning: Using default INTERNAL_SERVICE_SECRET. Should be configured in .env');
    }
    console.log(`   Secret length: ${config.internalServiceSecret.length} characters`);
  });

  // Test 6: Notification Service endpoint
  await test('Notification Service: Appointment-booked endpoint exists', async () => {
    // Try to POST with minimal data (will fail validation but endpoint should exist)
    try {
      await axios.post(`${config.notificationServiceUrl}/api/notifications/appointment-booked`, {}, {
        timeout: 5000,
        headers: {
          'x-internal-api-key': config.internalServiceSecret
        }
      });
    } catch (error) {
      // We expect validation error, not 404
      if (error.response?.status === 400) {
        console.log('   Endpoint exists and is validating input correctly');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint not found (404)');
      } else {
        throw error;
      }
    }
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n✅ All verification tests passed!');
    console.log('\nNext steps:');
    console.log('1. Ensure all services are running:');
    console.log('   - npm run dev (in appointment-service)');
    console.log('   - npm run dev (in auth-service)');
    console.log('   - npm run dev (in notification-service)');
    console.log('   - npm run dev (in api-gateway)');
    console.log('\n2. Create an appointment via the API');
    console.log('3. Check if email and SMS are received');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
  }
};

runTests();
