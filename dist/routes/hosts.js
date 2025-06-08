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
const hostController = __importStar(require("../controllers/hostController"));
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation rules for host registration
const registerValidationRules = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('businessName').notEmpty().withMessage('Business name is required'),
    (0, express_validator_1.body)('businessType').isIn(['individual', 'company', 'event-planner', 'hotel', 'restaurant', 'other'])
        .withMessage('Please provide a valid business type')
];
// Validation rules for host login
const loginValidationRules = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
// Public routes - no authentication required
router.post('/register', registerValidationRules, validateRequest_1.validateRequest, hostController.registerHost);
router.post('/login', loginValidationRules, validateRequest_1.validateRequest, hostController.loginHost);
// Protected routes - authentication required
router.get('/me', auth_1.requireHostAuth, hostController.getHostProfile);
router.put('/me', auth_1.requireHostAuth, hostController.updateHostProfile);
router.get('/venues', auth_1.requireHostAuth, hostController.getHostVenues);
router.delete('/venues/:venueId', auth_1.requireHostAuth, hostController.deleteHostVenue);
// Change password route
router.post('/change-password', auth_1.requireHostAuth, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validateRequest_1.validateRequest, hostController.changeHostPassword);
exports.default = router;
