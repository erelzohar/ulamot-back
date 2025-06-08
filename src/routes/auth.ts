import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation middleware for login
const loginValidationRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Login route
router.post('/login', loginValidationRules, validateRequest, authController.login);

export default router; 