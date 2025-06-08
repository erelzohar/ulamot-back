"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingsByVenue = exports.getBookingsByUser = exports.deleteBooking = exports.updateBookingStatus = exports.updateBooking = exports.createBooking = exports.getBookingById = exports.getAllBookings = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Venue_1 = __importDefault(require("../models/Venue"));
// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find()
            .populate('userId', 'name email phone')
            .populate('venueId', 'name location');
        const response = {
            success: true,
            data: bookings,
            message: 'Bookings retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve bookings',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getAllBookings = getAllBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('venueId');
        if (!booking) {
            const response = {
                success: false,
                error: 'Booking not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: booking,
            message: 'Booking retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getBookingById = getBookingById;
// Create a new booking
const createBooking = async (req, res) => {
    try {
        const { userId, venueId, eventDate, packageId, guestCount, specialRequests } = req.body;
        // Check if user exists
        const user = await User_1.default.findById(userId);
        if (!user) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        // Check if venue exists
        const venue = await Venue_1.default.findById(venueId);
        if (!venue) {
            const response = {
                success: false,
                error: 'Venue not found',
            };
            return res.status(404).json(response);
        }
        // Check if package exists
        const selectedPackage = venue.pricing.packages.find(pkg => pkg.id === packageId);
        if (!selectedPackage) {
            const response = {
                success: false,
                error: 'Package not found for this venue',
            };
            return res.status(404).json(response);
        }
        // Check if guest count is within venue capacity
        if (guestCount < venue.capacity.min || guestCount > venue.capacity.max) {
            const response = {
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
            return (eventDateObj >= startDate &&
                eventDateObj <= endDate &&
                !slot.isBooked);
        });
        if (!isVenueAvailable) {
            const response = {
                success: false,
                error: 'Venue is not available on the requested date',
            };
            return res.status(400).json(response);
        }
        // Create new booking
        const newBooking = new Booking_1.default({
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
        user.bookings.push(savedBooking._id);
        await user.save();
        // Update venue availability
        venue.availability.forEach(slot => {
            const startDate = new Date(slot.startDate);
            const endDate = new Date(slot.endDate);
            if (eventDateObj >= startDate &&
                eventDateObj <= endDate) {
                slot.isBooked = true;
            }
        });
        await venue.save();
        const response = {
            success: true,
            data: savedBooking,
            message: 'Booking created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to create booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createBooking = createBooking;
// Update a booking
const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBooking) {
            const response = {
                success: false,
                error: 'Booking not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedBooking,
            message: 'Booking updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to update booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateBooking = updateBooking;
// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            const response = {
                success: false,
                error: 'Invalid status value',
            };
            return res.status(400).json(response);
        }
        const updatedBooking = await Booking_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!updatedBooking) {
            const response = {
                success: false,
                error: 'Booking not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedBooking,
            message: 'Booking status updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to update booking status',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Delete a booking
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            const response = {
                success: false,
                error: 'Booking not found',
            };
            return res.status(404).json(response);
        }
        // Remove booking from user's bookings
        await User_1.default.findByIdAndUpdate(booking.userId, { $pull: { bookings: booking._id } });
        // Update venue availability
        const venue = await Venue_1.default.findById(booking.venueId);
        if (venue) {
            const eventDateObj = new Date(booking.eventDate);
            venue.availability.forEach(slot => {
                const startDate = new Date(slot.startDate);
                const endDate = new Date(slot.endDate);
                if (eventDateObj >= startDate &&
                    eventDateObj <= endDate) {
                    slot.isBooked = false;
                }
            });
            await venue.save();
        }
        // Delete the booking
        await Booking_1.default.findByIdAndDelete(req.params.id);
        const response = {
            success: true,
            message: 'Booking deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to delete booking',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.deleteBooking = deleteBooking;
// Get bookings by user ID
const getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ userId: req.params.userId })
            .populate('venueId', 'name location images');
        const response = {
            success: true,
            data: bookings,
            message: 'User bookings retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve user bookings',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getBookingsByUser = getBookingsByUser;
// Get bookings by venue ID
const getBookingsByVenue = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ venueId: req.params.venueId })
            .populate('userId', 'name email phone');
        const response = {
            success: true,
            data: bookings,
            message: 'Venue bookings retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve venue bookings',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getBookingsByVenue = getBookingsByVenue;
