const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    bannerImage: { type: String, default: 'default-shop.jpg' },
    address: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [Longitude, Latitude]
    },
    facilities: { type: [String], default: [] } // e.g., AC, WiFi
}, { timestamps: true });

// GeoJSON index for location search (aas-paas ki dukaane dhoondhne ke liye)
shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);