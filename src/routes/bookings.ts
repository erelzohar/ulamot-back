import express from 'express';
import { body } from 'express-validator';
import * as bookingController from '../controllers/bookingController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation middleware for booking creation
const bookingValidationRules = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('venueId').notEmpty().withMessage('Venue ID is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('packageId').notEmpty().withMessage('Package ID is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1')
];

// Validation middleware for booking status update
const statusValidationRules = [
  body('status')
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
router.post('/', bookingValidationRules, validateRequest, bookingController.createBooking);

// Update a booking
router.put('/:id', bookingController.updateBooking);

// Update booking status
router.patch(
  '/:id/status', 
  statusValidationRules, 
  validateRequest, 
  bookingController.updateBookingStatus
);

// Delete a booking
router.delete('/:id', bookingController.deleteBooking);

export default router;