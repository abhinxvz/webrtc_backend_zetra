"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = __importDefault(require("./config/database"));
const cors_2 = require("./config/cors");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const room_1 = __importDefault(require("./routes/room"));
const callLogRoutes_1 = __importDefault(require("./routes/callLogRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const iceServers_1 = __importDefault(require("./routes/iceServers"));
const meetingSummaryRoutes_1 = __importDefault(require("./routes/meetingSummaryRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const env_1 = __importDefault(require("./config/env"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: true, // Allow all origins for ngrok compatibility
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
const requestLogger_1 = require("./middleware/requestLogger");
app.use(requestLogger_1.requestLogger);
// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
// Database connection
(0, database_1.default)();
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/room', room_1.default);
app.use('/api/call-logs', callLogRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/ice-servers', iceServers_1.default);
app.use('/api/meeting-summary', meetingSummaryRoutes_1.default);
// Debug routes (only in development)
if (env_1.default.NODE_ENV === 'development') {
    const debugRoutes = require('./routes/debug').default;
    app.use('/api/debug', debugRoutes);
}
// Health check
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        res.status(200).json({
            status: 'ok',
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbStatus,
            environment: env_1.default.NODE_ENV,
        });
    }
    catch (error) {
        logger_1.default.error('Health check failed', { error });
        res.status(503).json({
            status: 'error',
            message: 'Service unavailable',
            timestamp: new Date().toISOString(),
        });
    }
});
// WebRTC Signaling with Socket.io
io.on('connection', (socket) => {
    logger_1.default.info('User connected', { socketId: socket.id });
    socket.on('join-room', (roomId, userId) => {
        try {
            if (!roomId || !userId) {
                logger_1.default.warn('Invalid join-room parameters', { roomId, userId, socketId: socket.id });
                socket.emit('error', { message: 'Invalid room or user ID' });
                return;
            }
            // Get existing users in the room before joining
            const room = io.sockets.adapter.rooms.get(roomId);
            const existingUsers = room ? Array.from(room) : [];
            socket.join(roomId);
            logger_1.default.info('User joined room', {
                userId,
                roomId,
                socketId: socket.id,
                existingUsersCount: existingUsers.length
            });
            // Notify existing users about the new user
            socket.to(roomId).emit('user-connected', userId);
            // Notify the new user about existing users
            existingUsers.forEach((existingSocketId) => {
                if (existingSocketId !== socket.id) {
                    const existingSocket = io.sockets.sockets.get(existingSocketId);
                    if (existingSocket) {
                        // Get the userId from the socket (we'll store it)
                        const existingUserId = existingSocket.userId;
                        if (existingUserId) {
                            socket.emit('user-connected', existingUserId);
                        }
                    }
                }
            });
            // Store userId on socket for later reference
            socket.userId = userId;
            socket.roomId = roomId;
            socket.on('disconnect', () => {
                socket.to(roomId).emit('user-disconnected', userId);
                logger_1.default.info('User disconnected from room', { userId, roomId, socketId: socket.id });
            });
        }
        catch (error) {
            logger_1.default.error('Error in join-room', { error, socketId: socket.id });
            socket.emit('error', { message: 'Failed to join room' });
        }
    });
    socket.on('offer', (roomId, offer) => {
        try {
            if (!roomId || !offer) {
                logger_1.default.warn('Invalid offer parameters', { roomId, socketId: socket.id });
                return;
            }
            socket.to(roomId).emit('offer', offer);
            logger_1.default.debug('Offer sent', { roomId, socketId: socket.id });
        }
        catch (error) {
            logger_1.default.error('Error handling offer', { error, socketId: socket.id });
            socket.emit('error', { message: 'Failed to send offer' });
        }
    });
    socket.on('answer', (roomId, answer) => {
        try {
            if (!roomId || !answer) {
                logger_1.default.warn('Invalid answer parameters', { roomId, socketId: socket.id });
                return;
            }
            socket.to(roomId).emit('answer', answer);
            logger_1.default.debug('Answer sent', { roomId, socketId: socket.id });
        }
        catch (error) {
            logger_1.default.error('Error handling answer', { error, socketId: socket.id });
            socket.emit('error', { message: 'Failed to send answer' });
        }
    });
    socket.on('ice-candidate', (roomId, candidate) => {
        try {
            if (!roomId || !candidate) {
                logger_1.default.warn('Invalid ICE candidate parameters', { roomId, socketId: socket.id });
                return;
            }
            socket.to(roomId).emit('ice-candidate', candidate);
            logger_1.default.debug('ICE candidate sent', { roomId, socketId: socket.id });
        }
        catch (error) {
            logger_1.default.error('Error handling ICE candidate', { error, socketId: socket.id });
            socket.emit('error', { message: 'Failed to send ICE candidate' });
        }
    });
    socket.on('chat-message', (roomId, message, username) => {
        try {
            if (!roomId || !message || !username) {
                logger_1.default.warn('Invalid chat message parameters', { roomId, socketId: socket.id });
                return;
            }
            io.to(roomId).emit('chat-message', { message, username, timestamp: new Date() });
            logger_1.default.debug('Chat message sent', { roomId, username, socketId: socket.id });
        }
        catch (error) {
            logger_1.default.error('Error handling chat message', { error, socketId: socket.id });
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    socket.on('error', (error) => {
        logger_1.default.error('Socket error', { error, socketId: socket.id });
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const PORT = env_1.default.PORT;
// Graceful shutdown handler
const gracefulShutdown = async () => {
    logger_1.default.info('Received shutdown signal, closing server gracefully...');
    httpServer.close(() => {
        logger_1.default.info('HTTP server closed');
    });
    try {
        await mongoose_1.default.connection.close();
        logger_1.default.info('Database connection closed');
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error('Error during shutdown', { error });
        process.exit(1);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection', { reason, promise });
});
// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception', { error });
    process.exit(1);
});
httpServer.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`, {
        environment: env_1.default.NODE_ENV,
        port: PORT,
    });
});
