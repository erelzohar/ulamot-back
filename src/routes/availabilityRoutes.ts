import express from 'express';
import * as availabilityController from '../controllers/availabilityController';
import { requireHostAuth } from '../middleware/auth'; // Host must be logged in to manage availability
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router({ mergeParams: true }); // mergeParams allows us to get venueId from parent router

const availabilityValidationRules = [
  body('startTime').isISO8601().toDate().withMessage('Valid start time is required'),
  body('endTime').isISO8601().toDate().withMessage('Valid end time is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('title').optional().isString().trim().notEmpty().withMessage('Title, if provided, cannot be empty'),
  body('isBooked').optional().isBoolean().withMessage('isBooked must be a boolean'),
  body('bookingId').optional().isMongoId().withMessage('Invalid booking ID format'),
];

// Prefix: /api/venues/:venueId/availability

// Get all availability for a specific venue (host or public, depending on general app logic - for now host only)
router.get(
    '/', 
    requireHostAuth, 
    availabilityController.getAvailabilityForVenue
);

// Add new availability for a specific venue (host only)
router.post(
    '/', 
    requireHostAuth, 
    availabilityValidationRules,
    validateRequest,
    availabilityController.addAvailability
);

// Update specific availability for a venue (host only)
router.put(
    '/:availabilityId',
    requireHostAuth,
    availabilityValidationRules,
    validateRequest, 
    availabilityController.updateAvailability
);

// Delete specific availability for a venue (host only)
router.delete(
    '/:availabilityId',
    requireHostAuth, 
    availabilityController.deleteAvailability
);

export default router; 