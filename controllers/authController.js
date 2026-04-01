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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">Email Already Registered! <br><br> <a href="/login">Go to Login</a></h3>');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ name, email, password: hashedPassword, phone, role: 'Customer' });
        res.redirect('/login');
    } catch (error) {
        res.status(500).send("Error signing up.");
    }
};

// Professional Login Logic with White Theme Premium Modal
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">User not found!</h3>');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('<h3 style="color:red;text-align:center;margin-top:50px;">Incorrect Password!</h3>');

        // 🔴 PROFESSIONAL SUBSCRIPTION CHECK (WHITE THEME)
        if (user.role === 'BarberOwner') {
            const today = new Date();
            if (user.isActive === false || (user.subscriptionEnd && new Date(user.subscriptionEnd) < today)) {
                
                const professionalExpiredHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
                        body { 
                            background: #f8fafc; 
                            height: 100vh; display: flex; align-items: center; justify-content: center; 
                            background-image: radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.05) 0, transparent 50%), 
                                              radial-gradient(at 50% 0%, rgba(139, 92, 246, 0.05) 0, transparent 50%);
                        }
                        .premium-modal {
                            background: #ffffff;
                            padding: 40px;
                            border-radius: 32px;
                            text-align: center;
                            max-width: 440px; width: 90%;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0,0,0,0.03);
                            animation: modalScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        }
                        @keyframes modalScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                        
                        .alert-icon {
                            width: 72px; height: 72px; background: #fff7ed;
                            color: #f59e0b; border-radius: 20px; display: flex; align-items: center; justify-content: center;
                            font-size: 32px; margin: 0 auto 24px;
                            border: 1px solid #ffedd5;
                        }
                        h2 { color: #0f172a; font-size: 1.6rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
                        p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 30px; padding: 0 10px; }
                        
                        .admin-info-card {
                            background: #f1f5f9;
                            border-radius: 24px; padding: 24px; margin-bottom: 32px;
                            border: 1px solid #e2e8f0;
                        }
                        .admin-label { color: #3b82f6; text-transform: uppercase; font-size: 0.7rem; font-weight: 800; letter-spacing: 1.2px; margin-bottom: 8px; display: block; }
                        .admin-name { color: #0f172a; font-size: 1.15rem; font-weight: 700; display: block; margin-bottom: 4px; }
                        .admin-phone { color: #0f172a; font-size: 1.25rem; font-weight: 800; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
                        .admin-phone i { color: #10b981; font-size: 1rem; }
                        
                        .action-btn {
                            background: #0f172a; color: #ffffff; text-decoration: none;
                            padding: 16px 30px; border-radius: 16px; font-weight: 700;
                            display: block; transition: all 0.2s ease; font-size: 1rem;
                        }
                        .action-btn:hover { background: #3b82f6; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2); }
                    </style>
                </head>
                <body>
                    <div class="premium-modal">
                        <div class="alert-icon"><i class="fas fa-calendar-times"></i></div>
                        <h2>Plan Expired</h2>
                        <p>Your subscription has ended. Access to your shop dashboard and bookings is currently restricted.</p>
                        
                        <div class="admin-info-card">
                            <span class="admin-label">Contact for Activation</span>
                            <span class="admin-name">Aniket Gupta (Admin)</span>
                            <a href="tel:8770191425" class="admin-phone">
                                <i class="fas fa-phone-alt"></i> +91 8770191425
                            </a>
                        </div>
                        
                        <a href="/login" class="action-btn">Return to Login</a>
                    </div>
                </body>
                </html>
                `;
                return res.status(403).send(professionalExpiredHTML);
            }
        }

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

        if (user.role === 'SuperAdmin') return res.redirect('/admin/dashboard');
        if (user.role === 'BarberOwner') return res.redirect('/owner/manage');
        
        res.redirect('/');
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).send("Login Error");
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};