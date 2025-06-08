import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '../types';

// Interface for the User document
export interface UserDocument extends Omit<UserType, 'id' | 'bookings'>, Document {
  bookings: Schema.Types.ObjectId[];
  password: string;
}

// Main User Schema
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  favoriteVenues: [{ type: Schema.Types.ObjectId, ref: 'Venue' }],
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }]
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Don't expose password in JSON
      return ret;
    }
  }
});

export default mongoose.model<UserDocument>('User', UserSchema);