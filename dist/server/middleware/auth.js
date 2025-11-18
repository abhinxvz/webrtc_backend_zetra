"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            res.status(401).json({ error: 'No authentication token provided' });
            return;
        }
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Invalid token format. Use: Bearer <token>' });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'No authentication token provided' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ error: 'JWT secret not configured' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded.userId) {
            res.status(401).json({ error: 'Invalid token payload' });
            return;
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token has expired' });
        }
        else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ error: 'Invalid authentication token' });
        }
        else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
};
exports.authenticate = authenticate;
exports.authenticateToken = exports.authenticate;
