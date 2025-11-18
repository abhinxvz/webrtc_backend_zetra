"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
const generateToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        logger_1.default.error('JWT_SECRET is not defined');
        throw new Error('JWT_SECRET is not defined');
    }
    if (!userId) {
        logger_1.default.error('Cannot generate token: userId is required');
        throw new Error('User ID is required to generate token');
    }
    try {
        const token = jsonwebtoken_1.default.sign({ userId }, jwtSecret, {
            expiresIn: '7d',
            issuer: 'zetra-api',
        });
        logger_1.default.debug('Token generated successfully', { userId });
        return token;
    }
    catch (error) {
        logger_1.default.error('Error generating token', { error: error.message, userId });
        throw new Error('Failed to generate authentication token');
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        logger_1.default.error('JWT_SECRET is not defined');
        throw new Error('JWT_SECRET is not defined');
    }
    if (!token) {
        logger_1.default.error('Cannot verify token: token is required');
        throw new Error('Token is required for verification');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret, {
            issuer: 'zetra-api',
        });
        if (!decoded.userId) {
            throw new Error('Invalid token payload');
        }
        logger_1.default.debug('Token verified successfully', { userId: decoded.userId });
        return decoded;
    }
    catch (error) {
        logger_1.default.error('Error verifying token', { error: error.message });
        throw error;
    }
};
exports.verifyToken = verifyToken;
