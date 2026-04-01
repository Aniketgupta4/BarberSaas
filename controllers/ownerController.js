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
        // 🔴 Naya: isOpen added to destructuring
        const { shopName, address, openingTime, closingTime, longitude, latitude, facilities, isOpen } = req.body;

        let facilitiesArray = facilities ? facilities.split(',').map(item => item.trim()) : [];
        let bannerImage = req.file ? req.file.path : 'default-shop.jpg';

        const locationInfo = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        let shop = await Shop.findOne({ ownerId });
        
        // Convert isOpen from form string ('on') to boolean
        const shopStatus = isOpen === 'on' || isOpen === true; 

        if (shop) {
            shop.shopName = shopName;
            shop.address = address;
            shop.openingTime = openingTime;
            shop.closingTime = closingTime;
            shop.location = locationInfo;
            shop.facilities = facilitiesArray;
            shop.isOpen = shopStatus; // 🔴 Update status
            if (req.file) shop.bannerImage = bannerImage;
            await shop.save();
        } else {
            await Shop.create({
                ownerId, 
                shopName, 
                address, 
                openingTime, 
                closingTime, 
                location: locationInfo, 
                bannerImage, 
                facilities: facilitiesArray,
                isOpen: shopStatus // 🔴 Set status
            });
        }
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Shop Setup Error:", error);
        res.status(400).send("Error setting up shop. Make sure coordinates are numbers.");
    }
};

// 🔴 NAYA FUNCTION: Toggle Shop Open/Closed Status
exports.toggleShopStatus = async (req, res) => {
    try {
        const ownerId = res.locals.user._id;
        const shop = await Shop.findOne({ ownerId });

        if (!shop) {
            return res.status(404).send("Shop not found");
        }

        // Flip the status (true to false, false to true)
        shop.isOpen = !shop.isOpen;
        await shop.save();

        console.log(`Shop status changed to: ${shop.isOpen ? 'OPEN' : 'CLOSED'}`);
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Toggle Status Error:", error);
        res.status(500).send("Server Error changing status");
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

// 4. Add New Employee
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
            isAvailable: isAvailable === 'true'
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
        const ownerId = res.locals.user._id;
        const shop = await Shop.findOne({ ownerId });

        if (!shop) {
            return res.render('owner-requests', { appointments: [], error: 'Please setup your shop profile first.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 5; 
        const skip = (page - 1) * limit;

        const totalAppointments = await Appointment.countDocuments({ shopId: shop._id });
        const totalPages = Math.ceil(totalAppointments / limit);

        const appointments = await Appointment.find({ shopId: shop._id })
            .populate('userId', 'name phone email')
            .populate('serviceId', 'serviceName price duration')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('owner-requests', { 
            title: 'Booking Requests', 
            appointments,
            currentPage: page, 
            totalPages
        });
    } catch (error) {
        console.error("Requests Page Error:", error);
        res.status(500).send("Server Error");
    }
};

// 6. Handle Appointment Status Update
exports.updateRequest = async (req, res) => {
    try {
        const { appointmentId, status, proposedDate, proposedTime } = req.body;
        let updateData = { status: status };

        if (status === 'Rescheduled' && proposedDate && proposedTime) {
            updateData.bookingDate = proposedDate;
            updateData.bookingTime = proposedTime;
        }

        await Appointment.findByIdAndUpdate(appointmentId, updateData);
        res.redirect('/owner/requests'); 
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send("Update fail ho gaya bhai!");
    }
};

// 7. Get Dashboard (WITH ADVANCED CUSTOMER & REVENUE ANALYTICS)
exports.getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = res.locals.user._id;
        const shop = await Shop.findOne({ ownerId });
        
        let services = [];
        let analytics = {
            todayRevenue: 0,
            weekRevenue: 0,
            monthRevenue: 0,
            todayCustomers: 0,
            weekCustomers: 0,   // 🔴 NEW: Weekly Customers
            monthCustomers: 0,  // 🔴 NEW: Monthly Customers
            totalCompleted: 0
        };

        if (shop) {
            services = await Service.find({ shopId: shop._id });
            
            const completedAppointments = await Appointment.find({ 
                shopId: shop._id, 
                status: 'Completed' 
            }).populate('serviceId');

            analytics.totalCompleted = completedAppointments.length;

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            completedAppointments.forEach(app => {
                const price = app.serviceId ? app.serviceId.price : 0; 
                const appDate = new Date(app.updatedAt); 

                // Today's Calc (Revenue + Customers)
                if (appDate >= startOfDay) {
                    analytics.todayRevenue += price;
                    analytics.todayCustomers += 1;
                }
                
                // Weekly Calc (Revenue + Customers)
                if (appDate >= startOfWeek) {
                    analytics.weekRevenue += price;
                    analytics.weekCustomers += 1;
                }

                // Monthly Calc (Revenue + Customers)
                if (appDate >= startOfMonth) {
                    analytics.monthRevenue += price;
                    analytics.monthCustomers += 1;
                }
            });
        }

        res.render('owner-dashboard', { 
            title: 'Analytics Dashboard | BarberSaaS', 
            shop, 
            services,
            analytics 
        });
    } catch (error) {
        console.log("Dashboard Error:", error);
        res.status(500).send("Server Error in loading Dashboard");
    }
};

// 8. Delete Employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        await Employee.findByIdAndDelete(employeeId);
        res.redirect('/owner/manage');
    } catch (error) {
        console.error("Delete Employee Error:", error);
        res.status(500).send("Internal Server Error: Staff delete nahi ho paya.");
    }
};

// 9. Delete Service
exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id; 
        await Service.findByIdAndDelete(serviceId);
        res.redirect('/owner/manage'); 
    } catch (error) {
        console.error("Delete Service Error:", error);
        res.status(500).send("Server Error: Service delete nahi ho payi.");
    }
};

// 10. Delete Booking Request
exports.deleteRequest = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        await Appointment.findByIdAndDelete(appointmentId);
        res.redirect('/owner/requests');
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Delete nahi ho paya.");
    }
};

// ==========================================
// PART 3: PUBLIC SEARCH (NEW - WORKING GPS)
// ==========================================



// ==========================================
// PART 3: PUBLIC SEARCH (WORKING GPS & EXPIRY CHECK)
// ==========================================

exports.getHome = async (req, res) => {
    try {
        const { query, lat, lng } = req.query;
        let findQuery = {};

        if (query) {
            findQuery.$or = [
                { shopName: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } },
                { facilities: { $regex: query, $options: 'i' } }
            ];
        }

        let shops;

        // GPS Logic
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            shops = await Shop.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: "dist.calculated",
                        maxDistance: 20000,
                        query: findQuery,
                        spherical: true
                    }
                },
                // 🔴 Owner Details Lookup (For Expiry Check)
                {
                    $lookup: {
                        from: "users", // Database collection name
                        localField: "ownerId",
                        foreignField: "_id",
                        as: "ownerId" // Alias
                    }
                },
                { $unwind: "$ownerId" }
            ]);
        } else {
            // Normal Search with Population
            shops = await Shop.find(findQuery)
                .populate('ownerId') // 🔴 Owner ka data populate karo
                .sort({ createdAt: -1 });
        }

        res.render('home', { 
            shops, 
            query: query || '', 
            user: res.locals.user || null 
        });

    } catch (error) {
        console.error("Home Search Error:", error);
        res.status(500).send("Bhai search failed ho gayi!");
    }
};