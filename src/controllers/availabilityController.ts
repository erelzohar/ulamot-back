import { Request, Response } from 'express';
import AvailabilityModel, { IAvailability } from '../models/Availability';
import VenueModel from '../models/Venue';
import mongoose from 'mongoose';
import { ApiResponse } from '../types'; // Assuming you have a generic ApiResponse type

// Helper function to check for overlapping availability
const checkOverlappingAvailability = async (
  venueId: mongoose.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  excludeAvailabilityId?: mongoose.Types.ObjectId
): Promise<boolean> => {
  const query: any = {
    venueId,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlaps
    ],
  };
  if (excludeAvailabilityId) {
    query._id = { $ne: excludeAvailabilityId };
  }
  const existing = await AvailabilityModel.findOne(query);
  return !!existing;
};

// Get all availability for a venue
export const getAvailabilityForVenue = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { startDate, endDate } = req.query; // Optional query params to filter by date range

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ success: false, error: 'Invalid venue ID' });
    }

    const query: any = { venueId };
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate as string) };
      query.endTime = { $lte: new Date(endDate as string) };
    } else if (startDate) {
      query.startTime = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.endTime = { $lte: new Date(endDate as string) };
    }

    const availabilitySlots = await AvailabilityModel.find(query).sort({ startTime: 'asc' });
    
    const response: ApiResponse<IAvailability[]> = {
        success: true,
        data: availabilitySlots,
        message: 'Availability retrieved successfully'
    };
    res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve availability', 
        message: error.message 
    });
  }
};

// Add new availability for a venue
export const addAvailability = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { startTime, endTime, title, isBooked, bookingId } = req.body;
    const hostId = (req.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ success: false, error: 'Invalid venue ID' });
    }

    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }
    if (venue.hostId?.toString() !== hostId) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (newStartTime >= newEndTime) {
      return res.status(400).json({ success: false, error: 'End time must be after start time.' });
    }

    if (await checkOverlappingAvailability(new mongoose.Types.ObjectId(venueId), newStartTime, newEndTime)) {
      return res.status(409).json({ 
          success: false, 
          error: 'Conflict: This time slot overlaps with an existing availability entry.' 
        });
    }

    const newAvailability = new AvailabilityModel({
      venueId,
      startTime: newStartTime,
      endTime: newEndTime,
      title,
      isBooked,
      bookingId: bookingId || null,
    });

    await newAvailability.save();
    const response: ApiResponse<IAvailability> = {
        success: true,
        data: newAvailability,
        message: 'Availability added successfully'
    };
    res.status(201).json(response);

  } catch (error: any) {
    res.status(500).json({ 
        success: false, 
        error: 'Failed to add availability', 
        message: error.message 
    });
  }
};

// Update availability
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { venueId, availabilityId } = req.params;
    const { startTime, endTime, title, isBooked, bookingId } = req.body;
    const hostId = (req.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(venueId) || !mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ success: false, error: 'Invalid venue or availability ID' });
    }

    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }
    if (venue.hostId?.toString() !== hostId) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
    }

    const availabilityToUpdate = await AvailabilityModel.findById(availabilityId);
    if (!availabilityToUpdate || availabilityToUpdate.venueId.toString() !== venueId) {
        return res.status(404).json({ success: false, error: 'Availability slot not found for this venue.'});
    }

    const newStartTime = startTime ? new Date(startTime) : availabilityToUpdate.startTime;
    const newEndTime = endTime ? new Date(endTime) : availabilityToUpdate.endTime;

    if (newStartTime >= newEndTime) {
      return res.status(400).json({ success: false, error: 'End time must be after start time.' });
    }

    if (await checkOverlappingAvailability(new mongoose.Types.ObjectId(venueId), newStartTime, newEndTime, new mongoose.Types.ObjectId(availabilityId))) {
      return res.status(409).json({ 
          success: false, 
          error: 'Conflict: This time slot overlaps with another availability entry.' 
        });
    }

    availabilityToUpdate.startTime = newStartTime;
    availabilityToUpdate.endTime = newEndTime;
    if (title !== undefined) availabilityToUpdate.title = title;
    if (isBooked !== undefined) availabilityToUpdate.isBooked = isBooked;
    if (bookingId !== undefined) availabilityToUpdate.bookingId = bookingId || null;
    
    await availabilityToUpdate.save();
    const response: ApiResponse<IAvailability> = {
        success: true,
        data: availabilityToUpdate,
        message: 'Availability updated successfully'
    };
    res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ 
        success: false, 
        error: 'Failed to update availability', 
        message: error.message 
    });
  }
};

// Delete availability
export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const { venueId, availabilityId } = req.params;
    const hostId = (req.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(venueId) || !mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ success: false, error: 'Invalid venue or availability ID' });
    }

    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }
     if (venue.hostId?.toString() !== hostId) {
        return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
    }

    const result = await AvailabilityModel.findOneAndDelete({ _id: availabilityId, venueId: venueId });

    if (!result) {
        return res.status(404).json({ success: false, error: 'Availability slot not found or does not belong to this venue.' });
    }
    
    const response: ApiResponse<null> = {
        success: true,
        message: 'Availability deleted successfully'
    };
    res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ 
        success: false, 
        error: 'Failed to delete availability', 
        message: error.message 
    });
  }
}; 