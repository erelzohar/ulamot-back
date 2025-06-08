import { Request, Response } from 'express';
import { Types, Schema } from 'mongoose';
import Booking from '../models/Booking';
import User from '../models/User';
import Venue from '../models/Venue';
import { ApiResponse } from '../types';

// Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('venueId', 'name location');
    
    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings,
      message: 'Bookings retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('venueId');
    
    if (!booking) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Booking not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof booking> = {
      success: true,
      data: booking,
      message: 'Booking retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId, venueId, eventDate, packageId, guestCount, specialRequests } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Venue not found',
      };
      return res.status(404).json(response);
    }
    
    // Check if package exists
    const selectedPackage = venue.pricing.packages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Package not found for this venue',
      };
      return res.status(404).json(response);
    }
    
    // Check if guest count is within venue capacity
    if (guestCount < venue.capacity.min || guestCount > venue.capacity.max) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Guest count must be between ${venue.capacity.min} and ${venue.capacity.max}`,
      };
      return res.status(400).json(response);
    }
    
    // Check venue availability for the requested date
    const eventDateObj = new Date(eventDate);
    const isVenueAvailable = venue.availability.some(slot => {
      const startDate = new Date(slot.startDate);
      const endDate = new Date(slot.endDate);
      return (
        eventDateObj >= startDate && 
        eventDateObj <= endDate && 
        !slot.isBooked
      );
    });
    
    if (!isVenueAvailable) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Venue is not available on the requested date',
      };
      return res.status(400).json(response);
    }
    
    // Create new booking
    const newBooking = new Booking({
      userId,
      venueId,
      eventDate: eventDateObj,
      packageId,
      guestCount,
      totalPrice: selectedPackage.price,
      status: 'pending',
      paymentStatus: 'unpaid',
      specialRequests
    });
    
    const savedBooking = await newBooking.save();
    
    // Update user's bookings
    user.bookings.push(savedBooking._id as unknown as Schema.Types.ObjectId);
    await user.save();
    
    // Update venue availability
    venue.availability.forEach(slot => {
      const startDate = new Date(slot.startDate);
      const endDate = new Date(slot.endDate);
      if (
        eventDateObj >= startDate && 
        eventDateObj <= endDate
      ) {
        slot.isBooked = true;
      }
    });
    await venue.save();
    
    const response: ApiResponse<typeof savedBooking> = {
      success: true,
      data: savedBooking,
      message: 'Booking created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Update a booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Booking not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof updatedBooking> = {
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid status value',
      };
      return res.status(400).json(response);
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Booking not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof updatedBooking> = {
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update booking status',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Delete a booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Booking not found',
      };
      return res.status(404).json(response);
    }
    
    // Remove booking from user's bookings
    await User.findByIdAndUpdate(
      booking.userId,
      { $pull: { bookings: booking._id } }
    );
    
    // Update venue availability
    const venue = await Venue.findById(booking.venueId);
    if (venue) {
      const eventDateObj = new Date(booking.eventDate);
      venue.availability.forEach(slot => {
        const startDate = new Date(slot.startDate);
        const endDate = new Date(slot.endDate);
        if (
          eventDateObj >= startDate && 
          eventDateObj <= endDate
        ) {
          slot.isBooked = false;
        }
      });
      await venue.save();
    }
    
    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Booking deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Get bookings by user ID
export const getBookingsByUser = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('venueId', 'name location images');
    
    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings,
      message: 'User bookings retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve user bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Get bookings by venue ID
export const getBookingsByVenue = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ venueId: req.params.venueId })
      .populate('userId', 'name email phone');
    
    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings,
      message: 'Venue bookings retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve venue bookings',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};