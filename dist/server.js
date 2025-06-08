"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const path_1 = __importDefault(require("path")); // Added for static file serving
// Import routes
const venues_1 = __importDefault(require("./routes/venues"));
const users_1 = __importDefault(require("./routes/users"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const hosts_1 = __importDefault(require("./routes/hosts"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Connect to MongoDB
(0, db_1.connectDB)();
// CORS configuration
const corsOptions = {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:8080', 'http://192.168.0.170:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
// Middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false })); // Security headers - relax CORP for now
app.use((0, cors_1.default)(corsOptions)); // Enable CORS with options
app.use((0, morgan_1.default)('dev')); // Request logging
app.use(express_1.default.json()); // Parse JSON bodies
// Static file serving for uploads
app.use('/uploads', (0, cors_1.default)(corsOptions), express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/venues', venues_1.default);
app.use('/api/users', users_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/hosts', hosts_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Venue Booking API',
        version: '1.0.0',
        endpoints: {
            venues: '/api/venues',
            users: '/api/users',
            bookings: '/api/bookings',
            hosts: '/api/hosts',
        },
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
    });
});
// Error handling middleware
app.use((err, req, res, _next) => {
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
exports.default = app;
