const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token Generator Function
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Render Pages
exports.getLogin = (req, res) => res.render('login', { title: 'Login - BarberSaaS' });
exports.getSignup = (req, res) => res.render('signup', { title: 'Signup - BarberSaaS' });

// Customer Signup Logic
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Duplicate Email Check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">Email Already Registered! <br><br> <a href="/login">Go to Login</a></h3>');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ 
            name, email, password: hashedPassword, phone, role: 'Customer' 
        });

        res.redirect('/login');
    } catch (error) {
        console.log("Signup Error:", error);
        res.status(500).send("Error signing up.");
    }
};

// Common Login Logic (For Admin, Owner, Customer)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">User not found!</h3>');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">Incorrect Password!</h3>');

        // Login Success - Create Cookie
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        // ROLE KE HISAAB SE REDIRECT (Yahi wo jadoo hai jo sabko apne dashboard pe bhejega)
        if (user.role === 'SuperAdmin') return res.redirect('/admin/dashboard');
        if (user.role === 'BarberOwner') return res.redirect('/owner/manage');
        
        // Default (Customer)
        res.redirect('/');
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).send("Login Error");
    }
};

// Logout Logic
exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};