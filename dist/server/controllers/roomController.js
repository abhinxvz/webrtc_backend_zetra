"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.createRoom = void 0;
const uuid_1 = require("uuid");
const Room_1 = __importDefault(require("../models/Room"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new room and add the creator as the first participant
const createRoom = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Validate user ID format
        if (!mongoose_1.default.Types.ObjectId.isValid(req.userId)) {
            logger_1.default.error('Invalid user ID format', { userId: req.userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        // Generate unique room ID
        const roomId = (0, uuid_1.v4)();
        // Create new room with the current user as a participant
        const room = new Room_1.default({
            roomId,
            participants: [new mongoose_1.default.Types.ObjectId(req.userId)],
            active: true,
        });
        await room.save();
        logger_1.default.info('Room created successfully', { roomId, userId: req.userId });
        res.status(201).json({
            message: 'Room created successfully',
            roomId: room.roomId,
        });
    }
    catch (error) {
        logger_1.default.error('Error creating room', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Server error creating room' });
    }
};
exports.createRoom = createRoom;
// Allow a user to join an existing active room
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        // Ensure user is authenticated
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Validate roomId and userId formats
        if (!roomId) {
            res.status(400).json({ error: 'Room ID is required' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(req.userId)) {
            logger_1.default.error('Invalid user ID format', { userId: req.userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        // Find active room by roomId
        const room = await Room_1.default.findOne({ roomId, active: true });
        if (!room) {
            logger_1.default.warn('Attempt to join non-existent or inactive room', { roomId, userId: req.userId });
            res.status(404).json({ error: 'Room not found or inactive' });
            return;
        }
        // Add user to participants if not already joined
        const userObjectId = new mongoose_1.default.Types.ObjectId(req.userId);
        const isParticipant = room.participants.some((participantId) => participantId.toString() === req.userId);
        if (!isParticipant) {
            room.participants.push(userObjectId);
            await room.save();
            logger_1.default.info('User joined room', { roomId, userId: req.userId });
        }
        else {
            logger_1.default.debug('User already in room', { roomId, userId: req.userId });
        }
        res.status(200).json({
            message: 'Joined room successfully',
            room: {
                roomId: room.roomId,
                participants: room.participants,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error joining room', { error: error.message, stack: error.stack, roomId: req.params.roomId, userId: req.userId });
        res.status(500).json({ error: 'Server error joining room' });
    }
};
exports.joinRoom = joinRoom;
