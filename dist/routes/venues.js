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
const venueController = __importStar(require("../controllers/venueController"));
const validateRequest_1 = require("../middleware/validateRequest");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const availabilityRoutes_1 = __importDefault(require("./availabilityRoutes")); // Import availability routes
const router = express_1.default.Router();
// Validation middleware for venue creation/updates
// These rules will likely fail for stringified JSON fields when using FormData.
// Parsing will happen in the controller, and Mongoose validation will take precedence.
const venueValidationRules = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
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
router.post('/host', auth_1.requireHostAuth, upload_1.default.array('venueImages', 10), // Multer middleware for file uploads
venueValidationRules, // These will mostly check name & description now
validateRequest_1.validateRequest, venueController.createVenueAsHost);
// Update a venue
router.put('/:id', auth_1.requireHostAuth, // Added: Ensures user is authenticated as a host
upload_1.default.array('images', 10), // Added: Multer middleware for file uploads, field name 'images'
// venueValidationRules,        // Commented out for now, review if needed with FormData
// validateRequest,             // Commented out for now, review if needed
venueController.updateVenue);
// Dedicated route for updating packages
router.put('/:id/packages', auth_1.requireHostAuth, express_1.default.json(), venueController.updatePackages);
// Dedicated route for updating dynamic pricing
router.put('/:id/dynamic-pricing', auth_1.requireHostAuth, express_1.default.json(), venueController.updateDynamicPricing);
// Dedicated route for updating base price
router.put('/:id/base-price', auth_1.requireHostAuth, express_1.default.json(), venueController.updateBasePrice);
// Mount availability routes
router.use('/:venueId/availability', availabilityRoutes_1.default);
// Delete a venue
router.delete('/:id', venueController.deleteVenue);
exports.default = router;
