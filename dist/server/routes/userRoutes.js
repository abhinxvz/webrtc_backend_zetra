"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get logged-in user's profile
router.get('/profile', auth_1.authenticateToken, userController_1.getUserProfile);
// Update logged-in user's profile
router.put('/profile', auth_1.authenticateToken, userController_1.updateUserProfile);
// Delete user account
router.delete('/account', auth_1.authenticateToken, userController_1.deleteUserAccount);
exports.default = router;
