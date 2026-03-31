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
        const userId = res.locals.user._id; // Ya req.user._id (jo tum use kar rahe ho)
        
        // Pagination setup
        const page = parseInt(req.query.page) || 1; // Current page (default 1)
        const limit = 5; // Ek page par kitni bookings dikhani hain
        const skip = (page - 1) * limit;

        // Total bookings count (Next/Prev button ke liye zaroori hai)
        const totalAppointments = await Appointment.countDocuments({ userId });
        const totalPages = Math.ceil(totalAppointments / limit);

        const appointments = await Appointment.find({ userId })
            .populate('serviceId') 
            .populate('shopId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('user-dashboard', { 
            title: 'My Bookings', 
            appointments,
            user: res.locals.user,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Crash ho gaya server!");
    }
};



// 2. Delete/Cancel Booking ka function
exports.deleteBooking = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        
        // Appointment delete kar do
        await Appointment.findByIdAndDelete(appointmentId);
        
        console.log("Booking deleted successfully!");
        res.redirect('/user/dashboard'); // Wapas dashboard pe bhej do
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Delete nahi ho paya bhai!");
    }
};




// 3. Confirm Rescheduled Booking
exports.confirmReschedule = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        
        // Jab user "Accept New Time" dabaye, toh status wapas "Accepted" kar do
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'Accepted' });
        
        console.log("New Time Accepted by User! ✅");
        res.redirect('/user/dashboard'); // Wapas dashboard pe bhej do
    } catch (error) {
        console.error("Confirm Reschedule Error:", error);
        res.status(500).send("Error confirm karne mein problem aayi bhai.");
    }
};