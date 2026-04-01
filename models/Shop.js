const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    bannerImage: { type: String, default: 'default-shop.jpg' },
    address: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    // Shop Open/Close status ke liye
    isOpen: { type: Boolean, default: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [Longitude, Latitude]
    },
    facilities: { type: [String], default: [] },
    
    // 🔴 NAYI FIELDS: Ratings & Reviews ke liye 🔴
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

// GeoJSON index for location search (aas-paas ki dukaane dhoondhne ke liye)
shopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shop', shopSchema);