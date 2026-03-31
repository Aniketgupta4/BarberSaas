const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Cloudinary upload

// Saare routes par yeh security check lagega
router.use(requireAuth, requireRole('BarberOwner'));

// Manage Shop, Services, Employees
router.get('/manage', ownerController.getOwnerManage);
router.post('/setup-shop', upload.single('bannerImage'), ownerController.setupShop);
router.post('/add-service', upload.single('serviceImage'), ownerController.addService);
router.post('/add-employee', ownerController.addEmployee);

// Manage Booking Requests
router.get('/requests', ownerController.getOwnerRequests);
// routes/ownerRoutes.js
router.post('/update-request', ownerController.updateRequest);

router.get('/dashboard', ownerController.getOwnerDashboard);
router.get('/manage', ownerController.getOwnerManage);

// Employee delete karne ka route
router.post('/delete-employee/:id', ownerController.deleteEmployee);

router.post('/delete-service/:id', ownerController.deleteService);

module.exports = router;