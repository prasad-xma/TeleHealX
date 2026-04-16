const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

// Add route logging middleware for notification service
router.use((req, res, next) => {
  console.log(`📧 [NOTIFICATION ROUTES] ${req.method} ${req.url}`);
  console.log(`📧 [NOTIFICATION ROUTES] Headers:`, {
    'x-internal-api-key': req.headers['x-internal-api-key'] ? '***' : 'None'
  });
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📧 [NOTIFICATION ROUTES] Body:`, req.body);
  }
  next();
});

// POST /api/notifications/send - Send a new notification
router.post('/send', notificationController.sendNotification);

// POST /api/notifications/appointment-booked - Send appointment booking notifications
router.post('/appointment-booked', notificationController.sendAppointmentBookingNotifications);

// POST /api/notifications/appointment-accepted - Send appointment accepted notifications
router.post('/appointment-accepted', notificationController.sendAppointmentAcceptedNotifications);

// POST /api/notifications/consultation-completed - Send consultation completion notifications
router.post('/consultation-completed', notificationController.sendConsultationCompletedNotifications);

// GET /api/notifications - Get notifications with filters
router.get('/', notificationController.getNotifications);

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// POST /api/notifications/:id/retry - Retry failed notification
router.post('/:id/retry', notificationController.retryFailedNotification);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

module.exports = router;
