const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is logged in
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

// Check current user details (EJS pages ke liye)
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

// Check User Role (Bina permission koi admin/owner page na khol paye)
const requireRole = (role) => {
    return (req, res, next) => {
        if (res.locals.user && res.locals.user.role === role) {
            next();
        } else {
            res.status(403).send(`
                <h2 style="text-align:center; color:red; margin-top:50px;">Access Denied 🛑</h2>
                <p style="text-align:center;">You do not have permission to view this page.</p>
                <div style="text-align:center;"><a href="/">Go to Home</a></div>
            `);
        }
    };
};

module.exports = { requireAuth, checkUser, requireRole };