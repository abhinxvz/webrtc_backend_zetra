"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallLogStats = exports.endCallLog = exports.createCallLog = exports.getUserCallLogs = void 0;
const CallLog_1 = __importDefault(require("../models/CallLog"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const getUserCallLogs = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            logger_1.default.error('Invalid user ID format', { userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const callLogs = await CallLog_1.default.find({
            $or: [{ callerId: userId }, { receiverId: userId }],
        })
            .sort({ startTime: -1 })
            .limit(50)
            .populate('callerId', 'username email')
            .populate('receiverId', 'username email');
        logger_1.default.info('Call logs fetched', { userId, count: callLogs.length });
        res.status(200).json({ callLogs });
    }
    catch (error) {
        logger_1.default.error('Error fetching call logs', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Failed to fetch call logs' });
    }
};
exports.getUserCallLogs = getUserCallLogs;
const createCallLog = async (req, res) => {
    try {
        const { callerId, receiverId, roomId, startTime } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!callerId || !receiverId || !roomId) {
            res.status(400).json({ error: 'Caller ID, receiver ID, and room ID are required' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(callerId) || !mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
            logger_1.default.error('Invalid caller or receiver ID format', { callerId, receiverId });
            res.status(400).json({ error: 'Invalid caller or receiver ID' });
            return;
        }
        if (callerId === receiverId) {
            res.status(400).json({ error: 'Caller and receiver cannot be the same' });
            return;
        }
        const callLog = new CallLog_1.default({
            callerId: new mongoose_1.default.Types.ObjectId(callerId),
            receiverId: new mongoose_1.default.Types.ObjectId(receiverId),
            roomId,
            startTime: startTime || new Date(),
            endTime: null,
            duration: 0,
        });
        await callLog.save();
        logger_1.default.info('Call log created', { callLogId: callLog._id, roomId, callerId, receiverId });
        res.status(201).json({ callLog });
    }
    catch (error) {
        logger_1.default.error('Error creating call log', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Failed to create call log' });
    }
};
exports.createCallLog = createCallLog;
const endCallLog = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { endTime } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!roomId) {
            res.status(400).json({ error: 'Room ID is required' });
            return;
        }
        const callLog = await CallLog_1.default.findOne({ roomId, endTime: null });
        if (!callLog) {
            logger_1.default.warn('Attempt to end non-existent or already ended call log', { roomId, userId });
            res.status(404).json({ error: 'Active call log not found' });
            return;
        }
        const endTimeDate = endTime ? new Date(endTime) : new Date();
        const startTimeDate = new Date(callLog.startTime);
        if (endTimeDate < startTimeDate) {
            res.status(400).json({ error: 'End time cannot be before start time' });
            return;
        }
        const duration = Math.floor((endTimeDate.getTime() - startTimeDate.getTime()) / 1000);
        callLog.endTime = endTimeDate;
        callLog.duration = duration;
        await callLog.save();
        logger_1.default.info('Call log ended', { callLogId: callLog._id, roomId, duration });
        res.status(200).json({ callLog });
    }
    catch (error) {
        logger_1.default.error('Error ending call log', { error: error.message, stack: error.stack, roomId: req.params.roomId });
        res.status(500).json({ error: 'Failed to end call log' });
    }
};
exports.endCallLog = endCallLog;
const getCallLogStats = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            logger_1.default.error('Invalid user ID format', { userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const totalCalls = await CallLog_1.default.countDocuments({
            $or: [{ callerId: userId }, { receiverId: userId }],
        });
        const callLogs = await CallLog_1.default.find({
            $or: [{ callerId: userId }, { receiverId: userId }],
            endTime: { $ne: null },
        });
        const totalDuration = callLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const averageDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;
        const completedCalls = callLogs.length;
        const activeCalls = totalCalls - completedCalls;
        logger_1.default.info('Call stats fetched', { userId, totalCalls, completedCalls, activeCalls });
        res.status(200).json({
            totalCalls,
            completedCalls,
            activeCalls,
            totalDuration,
            averageDuration,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching call stats', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Failed to fetch call stats' });
    }
};
exports.getCallLogStats = getCallLogStats;
