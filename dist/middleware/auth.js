"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHostAuth = exports.requireUserAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to require authentication (works for both user and host)
const requireAuth = (req, res, next) => {
    try {
        // Check for token in headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = {
                success: false,
                error: 'Authentication required',
            };
            return res.status(401).json(response);
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        // Verify token
        // @ts-ignore
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
        // Add user info to request
        req.user = decoded;
        next();
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Invalid or expired token',
        };
        return res.status(401).json(response);
    }
};
exports.requireAuth = requireAuth;
// Middleware specific to users
const requireUserAuth = (req, res, next) => {
    (0, exports.requireAuth)(req, res, () => {
        if (req.user?.type !== 'user') {
            const response = {
                success: false,
                error: 'User authentication required',
            };
            return res.status(403).json(response);
        }
        next();
    });
};
exports.requireUserAuth = requireUserAuth;
// Middleware specific to hosts
const requireHostAuth = (req, res, next) => {
    console.log('requireHostAuth middleware starting');
    (0, exports.requireAuth)(req, res, () => {
        console.log('requireAuth completed, req.user:', req.user);
        if (req.user?.type !== 'host') {
            console.log('requireHostAuth failed: Not a host, user type =', req.user?.type);
            const response = {
                success: false,
                error: 'Host authentication required',
            };
            return res.status(403).json(response);
        }
        console.log('requireHostAuth succeeded, req.user.id =', req.user.id);
        next();
    });
};
exports.requireHostAuth = requireHostAuth;
