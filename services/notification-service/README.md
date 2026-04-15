# Notification Service

A microservice for handling SMS and email notifications in the TeleHealX healthcare platform.

## Features

- **Email Notifications**: Send professional HTML emails using SendGrid or SMTP
- **SMS Notifications**: Send SMS messages using Twilio
- **Template System**: Pre-built templates for different notification types
- **Notification Tracking**: Log and track delivery status
- **Retry Mechanism**: Retry failed notifications
- **Statistics**: Get notification delivery statistics

## Supported Notification Types

- `appointment_booked` - When a patient books an appointment
- `appointment_cancelled` - When an appointment is cancelled
- `consultation_completed` - When a telemedicine consultation ends
- `prescription_issued` - When a doctor issues a digital prescription
- `payment_confirmed` - When payment is processed

## API Endpoints

### Send Notification
```
POST /api/notifications/send
```

### Get Notifications
```
GET /api/notifications?recipientId=123&type=appointment_booked&page=1&limit=10
```

### Get Notification by ID
```
GET /api/notifications/:id
```

### Retry Failed Notification
```
POST /api/notifications/:id/retry
```

### Get Statistics
```
GET /api/notifications/stats?recipientId=123&startDate=2024-01-01&endDate=2024-12-31
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
PORT=5005
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/telehealx-notifications

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@telehealx.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Docker

```bash
docker build -t notification-service .
docker run -p 5005:5005 notification-service
```

## Example Request

```json
{
  "recipientId": "patient_123",
  "recipientType": "patient",
  "type": "appointment_booked",
  "channels": {
    "email": true,
    "sms": true
  },
  "recipientEmail": "patient@example.com",
  "recipientPhone": "+94771234567",
  "appointmentId": "apt_456",
  "data": {
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "specialization": "Cardiology",
    "date": "2024-01-15",
    "time": "10:30 AM",
    "consultationLink": "https://telehealx.com/join/apt_456"
  }
}
```

## Health Check

```
GET /health
```

Returns service health status.
