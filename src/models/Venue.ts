import mongoose, { Schema, Document } from 'mongoose';
import { Venue as VenueType } from '../types';

// Interface for the Venue document
export interface VenueDocument extends Omit<VenueType, 'id'>, Document {}

// Schema for Location
const LocationSchema = new Schema({
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
const CapacitySchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true }
});

// Schema for Package
const PackageSchema = new Schema({
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
const PricingSchema = new Schema({
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
const ImageSchema = new Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  alt: { type: String, required: true },
  isPrimary: { type: Boolean, default: false }
});

// Schema for Availability
const AvailabilitySchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isBooked: { type: Boolean, default: false }
});

// Schema for Review
const ReviewSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Schema for ContactInfo
const ContactInfoSchema = new Schema({
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
const VenueSchema = new Schema({
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
  hostId: { type: Schema.Types.ObjectId, ref: 'Host' }
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

export default mongoose.model<VenueDocument>('Venue', VenueSchema);