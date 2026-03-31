const Shop = require('../models/Shop');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// ==========================================
// PART 1: PUBLIC PAGES (Home & Shop Details)
// ==========================================

// Get Home Page (Show all active shops)
exports.getHomePage = async (req, res) => {
    try {
        // Saari dukaanein fetch karo
        const shops = await Shop.find().sort({ createdAt: -1 });
        res.render('home', { title: 'Home | BarberSaaS', shops });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

// Get Single Shop Details & Services
exports.getShopDetails = async (req, res) => {
    try {
        const shopId = req.params.id;
        const shop = await Shop.findById(shopId);
        
        if (!shop) return res.status(404).send("Shop not found");

        // Shop ki saari services fetch karo
        const services = await Service.find({ shopId });
        
        res.render('shop-details', { title: `${shop.shopName} | BarberSaaS`, shop, services });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// PART 2: BOOKING & CUSTOMER DASHBOARD
// ==========================================

// Book an Appointment (Customer requests a slot)
exports.bookAppointment = async (req, res) => {
    try {
        const { shopId, serviceId, bookingDate, bookingTime } = req.body;
        const userId = res.locals.user._id;

        // Default status 'Pending' jayega
        await Appointment.create({
            userId,
            shopId,
            serviceId,
            bookingDate,
            bookingTime
        });

        res.redirect('/user/dashboard'); // Booking ke baad sidha uske dashboard pe bhej do
    } catch (error) {
        console.log("Error Booking:", error);
        res.status(500).send("Error booking appointment");
    }
};

// Get Customer Dashboard (My Bookings)
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = res.locals.user._id;

        // User ki saari bookings fetch karo, aur unke sath Shop aur Service ki details bhi lao
        const appointments = await Appointment.find({ userId })
                                              .populate('shopId', 'shopName address')
                                              .populate('serviceId', 'serviceName price')
                                              .sort({ bookingDate: -1 });

        res.render('user-dashboard', { title: 'My Bookings | BarberSaaS', appointments });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};