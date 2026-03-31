const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    description: { type: String },
    serviceImage: { type: String, default: 'default-service.jpg' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);