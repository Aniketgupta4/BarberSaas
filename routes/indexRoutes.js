const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');

// Public Routes (Koi bhi dekh sakta hai)
router.get('/', userController.getHomePage);
router.get('/shop/:id', userController.getShopDetails);

// Booking ka route (Login zaroori hai)
router.post('/book', requireAuth, userController.bookAppointment);

module.exports = router;