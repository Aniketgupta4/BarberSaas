const User = require('../models/User');
const Shop = require('../models/Shop');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Render Admin Dashboard
// adminController.js
exports.getAdminDashboard = async (req, res) => {
    try {
        // 1. Pagination Logic
        const page = parseInt(req.query.page) || 1; // Current page number (default 1)
        const limit = 5; // Ek page pe kitne owners dikhane hain
        const skip = (page - 1) * limit;

        // 2. Data Fetching
        const totalOwners = await User.countDocuments({ role: 'BarberOwner' });
        const owners = await User.find({ role: 'BarberOwner' })
            .sort({ createdAt: -1 }) // Naye owners upar dikhenge
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOwners / limit);

        // Baaki stats (Total Shops, Bookings etc.)
        const totalShops = await Shop.countDocuments();
        // const totalBookings = await Appointment.countDocuments(); // Agar model hai toh

        res.render('admin-dashboard', {
            owners,
            totalOwners,
            totalShops,
            currentPage: page,
            totalPages,
            user: res.locals.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// Add New Barber Owner
exports.addBarberOwner = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Duplicate Check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">Owner Email Already Registered!</h3>');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set 30 days subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        await User.create({
            name, email, password: hashedPassword, phone,
            role: 'BarberOwner', subscriptionStart: startDate, subscriptionEnd: endDate, isActive: true
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log("Error in addBarberOwner:", error);
        res.status(400).send("Error adding owner");
    }
};


// Subscription Renew karne ka logic
exports.renewSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Aaj se 30 din aage ki date set karo
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);

        await User.findByIdAndUpdate(id, {
            subscriptionEnd: newEndDate,
            isActive: true
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log("Renewal Error:", error);
        res.status(500).send("Error renewing subscription");
    }
};