"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const logger_1 = __importDefault(require("./logger"));
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            logger_1.default.error('Async handler caught error', {
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method,
            });
            next(error);
        });
    };
};
exports.asyncHandler = asyncHandler;
