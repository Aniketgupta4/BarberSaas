const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');
const Shop = require('../models/Shop');


// Public Routes (Koi bhi dekh sakta hai)
router.get('/', userController.getHomePage);
router.get('/shop/:id', userController.getShopDetails);

// Booking ka route (Login zaroori hai)
router.post('/book', requireAuth, userController.bookAppointment);


router.get('/', async (req, res) => {
    try {
        const { query, lat, lng } = req.query; // Form se data pakda
        let filter = {};

        // 1. Agar naam ya area search kiya hai
        if (query) {
            filter.$or = [
                { shopName: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } }
            ];
        }

        let shops;

        // 2. Agar "Near Me" click kiya hai (Distance logic)
        if (lat && lng) {
            shops = await Shop.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: "dist.calculated", // Kitni door hai wo calculate hoga
                        maxDistance: 50000, // 50km ka radius
                        query: filter,
                        spherical: true
                    }
                }
            ]);
        } else {
            // Normal Search bina GPS ke
            shops = await Shop.find(filter);
        }

        res.render('home', { shops, query, user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server mein kachra ho gaya!");
    }
});



module.exports = router;