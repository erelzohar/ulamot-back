"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema for Location
const LocationSchema = new mongoose_1.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    }
});
// Schema for Capacity
const CapacitySchema = new mongoose_1.Schema({
    min: { type: Number, required: true },
    max: { type: Number, required: true }
});
// Schema for Package
const PackageSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    items: {
        type: [{ type: String, required: true }],
        default: []
    }
});
// Schema for Pricing
const PricingSchema = new mongoose_1.Schema({
    basePrice: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    pricingType: { type: String, enum: ['fixed', 'package'], default: 'fixed' },
    dynamicPricing: {
        type: {
            weekendPricing: {
                enabled: { type: Boolean, default: false },
                type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
                value: { type: Number, default: 0 }, // Either percentage increase or fixed amount
            },
            lastMinuteDiscount: {
                enabled: { type: Boolean, default: false },
                type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
                value: { type: Number, default: 0 }, // Either percentage discount or fixed amount
                daysBeforeEvent: { type: Number, default: 7 } // Number of days before event to apply discount
            }
        },
        default: {
            weekendPricing: {
                enabled: false,
                type: 'percentage',
                value: 0
            },
            lastMinuteDiscount: {
                enabled: false,
                type: 'percentage',
                value: 0,
                daysBeforeEvent: 7
            }
        }
    },
    packages: {
        type: [PackageSchema],
        default: []
    }
});
// Schema for Image
const ImageSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String, required: true },
    isPrimary: { type: Boolean, default: false }
});
// Schema for Availability
const AvailabilitySchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isBooked: { type: Boolean, default: false }
});
// Schema for Review
const ReviewSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
// Schema for ContactInfo
const ContactInfoSchema = new mongoose_1.Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        pinterest: { type: String }
    }
});
// Main Venue Schema
const VenueSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: LocationSchema, required: true },
    type: [{ type: String, required: true }],
    capacity: { type: CapacitySchema, required: true },
    pricing: { type: PricingSchema, required: true },
    amenities: [{ type: String, required: true }],
    images: [ImageSchema],
    availability: [AvailabilitySchema],
    reviews: [ReviewSchema],
    contactInfo: { type: ContactInfoSchema, required: true },
    virtualTourUrl: { type: String },
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Host' }
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
exports.default = mongoose_1.default.model('Venue', VenueSchema);
