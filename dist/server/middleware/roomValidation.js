"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateRoom = exports.validateRoomId = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// Middleware to validate roomId parameter in routes like /join/:roomId
const validateRoomId = (req, res, next) => {
    const { roomId } = req.params;
    // Check if roomId is provided
    if (!roomId) {
        logger_1.default.warn('Room ID validation failed: missing roomId', { path: req.path });
        return res.status(400).json({ error: 'Room ID is required' });
    }
    // Validate that roomId follows UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roomId)) {
        logger_1.default.warn('Room ID validation failed: invalid format', { roomId, path: req.path });
        return res.status(400).json({ error: 'Invalid room ID format' });
    }
    // If validation passes, move to next middleware or controller
    next();
};
exports.validateRoomId = validateRoomId;
// Middleware to validate data for room creation
// Currently, no fields are required as roomId is generated automatically
const validateCreateRoom = (req, res, next) => {
    next();
};
exports.validateCreateRoom = validateCreateRoom;
