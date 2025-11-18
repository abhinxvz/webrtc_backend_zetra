"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegistration = exports.sanitizeInput = exports.validateUsername = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
};
exports.validatePassword = validatePassword;
const validateUsername = (username) => {
    if (username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters long' };
    }
    if (username.length > 20) {
        return { valid: false, message: 'Username must be at most 20 characters long' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
};
exports.validateUsername = validateUsername;
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const usernameValidation = (0, exports.validateUsername)(username);
    if (!usernameValidation.valid) {
        return res.status(400).json({ error: usernameValidation.message });
    }
    if (!(0, exports.validateEmail)(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    const passwordValidation = (0, exports.validatePassword)(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
    }
    req.body.username = (0, exports.sanitizeInput)(username);
    req.body.email = (0, exports.sanitizeInput)(email);
    next();
};
exports.validateRegistration = validateRegistration;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!(0, exports.validateEmail)(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    req.body.email = (0, exports.sanitizeInput)(email);
    next();
};
exports.validateLogin = validateLogin;
