"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const connectDB = async (retryCount = 0) => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
        });
        logger_1.default.info('MongoDB connected successfully', {
            host: conn.connection.host,
            database: conn.connection.name,
            retryCount,
        });
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.default.error('MongoDB connection error', { error: error.message });
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.default.warn('MongoDB disconnected');
            // Attempt to reconnect
            if (retryCount < MAX_RETRIES) {
                logger_1.default.info('Attempting to reconnect to MongoDB...', { retryCount: retryCount + 1 });
                setTimeout(() => {
                    connectDB(retryCount + 1).catch((err) => {
                        logger_1.default.error('Reconnection failed', { error: err.message });
                    });
                }, RETRY_DELAY);
            }
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.default.info('MongoDB reconnected');
        });
        mongoose_1.default.connection.on('connected', () => {
            logger_1.default.info('MongoDB connection established');
        });
        return conn;
    }
    catch (error) {
        logger_1.default.error('MongoDB connection failed', {
            error: error.message,
            stack: error.stack,
            retryCount,
        });
        if (retryCount < MAX_RETRIES) {
            logger_1.default.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`, {
                retryCount: retryCount + 1,
                maxRetries: MAX_RETRIES,
            });
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectDB(retryCount + 1);
        }
        else {
            logger_1.default.error('Max retry attempts reached. Exiting...', { maxRetries: MAX_RETRIES });
            process.exit(1);
        }
    }
};
exports.default = connectDB;
