const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Sirf SuperAdmin hi yeh routes access kar sakta hai
router.get('/dashboard', requireAuth, requireRole('SuperAdmin'), adminController.getAdminDashboard);
router.post('/add-owner', requireAuth, requireRole('SuperAdmin'), adminController.addBarberOwner);
// ... existing routes ...
router.post('/renew-subscription/:id', requireAuth, requireRole('SuperAdmin'), adminController.renewSubscription);

router.post('/delete-partner/:id', adminController.deletePartner);

module.exports = router;