const Shop = require('../models/Shop');
const Service = require('../models/Service');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');

// ==========================================
// PART 1: SHOP, SERVICES & EMPLOYEES MANAGE
// ==========================================

// 1. Render Management Dashboard (Shop, Services, Employees)
exports.getOwnerManage = async (req, res) => {
    try {
        const ownerId = res.locals.user._id;
        const shop = await Shop.findOne({ ownerId });
        
        let services = [];
        let employees = [];
        
        if (shop) {
            services = await Service.find({ shopId: shop._id });
            employees = await Employee.find({ shopId: shop._id });
        }

        res.render('owner-manage', { 
            title: 'Manage Shop | BarberSaaS', 
            shop, 
            services, 
            employees 
        });
    } catch (error) {
        console.error("Manage Page Error:", error);
        res.status(500).send("Server Error while loading management page");
    }
};

// 2. Setup or Update Shop Details
exports.setupShop = async (req, res) => {
    try {
        const ownerId = res.locals.user._id;
        const { shopName, address, openingTime, closingTime, longitude, latitude, facilities } = req.body;

        // Facilities ko array mein convert karo
        let facilitiesArray = facilities ? facilities.split(',').map(item => item.trim()) : [];
        
        // Image check (Cloudinary path)
        let bannerImage = req.file ? req.file.path : 'default-shop.jpg';

        // Location object for MongoDB GeoJSON
        const locationInfo = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        let shop = await Shop.findOne({ ownerId });
        if (shop) {
            // Update Existing Shop
            shop.shopName = shopName;
            shop.address = address;
            shop.openingTime = openingTime;
            shop.closingTime = closingTime;
            shop.location = locationInfo;
            shop.facilities = facilitiesArray;
            if (req.file) shop.bannerImage = bannerImage; // Nayi image hai toh update karo
            await shop.save();
        } else {
            // Create New Shop
            await Shop.create({
                ownerId, 
                shopName, 
                address, 
                openingTime, 
                closingTime, 
                location: locationInfo, 
                bannerImage, 
                facilities: facilitiesArray
            });
        }
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Shop Setup Error:", error);
        res.status(400).send("Error setting up shop. Make sure coordinates are numbers.");
    }
};

// 3. Add New Service
exports.addService = async (req, res) => {
    try {
        const { serviceName, price, duration, description } = req.body;
        const shop = await Shop.findOne({ ownerId: res.locals.user._id });

        if (!shop) return res.status(400).send("Please setup your shop profile first.");

        let serviceImage = req.file ? req.file.path : 'default-service.jpg';

        await Service.create({
            shopId: shop._id, 
            serviceName, 
            price, 
            duration, 
            description, 
            serviceImage
        });
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Add Service Error:", error);
        res.status(400).send("Error adding service");
    }
};

// 4. Add New Employee (Updated with all model fields)
exports.addEmployee = async (req, res) => {
    try {
        const { name, specialty, phone, isAvailable } = req.body;
        const shop = await Shop.findOne({ ownerId: res.locals.user._id });

        if (!shop) return res.status(400).send("Please setup your shop first.");

        await Employee.create({
            shopId: shop._id, 
            name, 
            specialty, 
            phone,
            isAvailable: isAvailable === 'true' // Boolean conversion
        });
        
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Add Employee Error:", error);
        res.status(400).send("Error adding employee");
    }
};

// ==========================================
// PART 2: BOOKING REQUESTS (Accept/Reject/Reschedule)
// ==========================================

// 5. Render "Requests" Page
exports.getOwnerRequests = async (req, res) => {
    try {
        const shop = await Shop.findOne({ ownerId: res.locals.user._id });
        if (!shop) {
            return res.render('owner-requests', { 
                title: 'Requests', 
                appointments: [], 
                error: 'Please setup your shop details first' 
            });
        }

        // Saari bookings fetch karo aur customer/service ki details populate karo
        const appointments = await Appointment.find({ shopId: shop._id })
            .populate('userId', 'name phone email')
            .populate('serviceId', 'serviceName price duration')
            .sort({ createdAt: -1 });

        res.render('owner-requests', { 
            title: 'Booking Requests', 
            appointments, 
            error: null 
        });
    } catch (error) {
        console.error("Requests Page Error:", error);
        res.status(500).send("Server Error while loading requests");
    }
};

// 6. Handle Appointment Status Update (Accept, Reject, or Reschedule)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status, proposedDate, proposedTime } = req.body;
        
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).send("Appointment not found");

        appointment.status = status; // 'Accepted', 'Rejected', or 'Rescheduled'
        
        // Agar reschedule kiya hai, toh naya date/time save karo
        if (status === 'Rescheduled') {
            appointment.proposedDate = proposedDate;
            appointment.proposedTime = proposedTime;
        }

        await appointment.save();
        res.redirect('/owner/requests');
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(400).send("Error updating appointment status");
    }
};



// controllers/ownerController.js mein ye function add karo

exports.getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = res.locals.user._id;
        const shop = await Shop.findOne({ ownerId });
        
        let services = [];
        if (shop) {
            services = await Service.find({ shopId: shop._id });
        }

        // Render karo owner-dashboard file ko
        res.render('owner-dashboard', { 
            title: 'Owner Dashboard | BarberSaaS', 
            shop, 
            services 
        });
    } catch (error) {
        console.log("Dashboard Error:", error);
        res.status(500).send("Server Error");
    }
};