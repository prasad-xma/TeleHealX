const express = require('express');
const availabilityController = require('../controller/availabilityController');
const { protect, verifyDoctor } = require('../middleware/authMiddleware');
const { validateInternalApiKey } = require('../middleware/internalApiKeyMiddleware');

const router = express.Router();

router.get('/me/availability', protect, verifyDoctor, availabilityController.getMyAvailability);
router.get('/:doctorId/availability', availabilityController.getDoctorAvailability);
router.post('/me/availability', protect, verifyDoctor, availabilityController.setWeeklySchedule);
router.patch('/me/availability/block', protect, verifyDoctor, availabilityController.addBlockedDate);
router.delete('/me/availability/block', protect, verifyDoctor, availabilityController.removeBlockedDate);
router.patch('/me/availability/slot', protect, verifyDoctor, availabilityController.updateSlotStatus);

// Internal API endpoint for appointment service
router.patch('/internal/:doctorId/availability/slot', validateInternalApiKey, availabilityController.updateSlotStatus);

module.exports = router;
