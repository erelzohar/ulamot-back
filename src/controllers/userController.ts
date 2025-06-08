import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { ApiResponse } from '../types';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().populate('favoriteVenues');
    
    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve users',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('favoriteVenues')
      .populate('bookings');
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve user',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Email already registered',
      };
      return res.status(400).json(response);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with hashed password
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      phone,
      favoriteVenues: [],
      bookings: []
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    const response: ApiResponse<{ user: typeof savedUser; token: string }> = {
      success: true,
      data: {
        user: savedUser,
        token
      },
      message: 'User created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Update a user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof updatedUser> = {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Add venue to favorites
export const addFavoriteVenue = async (req: Request, res: Response) => {
  try {
    const { venueId, userId } = req.body;

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User ID is required in the request body',
      };
      return res.status(400).json(response);
    }

    if (!venueId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Venue ID is required in the request body',
      };
      return res.status(400).json(response);
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    if (user.favoriteVenues.includes(venueId as any)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Venue already in favorites',
      };
      return res.status(400).json(response);
    }
    
    user.favoriteVenues.push(venueId as any);
    await user.save();
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'Venue added to favorites successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to add venue to favorites',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Remove venue from favorites
export const removeFavoriteVenue = async (req: Request, res: Response) => {
  try {
    const { userId, venueId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      return res.status(404).json(response);
    }
    
    if (!user.favoriteVenues.includes(venueId as any)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Venue not in favorites',
      };
      return res.status(400).json(response);
    }
    
    user.favoriteVenues = user.favoriteVenues.filter(
      (venue) => venue.toString() !== venueId
    );
    await user.save();
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'Venue removed from favorites successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to remove venue from favorites',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
};

// Get favorites
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const favoriteVenues = await User.findById(userId).populate('favoriteVenues');

    if (!favoriteVenues) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };

      return res.status(404).json(response);
    }

    const response: ApiResponse<typeof favoriteVenues> = {
      success: true,
      data: favoriteVenues,
      message: 'Favorites retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to retrieve favorites',
      message: error instanceof Error ? error.message : 'Unknown error'
    };

    res.status(500).json(response);
  }
};