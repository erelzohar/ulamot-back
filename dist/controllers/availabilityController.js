"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvailability = exports.updateAvailability = exports.addAvailability = exports.getAvailabilityForVenue = void 0;
const Availability_1 = __importDefault(require("../models/Availability"));
const Venue_1 = __importDefault(require("../models/Venue"));
const mongoose_1 = __importDefault(require("mongoose"));
// Helper function to check for overlapping availability
const checkOverlappingAvailability = async (venueId, startTime, endTime, excludeAvailabilityId) => {
    const query = {
        venueId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlaps
        ],
    };
    if (excludeAvailabilityId) {
        query._id = { $ne: excludeAvailabilityId };
    }
    const existing = await Availability_1.default.findOne(query);
    return !!existing;
};
// Get all availability for a venue
const getAvailabilityForVenue = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { startDate, endDate } = req.query; // Optional query params to filter by date range
        if (!mongoose_1.default.Types.ObjectId.isValid(venueId)) {
            return res.status(400).json({ success: false, error: 'Invalid venue ID' });
        }
        const query = { venueId };
        if (startDate && endDate) {
            query.startTime = { $gte: new Date(startDate) };
            query.endTime = { $lte: new Date(endDate) };
        }
        else if (startDate) {
            query.startTime = { $gte: new Date(startDate) };
        }
        else if (endDate) {
            query.endTime = { $lte: new Date(endDate) };
        }
        const availabilitySlots = await Availability_1.default.find(query).sort({ startTime: 'asc' });
        const response = {
            success: true,
            data: availabilitySlots,
            message: 'Availability retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve availability',
            message: error.message
        });
    }
};
exports.getAvailabilityForVenue = getAvailabilityForVenue;
// Add new availability for a venue
const addAvailability = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { startTime, endTime, title, isBooked, bookingId } = req.body;
        const hostId = req.user.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(venueId)) {
            return res.status(400).json({ success: false, error: 'Invalid venue ID' });
        }
        const venue = await Venue_1.default.findById(venueId);
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
        if (await checkOverlappingAvailability(new mongoose_1.default.Types.ObjectId(venueId), newStartTime, newEndTime)) {
            return res.status(409).json({
                success: false,
                error: 'Conflict: This time slot overlaps with an existing availability entry.'
            });
        }
        const newAvailability = new Availability_1.default({
            venueId,
            startTime: newStartTime,
            endTime: newEndTime,
            title,
            isBooked,
            bookingId: bookingId || null,
        });
        await newAvailability.save();
        const response = {
            success: true,
            data: newAvailability,
            message: 'Availability added successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to add availability',
            message: error.message
        });
    }
};
exports.addAvailability = addAvailability;
// Update availability
const updateAvailability = async (req, res) => {
    try {
        const { venueId, availabilityId } = req.params;
        const { startTime, endTime, title, isBooked, bookingId } = req.body;
        const hostId = req.user.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(venueId) || !mongoose_1.default.Types.ObjectId.isValid(availabilityId)) {
            return res.status(400).json({ success: false, error: 'Invalid venue or availability ID' });
        }
        const venue = await Venue_1.default.findById(venueId);
        if (!venue) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        if (venue.hostId?.toString() !== hostId) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
        }
        const availabilityToUpdate = await Availability_1.default.findById(availabilityId);
        if (!availabilityToUpdate || availabilityToUpdate.venueId.toString() !== venueId) {
            return res.status(404).json({ success: false, error: 'Availability slot not found for this venue.' });
        }
        const newStartTime = startTime ? new Date(startTime) : availabilityToUpdate.startTime;
        const newEndTime = endTime ? new Date(endTime) : availabilityToUpdate.endTime;
        if (newStartTime >= newEndTime) {
            return res.status(400).json({ success: false, error: 'End time must be after start time.' });
        }
        if (await checkOverlappingAvailability(new mongoose_1.default.Types.ObjectId(venueId), newStartTime, newEndTime, new mongoose_1.default.Types.ObjectId(availabilityId))) {
            return res.status(409).json({
                success: false,
                error: 'Conflict: This time slot overlaps with another availability entry.'
            });
        }
        availabilityToUpdate.startTime = newStartTime;
        availabilityToUpdate.endTime = newEndTime;
        if (title !== undefined)
            availabilityToUpdate.title = title;
        if (isBooked !== undefined)
            availabilityToUpdate.isBooked = isBooked;
        if (bookingId !== undefined)
            availabilityToUpdate.bookingId = bookingId || null;
        await availabilityToUpdate.save();
        const response = {
            success: true,
            data: availabilityToUpdate,
            message: 'Availability updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update availability',
            message: error.message
        });
    }
};
exports.updateAvailability = updateAvailability;
// Delete availability
const deleteAvailability = async (req, res) => {
    try {
        const { venueId, availabilityId } = req.params;
        const hostId = req.user.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(venueId) || !mongoose_1.default.Types.ObjectId.isValid(availabilityId)) {
            return res.status(400).json({ success: false, error: 'Invalid venue or availability ID' });
        }
        const venue = await Venue_1.default.findById(venueId);
        if (!venue) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        if (venue.hostId?.toString() !== hostId) {
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
        }
        const result = await Availability_1.default.findOneAndDelete({ _id: availabilityId, venueId: venueId });
        if (!result) {
            return res.status(404).json({ success: false, error: 'Availability slot not found or does not belong to this venue.' });
        }
        const response = {
            success: true,
            message: 'Availability deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete availability',
            message: error.message
        });
    }
};
exports.deleteAvailability = deleteAvailability;
