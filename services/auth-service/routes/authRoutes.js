const express = require('express');
const authController = require('../controller/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', protect, authController.getMe);

router.get(
	'/admin/doctor-applications',
	protect,
	authorize('admin'),
	authController.getPendingDoctors
);

router.patch(
	'/admin/approve-doctor/:userId',
	protect,
	authorize('admin'),
	authController.approveDoctor
);

module.exports = router;
