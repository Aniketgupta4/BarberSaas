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
        
        // Pagination setup
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit;

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
        
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'Accepted' });
        
        console.log("New Time Accepted by User! ✅");
        res.redirect('/user/dashboard'); 
    } catch (error) {
        console.error("Confirm Reschedule Error:", error);
        res.status(500).send("Error confirm karne mein problem aayi bhai.");
    }
};

// ==========================================
// 🔴 NEW: PART 3: RATING SYSTEM LOGIC
// ==========================================

exports.rateService = async (req, res) => {
    try {
        const { appointmentId, rating } = req.body;
        const numericRating = parseInt(rating);

        // 1. Appointment ko update karo (Save rating)
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { rating: numericRating, isRated: true },
            { new: true } // Return updated document
        );

        if (!appointment) return res.status(404).send("Appointment not found");

        // 2. Us Shop ka naya Average Calculate karo
        const shopId = appointment.shopId;
        
        // Us dukaan ke saare RATED appointments nikalo
        const allRatedAppointments = await Appointment.find({ shopId: shopId, isRated: true });
        
        const totalReviews = allRatedAppointments.length;
        let sumRatings = 0;
        
        allRatedAppointments.forEach(app => {
            sumRatings += app.rating;
        });

        // Average nikal kar 1 decimal place tak set karo (e.g., 4.5)
        const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;

        // 3. Shop DB mein update karo
        await Shop.findByIdAndUpdate(shopId, {
            averageRating: parseFloat(averageRating),
            totalReviews: totalReviews
        });

        console.log(`Rating submitted! Shop Average is now: ${averageRating} ⭐`);
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error("Rating Submission Error:", error);
        res.status(500).send("Error submitting rating.");
    }
};