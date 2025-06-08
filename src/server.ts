import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import path from 'path'; // Added for static file serving

// Import routes
import venueRoutes from './routes/venues';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import hostRoutes from './routes/hosts';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:8080', 'http://192.168.0.170:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Security headers - relax CORP for now
app.use(cors(corsOptions)); // Enable CORS with options
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies

// Static file serving for uploads
app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hosts', hostRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Venue Booking API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      venues: '/api/venues',
      users: '/api/users',
      bookings: '/api/bookings',
      hosts: '/api/hosts',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;