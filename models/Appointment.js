const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Customer
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected', 'Rescheduled', 'Completed'], 
        default: 'Pending' 
    },
    // Agar Barber reschedule karta hai toh naya time yahan aayega
    proposedTime: { type: String, default: null },
    proposedDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);