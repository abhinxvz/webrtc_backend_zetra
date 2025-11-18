"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Get ICE servers configuration
router.get('/', (req, res) => {
    try {
        const iceServers = [
            // Google's public STUN servers
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // Free TURN server (OpenRelay)
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
        ];
        // custom server
        if (process.env.TURN_SERVER_URL && process.env.TURN_SERVER_USERNAME) {
            iceServers.push({
                urls: process.env.TURN_SERVER_URL,
                username: process.env.TURN_SERVER_USERNAME,
                credential: process.env.TURN_SERVER_CREDENTIAL || '',
            });
        }
        logger_1.default.info('ICE servers configuration requested');
        res.status(200).json({
            iceServers,
            iceCandidatePoolSize: 10,
        });
    }
    catch (error) {
        logger_1.default.error('Error getting ICE servers', { error: error.message });
        res.status(500).json({ error: 'Failed to get ICE servers configuration' });
    }
});
exports.default = router;
