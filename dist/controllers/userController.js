"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavoriteVenue = exports.addFavoriteVenue = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().populate('favoriteVenues');
        const response = {
            success: true,
            data: users,
            message: 'Users retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve users',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id)
            .populate('favoriteVenues')
            .populate('bookings');
        if (!user) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: user,
            message: 'User retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve user',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getUserById = getUserById;
// Create a new user
const createUser = async (req, res) => {
    try {
        const newUser = new User_1.default(req.body);
        const savedUser = await newUser.save();
        const response = {
            success: true,
            data: savedUser,
            message: 'User created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to create user',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createUser = createUser;
// Update a user
const updateUser = async (req, res) => {
    try {
        const updatedUser = await User_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedUser) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to update user',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateUser = updateUser;
// Delete a user
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'User deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to delete user',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.deleteUser = deleteUser;
// Add venue to favorites
const addFavoriteVenue = async (req, res) => {
    try {
        const { userId, venueId } = req.params;
        const user = await User_1.default.findById(userId);
        if (!user) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        if (user.favoriteVenues.includes(venueId)) {
            const response = {
                success: false,
                error: 'Venue already in favorites',
            };
            return res.status(400).json(response);
        }
        user.favoriteVenues.push(venueId);
        await user.save();
        const response = {
            success: true,
            data: user,
            message: 'Venue added to favorites successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to add venue to favorites',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.addFavoriteVenue = addFavoriteVenue;
// Remove venue from favorites
const removeFavoriteVenue = async (req, res) => {
    try {
        const { userId, venueId } = req.params;
        const user = await User_1.default.findById(userId);
        if (!user) {
            const response = {
                success: false,
                error: 'User not found',
            };
            return res.status(404).json(response);
        }
        if (!user.favoriteVenues.includes(venueId)) {
            const response = {
                success: false,
                error: 'Venue not in favorites',
            };
            return res.status(400).json(response);
        }
        user.favoriteVenues = user.favoriteVenues.filter((venue) => venue.toString() !== venueId);
        await user.save();
        const response = {
            success: true,
            data: user,
            message: 'Venue removed from favorites successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to remove venue from favorites',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.removeFavoriteVenue = removeFavoriteVenue;
