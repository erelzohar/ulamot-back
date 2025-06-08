"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeHostPassword = exports.deleteHostVenue = exports.getHostVenues = exports.updateHostProfile = exports.getHostProfile = exports.loginHost = exports.registerHost = void 0;
const Host_1 = __importDefault(require("../models/Host"));
const Venue_1 = __importDefault(require("../models/Venue"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Helper to hash passwords
const hashPassword = (password) => {
    return crypto_1.default.createHash('sha256').update(password).digest('hex');
};
// Get JWT secret
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    return Buffer.from(secret, 'utf-8');
};
// Register a new host
const registerHost = async (req, res) => {
    try {
        const { email, name, password, phone, businessName, businessType } = req.body;
        // Check if host with this email already exists
        const existingHost = await Host_1.default.findOne({ email });
        if (existingHost) {
            const response = {
                success: false,
                error: 'Email already in use',
            };
            return res.status(400).json(response);
        }
        // Create a new host
        const newHost = new Host_1.default({
            email,
            name,
            password: hashPassword(password),
            phone,
            businessName,
            businessType,
            venues: [],
            verified: false
        });
        const savedHost = await newHost.save();
        // Generate JWT token
        // @ts-ignore
        const token = jsonwebtoken_1.default.sign({ id: savedHost._id, email: savedHost.email, type: 'host' }, process.env.JWT_SECRET || 'your-jwt-secret-key', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        const response = {
            success: true,
            data: {
                host: savedHost,
                token
            },
            message: 'Host registered successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to register host',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.registerHost = registerHost;
// Login a host
const loginHost = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find host with email and include password for verification
        const host = await Host_1.default.findOne({ email }).select('+password');
        if (!host || host.password !== hashPassword(password)) {
            const response = {
                success: false,
                error: 'Invalid email or password',
            };
            return res.status(401).json(response);
        }
        // Generate JWT token
        // @ts-ignore
        const token = jsonwebtoken_1.default.sign({ id: host._id, email: host.email, type: 'host' }, process.env.JWT_SECRET || 'your-jwt-secret-key', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // Remove password from host object
        const hostWithoutPassword = host.toJSON();
        const response = {
            success: true,
            data: {
                host: hostWithoutPassword,
                token
            },
            message: 'Host logged in successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to login',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.loginHost = loginHost;
// Get host profile
const getHostProfile = async (req, res) => {
    try {
        // @ts-ignore - we'll add user to req in auth middleware
        const hostId = req.user.id;
        const host = await Host_1.default.findById(hostId);
        if (!host) {
            const response = {
                success: false,
                error: 'Host not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: host,
            message: 'Host profile retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to get host profile',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getHostProfile = getHostProfile;
// Update host profile
const updateHostProfile = async (req, res) => {
    try {
        // @ts-ignore - we'll add user to req in auth middleware
        const hostId = req.user.id;
        // Don't allow updating email or password through this endpoint
        const { email, password, ...updateData } = req.body;
        const updatedHost = await Host_1.default.findByIdAndUpdate(hostId, updateData, { new: true, runValidators: true });
        if (!updatedHost) {
            const response = {
                success: false,
                error: 'Host not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedHost,
            message: 'Host profile updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to update host profile',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateHostProfile = updateHostProfile;
// Get host venues
const getHostVenues = async (req, res) => {
    try {
        // @ts-ignore - we'll add user to req in auth middleware
        const hostId = req.user.id;
        const venues = await Venue_1.default.find({ hostId });
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venuesWithFullImageUrls = venues.map(venue => {
            const venueObject = venue.toObject();
            if (venueObject.images && venueObject.images.length > 0) {
                venueObject.images = venueObject.images.map(image => {
                    if (image.url && !image.url.startsWith('http')) {
                        return { ...image, url: `${backendBaseUrl}${image.url}` };
                    }
                    return image;
                });
            }
            return venueObject;
        });
        const response = {
            success: true,
            data: venuesWithFullImageUrls,
            message: 'Host venues retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to get host venues',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getHostVenues = getHostVenues;
// Delete a venue owned by the host
const deleteHostVenue = async (req, res) => {
    try {
        // @ts-ignore
        const hostId = req.user.id;
        const { venueId } = req.params;
        const venue = await Venue_1.default.findOne({ _id: venueId, hostId });
        if (!venue) {
            return res.status(404).json({
                success: false,
                error: "Venue not found or you don't have permission to delete it.",
            });
        }
        await Venue_1.default.findByIdAndDelete(venueId);
        // Remove venue from host's list of venues
        await Host_1.default.findByIdAndUpdate(hostId, { $pull: { venues: venueId } });
        res.status(200).json({
            success: true,
            message: "Venue deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to delete venue",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.deleteHostVenue = deleteHostVenue;
// Change host password
const changeHostPassword = async (req, res) => {
    try {
        // @ts-ignore - we'll add user to req in auth middleware
        const hostId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get host with password
        const host = await Host_1.default.findById(hostId).select('+password');
        if (!host) {
            const response = {
                success: false,
                error: 'Host not found',
            };
            return res.status(404).json(response);
        }
        // Verify current password
        if (host.password !== hashPassword(currentPassword)) {
            const response = {
                success: false,
                error: 'Current password is incorrect',
            };
            return res.status(401).json(response);
        }
        // Update password
        host.password = hashPassword(newPassword);
        await host.save();
        const response = {
            success: true,
            message: 'Password changed successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to change password',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.changeHostPassword = changeHostPassword;
