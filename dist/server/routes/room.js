"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomController_1 = require("../controllers/roomController");
const auth_1 = require("../middleware/auth");
const roomValidation_1 = require("../middleware/roomValidation");
const router = (0, express_1.Router)();
// Create a new room (authenticated users only)
router.post('/create', auth_1.authenticate, roomValidation_1.validateCreateRoom, roomController_1.createRoom);
// Join an existing room by ID (authenticated users only)
router.post('/join/:roomId', auth_1.authenticate, roomValidation_1.validateRoomId, roomController_1.joinRoom);
exports.default = router;
