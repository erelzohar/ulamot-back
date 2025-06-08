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
const availabilityController = __importStar(require("../controllers/availabilityController"));
const auth_1 = require("../middleware/auth"); // Host must be logged in to manage availability
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router({ mergeParams: true }); // mergeParams allows us to get venueId from parent router
const availabilityValidationRules = [
    (0, express_validator_1.body)('startTime').isISO8601().toDate().withMessage('Valid start time is required'),
    (0, express_validator_1.body)('endTime').isISO8601().toDate().withMessage('Valid end time is required')
        .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startTime)) {
            throw new Error('End time must be after start time');
        }
        return true;
    }),
    (0, express_validator_1.body)('title').optional().isString().trim().notEmpty().withMessage('Title, if provided, cannot be empty'),
    (0, express_validator_1.body)('isBooked').optional().isBoolean().withMessage('isBooked must be a boolean'),
    (0, express_validator_1.body)('bookingId').optional().isMongoId().withMessage('Invalid booking ID format'),
];
// Prefix: /api/venues/:venueId/availability
// Get all availability for a specific venue (host or public, depending on general app logic - for now host only)
router.get('/', auth_1.requireHostAuth, availabilityController.getAvailabilityForVenue);
// Add new availability for a specific venue (host only)
router.post('/', auth_1.requireHostAuth, availabilityValidationRules, validateRequest_1.validateRequest, availabilityController.addAvailability);
// Update specific availability for a venue (host only)
router.put('/:availabilityId', auth_1.requireHostAuth, availabilityValidationRules, validateRequest_1.validateRequest, availabilityController.updateAvailability);
// Delete specific availability for a venue (host only)
router.delete('/:availabilityId', auth_1.requireHostAuth, availabilityController.deleteAvailability);
exports.default = router;
