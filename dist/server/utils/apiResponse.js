"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message: message || 'Success',
            data,
        });
    }
    static error(res, message, statusCode = 500, details) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(details && { details }),
        });
    }
    static created(res, data, message) {
        return this.success(res, data, message || 'Resource created successfully', 201);
    }
    static badRequest(res, message, details) {
        return this.error(res, message, 400, details);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }
    static conflict(res, message) {
        return this.error(res, message, 409);
    }
    static tooManyRequests(res, message = 'Too many requests', retryAfter) {
        return this.error(res, message, 429, retryAfter ? { retryAfter } : undefined);
    }
    static internalError(res, message = 'Internal server error') {
        return this.error(res, message, 500);
    }
}
exports.ApiResponse = ApiResponse;
