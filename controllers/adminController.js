const User = require('../models/User');
const Shop = require('../models/Shop');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Render Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        // 🔢 Pagination Setup
        const page = parseInt(req.query.page) || 1;
        const limit = 3; // Ek page par 3 partners
        const skip = (page - 1) * limit;

        // 📊 Dashboard Stats Ke Liye Total Counts
        const totalOwners = await User.countDocuments({ role: 'BarberOwner' });
        const totalShops = await Shop.countDocuments();
        const totalBookings = await Appointment.countDocuments();
        
        const totalPages = Math.ceil(totalOwners / limit);

        // 🔴 CRITICAL FIX: Variable ka naam 'partners' se badal kar 'owners' kiya hai
        const owners = await User.find({ role: 'BarberOwner' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('admin-dashboard', { 
            title: 'Admin Dashboard', 
            owners,          // EJS ab isko aaram se read kar lega
            totalOwners,     // Top cards ke liye
            totalShops,      // Top cards ke liye
            totalBookings,   // Top cards ke liye
            currentPage: page, 
            totalPages
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
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

// 2. Delete Partner Function
exports.deletePartner = async (req, res) => {
    try {
        const partnerId = req.params.id;
        
        // Partner (Owner) ko delete karo
        await User.findByIdAndDelete(partnerId);
        
        console.log("Partner Deleted Successfully! 🗑️");
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Delete nahi ho paya.");
    }
};