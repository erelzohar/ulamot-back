import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { ApiResponse } from '../types';

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password',
      };
      return res.status(401).json(response);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    const response: ApiResponse<{ user: typeof user; token: string }> = {
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(response);
  }
}; 