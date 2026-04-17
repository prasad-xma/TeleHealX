const express = require('express');
const authController = require('../controller/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Add route logging middleware for auth service
router.use((req, res, next) => {
  console.log(`[AUTH ROUTES] ${req.method} ${req.url}`);
  console.log(`[AUTH ROUTES] Headers:`, {
    'x-internal-api-key': req.headers['x-internal-api-key'] ? '***' : 'None'
  });
  next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/doctors', authController.getApprovedDoctors);
router.get('/doctors/:doctorId', authController.getDoctorById);
router.get('/users/:userId', authController.getUserById);

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