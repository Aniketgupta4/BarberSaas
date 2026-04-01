const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Sirf 'Customer' role wale hi apna dashboard dekh sakte hain
router.use(requireAuth, requireRole('Customer'));

router.get('/dashboard', userController.getUserDashboard);

router.post('/delete-booking/:id', userController.deleteBooking);

router.post('/confirm-reschedule', userController.confirmReschedule);

router.post('/rate-service', userController.rateService);

module.exports = router;