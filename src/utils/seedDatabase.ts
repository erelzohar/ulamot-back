import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import Venue from '../models/Venue';
import User from '../models/User';
import Booking from '../models/Booking';
import { mockVenues, mockUsers, mockBookings } from './mockData';

// Load environment variables
dotenv.config();

// Seed database function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Venue.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // Convert string IDs to ObjectIds for proper references
    const venueIdMap = new Map();
    const userIdMap = new Map();
    
    // Insert venues with MongoDB ObjectIds
    const venuesWithObjectIds = mockVenues.map(venue => {
      const venueWithObjectId = {
        ...venue,
        _id: new mongoose.Types.ObjectId()
      };
      venueIdMap.set(venue.id, venueWithObjectId._id);
      return venueWithObjectId;
    });
    
    await Venue.insertMany(venuesWithObjectIds);
    console.log('Venues seeded successfully');
    
    // Insert users with MongoDB ObjectIds and proper venue references
    const usersWithObjectIds = mockUsers.map(user => {
      const userWithObjectId = {
        ...user,
        _id: new mongoose.Types.ObjectId(),
        favoriteVenues: user.favoriteVenues.map(
          venueId => venueIdMap.get(venueId)
        ),
        // Skip bookings for now as they need both user and venue IDs
        bookings: []
      };
      userIdMap.set(user.id, userWithObjectId._id);
      return userWithObjectId;
    });
    
    await User.insertMany(usersWithObjectIds);
    console.log('Users seeded successfully');
    
    // Insert bookings with proper references
    const bookingsWithObjectIds = mockBookings.map(booking => {
      return {
        ...booking,
        _id: new mongoose.Types.ObjectId(),
        userId: userIdMap.get(booking.userId),
        venueId: venueIdMap.get(booking.venueId),
      };
    });
    
    const insertedBookings = await Booking.insertMany(bookingsWithObjectIds);
    console.log('Bookings seeded successfully');
    
    // Update users with booking references
    for (const booking of insertedBookings) {
      await User.findByIdAndUpdate(
        booking.userId,
        { $push: { bookings: booking._id } }
      );
    }
    console.log('User booking references updated');
    
    console.log('Database seeding completed successfully');
    
    // Disconnect from MongoDB
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    // Disconnect from MongoDB
    await disconnectDB();
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();