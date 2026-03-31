const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Cloudinary/Multer config

// 🛡️ Security Check: Sirf logged-in Owners hi in routes ko access kar payenge
router.use(requireAuth, requireRole('BarberOwner'));

// --- 🏠 DASHBOARD & PROFILE ---
// Owner ka main overview dashboard
router.get('/dashboard', ownerController.getOwnerDashboard);

// Shop configuration page jahan sab manage hota hai
router.get('/manage', ownerController.getOwnerManage);

// Shop details setup ya update karne ke liye
router.post('/setup-shop', upload.single('bannerImage'), ownerController.setupShop);


// --- ✂️ SERVICES MANAGEMENT ---
// Nayi service add karne ke liye
router.post('/add-service', upload.single('serviceImage'), ownerController.addService);

// Service delete karne ke liye
router.post('/delete-service/:id', ownerController.deleteService);


// --- 🧑‍🎨 STAFF MANAGEMENT ---
// Naya staff member onboard karne ke liye
router.post('/add-employee', ownerController.addEmployee);

// Staff delete karne ke liye
router.post('/delete-employee/:id', ownerController.deleteEmployee);


// --- 📅 BOOKING REQUESTS ---
// Saari customer requests dekhne ke liye
router.get('/requests', ownerController.getOwnerRequests);

// Appointment Accept, Reject ya Reschedule karne ke liye
router.post('/update-request', ownerController.updateRequest);

router.post('/delete-request/:id', ownerController.deleteRequest);

module.exports = router;