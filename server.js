// 1. Sabse pehle environment variables load karo
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const userRoutes = require('./routes/userRoutes');
const indexRoutes = require('./routes/indexRoutes');

const { checkUser } = require('./middlewares/auth');
const startCronJobs = require('./utils/cronJobs'); // 🌟 NAYA: Cron Job Import

// Connect to Database
connectDB();

const app = express();

// Middlewares setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// View Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🌟 FIX: Naye Express update ke hisab se (bina '*' ke)
app.use(checkUser);

// Mount All Routes
app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use('/owner', ownerRoutes);
app.use('/user', userRoutes);
app.use('/', indexRoutes);

// 🌟 NAYA: Background Task Start karo
startCronJobs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT} 🚀`);
});