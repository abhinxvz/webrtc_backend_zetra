"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const getUserProfile = async (req, res) => {
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
        const user = await User_1.default.findById(userId).select('-passwordHash');
        if (!user) {
            logger_1.default.warn('User profile not found', { userId });
            res.status(404).json({ error: 'User not found' });
            return;
        }
        logger_1.default.info('User profile fetched', { userId });
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching user profile', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, email } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            logger_1.default.error('Invalid user ID format', { userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        if (!username && !email) {
            res.status(400).json({ error: 'At least one field (username or email) is required' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            logger_1.default.warn('User not found for profile update', { userId });
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Check if username or email already exists
        if (username && username !== user.username) {
            const existingUser = await User_1.default.findOne({ username });
            if (existingUser) {
                res.status(400).json({ error: 'Username already taken' });
                return;
            }
            user.username = username;
        }
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }
            user.email = email;
        }
        await user.save();
        logger_1.default.info('User profile updated', { userId, username, email });
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error updating user profile', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.userId;
        const { password } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!password) {
            res.status(400).json({ error: 'Password is required to delete account' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            logger_1.default.error('Invalid user ID format', { userId });
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            logger_1.default.warn('User not found for account deletion', { userId });
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const bcrypt = require('bcrypt');
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            logger_1.default.warn('Invalid password for account deletion', { userId });
            res.status(401).json({ error: 'Invalid password' });
            return;
        }
        await User_1.default.findByIdAndDelete(userId);
        logger_1.default.info('User account deleted', { userId });
        res.status(200).json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting user account', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
exports.deleteUserAccount = deleteUserAccount;
