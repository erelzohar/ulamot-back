import mongoose, { Schema, Document } from 'mongoose';
import { Host as HostType } from '../types';

// Interface for the Host document
export interface HostDocument extends Omit<HostType, 'id' | 'venues'>, Document {
  venues: Schema.Types.ObjectId[];
  password: string; // For authentication
}

// Schema for Address
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

// Main Host Schema
const HostSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Don't include password in query results by default
  name: { type: String, required: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { 
    type: String, 
    required: true,
    enum: ['individual', 'company', 'event-planner', 'hotel', 'restaurant', 'other']
  },
  venues: [{ type: Schema.Types.ObjectId, ref: 'Venue' }],
  verified: { type: Boolean, default: false },
  profileImage: { type: String },
  address: AddressSchema
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password; // Ensure password is never sent to client
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model<HostDocument>('Host', HostSchema); 