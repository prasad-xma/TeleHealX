const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

// POST /api/notifications/send - Send a new notification
router.post('/send', notificationController.sendNotification);

// GET /api/notifications - Get notifications with filters
router.get('/', notificationController.getNotifications);

// GET /api/notifications/:id - Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// POST /api/notifications/:id/retry - Retry failed notification
router.post('/:id/retry', notificationController.retryFailedNotification);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

module.exports = router;
