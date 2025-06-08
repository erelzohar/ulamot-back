import express from 'express';
import { body } from 'express-validator';
import * as venueController from '../controllers/venueController';
import { validateRequest } from '../middleware/validateRequest';
import { requireHostAuth } from '../middleware/auth';
import upload from '../middleware/upload';
import availabilityRoutes from './availabilityRoutes'; // Import availability routes

const router = express.Router();

// Validation middleware for venue creation/updates
// These rules will likely fail for stringified JSON fields when using FormData.
// Parsing will happen in the controller, and Mongoose validation will take precedence.
const venueValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  // body('location').isObject().withMessage('Location object is required'), // Commented out for FormData
  // body('location.address').notEmpty().withMessage('Address is required'),
  // body('location.city').notEmpty().withMessage('City is required'),
  // body('location.state').notEmpty().withMessage('State is required'),
  // body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  // body('location.country').notEmpty().withMessage('Country is required'),
  // body('location.coordinates').isObject().withMessage('Coordinates are required'),
  // body('location.coordinates.latitude').isNumeric().withMessage('Latitude must be a number'),
  // body('location.coordinates.longitude').isNumeric().withMessage('Longitude must be a number'),
  // body('type').isArray().withMessage('Type must be an array'), // Commented out for FormData
  // body('capacity').isObject().withMessage('Capacity object is required'), // Commented out for FormData
  // body('capacity.min').isInt({ min: 1 }).withMessage('Minimum capacity must be at least 1'),
  // body('capacity.max').isInt({ min: 1 }).withMessage('Maximum capacity must be at least 1'),
  // body('pricing').isObject().withMessage('Pricing object is required'), // Commented out for FormData
  // body('pricing.basePrice').isNumeric().withMessage('Base price must be a number'),
  // body('pricing.currency').notEmpty().withMessage('Currency is required'),
  // body('pricing.packages').isArray().withMessage('Packages must be an array'),
  // body('amenities').isArray().withMessage('Amenities must be an array'), // Commented out for FormData
  // body('contactInfo').isObject().withMessage('Contact info object is required'), // Commented out for FormData
  // body('contactInfo.phone').notEmpty().withMessage('Phone is required'),
  // body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  // body('contactInfo.website').notEmpty().withMessage('Website is required')
];

// Get all venues
router.get('/', venueController.getAllVenues);

// Search venues
router.get('/search', venueController.searchVenues);

// Get venue by ID
router.get('/:id', venueController.getVenueById);

// Create a new venue (This route might not be used if host creation is primary)
router.post('/', venueController.createVenue); // Removed validation for now if it relies on direct object

// Create a new venue as a host
router.post(
  '/host',
  requireHostAuth,
  upload.array('venueImages', 10), // Multer middleware for file uploads
  venueValidationRules, // These will mostly check name & description now
  validateRequest,
  venueController.createVenueAsHost
);

// Update a venue
router.put(
  '/:id',
  requireHostAuth,                // Added: Ensures user is authenticated as a host
  upload.array('images', 10),     // Added: Multer middleware for file uploads, field name 'images'
  // venueValidationRules,        // Commented out for now, review if needed with FormData
  // validateRequest,             // Commented out for now, review if needed
  venueController.updateVenue
);

// Dedicated route for updating packages
router.put('/:id/packages', requireHostAuth, express.json(), venueController.updatePackages);

// Dedicated route for updating dynamic pricing
router.put('/:id/dynamic-pricing', requireHostAuth, express.json(), venueController.updateDynamicPricing);

// Dedicated route for updating base price
router.put('/:id/base-price', requireHostAuth, express.json(), venueController.updateBasePrice);

// Mount availability routes
router.use('/:venueId/availability', availabilityRoutes);

// Delete a venue
router.delete('/:id', venueController.deleteVenue);

export default router;