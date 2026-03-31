const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true }, // e.g., "Hair Expert", "Massage Therapist"
    phone: { type: String },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);