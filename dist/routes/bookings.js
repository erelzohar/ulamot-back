"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bookingController = __importStar(require("../controllers/bookingController"));
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
// Validation middleware for booking creation
const bookingValidationRules = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('venueId').notEmpty().withMessage('Venue ID is required'),
    (0, express_validator_1.body)('eventDate').isISO8601().withMessage('Valid event date is required'),
    (0, express_validator_1.body)('packageId').notEmpty().withMessage('Package ID is required'),
    (0, express_validator_1.body)('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1')
];
// Validation middleware for booking status update
const statusValidationRules = [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'confirmed', 'cancelled'])
        .withMessage('Status must be pending, confirmed, or cancelled')
];
// Get all bookings
router.get('/', bookingController.getAllBookings);
// Get booking by ID
router.get('/:id', bookingController.getBookingById);
// Get bookings by user ID
router.get('/user/:userId', bookingController.getBookingsByUser);
// Get bookings by venue ID
router.get('/venue/:venueId', bookingController.getBookingsByVenue);
// Create a new booking
router.post('/', bookingValidationRules, validateRequest_1.validateRequest, bookingController.createBooking);
// Update a booking
router.put('/:id', bookingController.updateBooking);
// Update booking status
router.patch('/:id/status', statusValidationRules, validateRequest_1.validateRequest, bookingController.updateBookingStatus);
// Delete a booking
router.delete('/:id', bookingController.deleteBooking);
exports.default = router;
