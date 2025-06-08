import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController';
import { validateRequest } from '../middleware/validateRequest';
// import { requireUserAuth } from '../middleware/auth'; // Not using for this version

const router = express.Router();

// Validation middleware for user creation/updates
const userValidationRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required')
];

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/', userValidationRules, validateRequest, userController.createUser);

// Update a user
router.put('/:id', userValidationRules, validateRequest, userController.updateUser);

// Delete a user
router.delete('/:id', userController.deleteUser);

// Add venue to favorites
router.post('/users/favorites', userController.addFavoriteVenue); // Route changed, no auth for now

// Remove venue from favorites
// Keeping this commented or to be updated similarly if needed
// router.delete('/users/favorites/:venueId/:userId', userController.removeFavoriteVenue);

// Get favorites
// Keeping this commented or to be updated similarly if needed
// router.get('/users/favorites/:userId', userController.getFavorites);

export default router;