"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRequestBody = exports.validateRequestParams = exports.validateRequestBody = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const validateRequestBody = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            logger_1.default.warn('Request validation failed: missing fields', {
                missingFields,
                path: req.path,
                method: req.method,
            });
            res.status(400).json({
                error: 'Missing required fields',
                missingFields,
            });
            return;
        }
        next();
    };
};
exports.validateRequestBody = validateRequestBody;
const validateRequestParams = (requiredParams) => {
    return (req, res, next) => {
        const missingParams = [];
        for (const param of requiredParams) {
            if (!req.params[param]) {
                missingParams.push(param);
            }
        }
        if (missingParams.length > 0) {
            logger_1.default.warn('Request validation failed: missing params', {
                missingParams,
                path: req.path,
                method: req.method,
            });
            res.status(400).json({
                error: 'Missing required parameters',
                missingParams,
            });
            return;
        }
        next();
    };
};
exports.validateRequestParams = validateRequestParams;
const sanitizeRequestBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};
exports.sanitizeRequestBody = sanitizeRequestBody;
