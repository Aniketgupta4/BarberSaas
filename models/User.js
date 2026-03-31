const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['SuperAdmin', 'BarberOwner', 'Customer'], 
        default: 'Customer' 
    },
    // Barber Owner ke liye subscription details
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);