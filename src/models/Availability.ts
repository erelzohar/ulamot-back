import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
  venueId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  title?: string; // e.g., "Booked", "Maintenance", "Owner Blocked"
  isBooked: boolean; // True if it's an actual booking, false for general unavailability
  bookingId?: mongoose.Types.ObjectId; // Optional link to a booking record
  googleCalendarEventId?: string; // For Google Calendar sync
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema: Schema = new Schema(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking', // Assuming you have a Booking model
      default: null,
    },
    googleCalendarEventId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure that for a given venue, there are no overlapping availability slots.
// This is a more complex validation and might be better handled at the application level
// or with more sophisticated database queries/constraints if your DB supports it well.
// For now, we'll rely on application logic to prevent overlaps.

// Index for efficient querying of availability for a venue and time range
AvailabilitySchema.index({ venueId: 1, startTime: 1, endTime: 1 });

export default mongoose.model<IAvailability>('Availability', AvailabilitySchema); 