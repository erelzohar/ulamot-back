import express from 'express';
import { body } from 'express-validator';
import * as hostController from '../controllers/hostController';
import { validateRequest } from '../middleware/validateRequest';
import { requireHostAuth } from '../middleware/auth';

const router = express.Router();

// Validation rules for host registration
const registerValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessType').isIn(['individual', 'company', 'event-planner', 'hotel', 'restaurant', 'other'])
    .withMessage('Please provide a valid business type')
];

// Validation rules for host login
const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes - no authentication required
router.post('/register', registerValidationRules, validateRequest, hostController.registerHost);
router.post('/login', loginValidationRules, validateRequest, hostController.loginHost);

// Protected routes - authentication required
router.get('/me', requireHostAuth, hostController.getHostProfile);
router.put('/me', requireHostAuth, hostController.updateHostProfile);
router.get('/venues', requireHostAuth, hostController.getHostVenues);
router.delete('/venues/:venueId', requireHostAuth, hostController.deleteHostVenue);

// Change password route
router.post(
  '/change-password',
  requireHostAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  hostController.changeHostPassword
);

export default router; 