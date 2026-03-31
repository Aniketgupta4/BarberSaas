const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', authController.loginUser);

router.get('/signup', authController.getSignup);
router.post('/signup', authController.registerUser);

router.get('/logout', authController.logoutUser);

module.exports = router;