"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const Venue_1 = __importDefault(require("../models/Venue"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const mockData_1 = require("./mockData");
// Load environment variables
dotenv_1.default.config();
// Seed database function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        console.log('Connected to MongoDB for seeding');
        // Clear existing data
        await Venue_1.default.deleteMany({});
        await User_1.default.deleteMany({});
        await Booking_1.default.deleteMany({});
        console.log('Cleared existing data');
        // Convert string IDs to ObjectIds for proper references
        const venueIdMap = new Map();
        const userIdMap = new Map();
        // Insert venues with MongoDB ObjectIds
        const venuesWithObjectIds = mockData_1.mockVenues.map(venue => {
            const venueWithObjectId = {
                ...venue,
                _id: new mongoose_1.default.Types.ObjectId()
            };
            venueIdMap.set(venue.id, venueWithObjectId._id);
            return venueWithObjectId;
        });
        await Venue_1.default.insertMany(venuesWithObjectIds);
        console.log('Venues seeded successfully');
        // Insert users with MongoDB ObjectIds and proper venue references
        const usersWithObjectIds = mockData_1.mockUsers.map(user => {
            const userWithObjectId = {
                ...user,
                _id: new mongoose_1.default.Types.ObjectId(),
                favoriteVenues: user.favoriteVenues.map(venueId => venueIdMap.get(venueId)),
                // Skip bookings for now as they need both user and venue IDs
                bookings: []
            };
            userIdMap.set(user.id, userWithObjectId._id);
            return userWithObjectId;
        });
        await User_1.default.insertMany(usersWithObjectIds);
        console.log('Users seeded successfully');
        // Insert bookings with proper references
        const bookingsWithObjectIds = mockData_1.mockBookings.map(booking => {
            return {
                ...booking,
                _id: new mongoose_1.default.Types.ObjectId(),
                userId: userIdMap.get(booking.userId),
                venueId: venueIdMap.get(booking.venueId),
            };
        });
        const insertedBookings = await Booking_1.default.insertMany(bookingsWithObjectIds);
        console.log('Bookings seeded successfully');
        // Update users with booking references
        for (const booking of insertedBookings) {
            await User_1.default.findByIdAndUpdate(booking.userId, { $push: { bookings: booking._id } });
        }
        console.log('User booking references updated');
        console.log('Database seeding completed successfully');
        // Disconnect from MongoDB
        await (0, db_1.disconnectDB)();
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        // Disconnect from MongoDB
        await (0, db_1.disconnectDB)();
        process.exit(1);
    }
};
// Run the seeding function
seedDatabase();
