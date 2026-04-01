const User = require('../models/User');
const Shop = require('../models/Shop');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Render Admin Dashboard (God Mode Integrated 👑)
exports.getAdminDashboard = async (req, res) => {
    try {
        // 🔢 Pagination Setup (For Partners/Owners List)
        const page = parseInt(req.query.page) || 1;
        const limit = 3; // Ek page par 3 partners
        const skip = (page - 1) * limit;

        // 📊 Dashboard Stats Ke Liye Total Counts
        const totalOwners = await User.countDocuments({ role: 'BarberOwner' });
        // Customers wo hain jo BarberOwner nahi hain
        const totalCustomers = await User.countDocuments({ role: { $ne: 'BarberOwner' } }); 
        const totalShops = await Shop.countDocuments();
        const totalBookings = await Appointment.countDocuments();
        
        // 💰 NAYA: Platform Financial Analytics
        const completedAppointments = await Appointment.find({ status: 'Completed' }).populate('serviceId');
        let totalPlatformVolume = 0;
        
        completedAppointments.forEach(app => {
            if (app.serviceId && app.serviceId.price) {
                totalPlatformVolume += app.serviceId.price;
            }
        });
        
        // 5% Commission Calculate karo
        const platformEarnings = (totalPlatformVolume * 0.05).toFixed(2); 

        const totalPages = Math.ceil(totalOwners / limit);

        // 👨‍💼 Existing Logic: Fetch Barber Owners for management
        const owners = await User.find({ role: 'BarberOwner' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // 🏪 NAYA: Fetch all shops for the Master Table (Sorted by Rating)
        const allShops = await Shop.find()
            .populate('ownerId')
            .sort({ averageRating: -1 });

        res.render('admin-dashboard', { 
            title: 'Admin God Mode Dashboard', 
            owners,          
            totalOwners,
            totalCustomers,       // Naya pass kiya
            totalShops,      
            totalBookings,   
            totalPlatformVolume,  // Naya pass kiya
            platformEarnings,     // Naya pass kiya
            allShops,             // Naya pass kiya
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