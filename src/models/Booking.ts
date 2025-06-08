import mongoose, { Schema, Document } from 'mongoose';
import { Booking as BookingType } from '../types';

// Interface for the Booking document
export interface BookingDocument extends Omit<BookingType, 'id' | 'venueId' | 'userId'>, Document {
  venueId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
}

// Main Booking Schema
const BookingSchema = new Schema({
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventDate: { type: Date, required: true },
  packageId: { type: String, required: true },
  guestCount: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  totalPrice: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['unpaid', 'partial', 'paid'], 
    default: 'unpaid' 
  },
  createdAt: { type: Date, default: Date.now },
  specialRequests: { type: String }
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

export default mongoose.model<BookingDocument>('Booking', BookingSchema);