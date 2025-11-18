"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
];
const validateEnv = () => {
    const missing = [];
    requiredEnvVars.forEach((varName) => {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    });
    if (missing.length > 0) {
        logger_1.default.error('Missing required environment variables', { missing });
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    const config = {
        PORT: parseInt(process.env.PORT || '4000', 10),
        MONGO_URI: process.env.MONGO_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:4000',
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
        NODE_ENV: process.env.NODE_ENV || 'development',
        TURN_SERVER_URL: process.env.TURN_SERVER_URL,
        TURN_SERVER_USERNAME: process.env.TURN_SERVER_USERNAME,
        TURN_SERVER_CREDENTIAL: process.env.TURN_SERVER_CREDENTIAL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };
    logger_1.default.info('Environment configuration validated', {
        NODE_ENV: config.NODE_ENV,
        PORT: config.PORT,
        hasTurnServer: !!config.TURN_SERVER_URL,
    });
    return config;
};
exports.default = validateEnv();
