const express = require('express');
const videoController = require('../controller/videoController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', videoController.getHealth);
router.post('/meeting', protect, authorizeRoles('doctor'), videoController.createMeeting);
router.post('/token', protect, authorizeRoles('patient', 'doctor'), videoController.createToken);

module.exports = router;