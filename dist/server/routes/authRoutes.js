"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rate limit: 5 requests per 15 minutes for auth endpoints
const authLimiter = (0, rateLimiter_1.rateLimiter)({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
});
router.post('/register', authLimiter, validation_1.validateRegistration, authController_1.register);
router.post('/login', authLimiter, validation_1.validateLogin, authController_1.login);
router.post('/change-password', auth_1.authenticateToken, authController_1.changePassword);
exports.default = router;
