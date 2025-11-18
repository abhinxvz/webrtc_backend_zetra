"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
// Only enable debug routes in development
if (process.env.NODE_ENV === 'development') {
    router.get('/status', async (req, res) => {
        try {
            const dbStatus = mongoose_1.default.connection.readyState;
            const dbStates = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting',
            };
            res.status(200).json({
                server: {
                    status: 'running',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform,
                    environment: process.env.NODE_ENV,
                },
                database: {
                    status: dbStates[dbStatus] || 'unknown',
                    host: mongoose_1.default.connection.host,
                    name: mongoose_1.default.connection.name,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.default.error('Debug status endpoint error', { error: error.message });
            res.status(500).json({ error: 'Failed to get status' });
        }
    });
    router.get('/env', (req, res) => {
        res.status(200).json({
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            MONGO_URI: process.env.MONGO_URI ? '***configured***' : 'missing',
            JWT_SECRET: process.env.JWT_SECRET ? '***configured***' : 'missing',
            SOCKET_URL: process.env.SOCKET_URL,
            NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        });
    });
}
exports.default = router;
