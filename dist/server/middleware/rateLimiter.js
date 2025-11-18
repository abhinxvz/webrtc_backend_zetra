"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const store = {};
const rateLimiter = (options) => {
    const { windowMs, maxRequests, message = 'Too many requests, please try again later' } = options;
    return (req, res, next) => {
        const identifier = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        if (!store[identifier] || now > store[identifier].resetTime) {
            store[identifier] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }
        store[identifier].count++;
        if (store[identifier].count > maxRequests) {
            return res.status(429).json({
                error: message,
                retryAfter: Math.ceil((store[identifier].resetTime - now) / 1000),
            });
        }
        next();
    };
};
exports.rateLimiter = rateLimiter;
// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (now > store[key].resetTime) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);
