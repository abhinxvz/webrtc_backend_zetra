"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(data && { data }),
        };
        const colorCodes = {
            info: '\x1b[36m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[35m',
        };
        const resetColor = '\x1b[0m';
        const color = colorCodes[level];
        console.log(`${color}[${logEntry.level}]${resetColor} ${timestamp} - ${message}`, data || '');
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, data) {
        this.log('error', message, data);
    }
    debug(message, data) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, data);
        }
    }
}
exports.default = new Logger();
