"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            res.status(400).json({ error: `User with this ${field} already exists` });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = new User_1.default({ username, email, passwordHash });
        await user.save();
        const userId = user._id.toString();
        const token = (0, jwt_1.generateToken)(userId);
        logger_1.default.info('User registered successfully', { userId, username, email });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Registration error', { error: error.message, stack: error.stack });
        if (error.code === 11000) {
            res.status(400).json({ error: 'User with this email or username already exists' });
            return;
        }
        res.status(500).json({ error: 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            logger_1.default.warn('Login attempt with non-existent email', { email });
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            logger_1.default.warn('Login attempt with invalid password', { email, userId: user._id });
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const userId = user._id.toString();
        const token = (0, jwt_1.generateToken)(userId);
        logger_1.default.info('User logged in successfully', { userId, email });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: userId,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Login error', { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Server error during login' });
    }
};
exports.login = login;
const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new password are required' });
            return;
        }
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (currentPassword === newPassword) {
            res.status(400).json({ error: 'New password must be different from current password' });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ error: 'New password must be at least 8 characters long' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            logger_1.default.warn('Password change attempt for non-existent user', { userId });
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            logger_1.default.warn('Password change attempt with incorrect current password', { userId });
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, 10);
        user.passwordHash = newPasswordHash;
        await user.save();
        logger_1.default.info('Password changed successfully', { userId });
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        logger_1.default.error('Password change error', { error: error.message, stack: error.stack, userId: req.userId });
        res.status(500).json({ error: 'Server error during password change' });
    }
};
exports.changePassword = changePassword;
