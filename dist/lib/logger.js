/**
 * Logger — Unified logging with pino
 *
 * Provides structured logging with multiple levels, file output,
 * and log rotation. Replaces console.log/error throughout the codebase.
 *
 * @module logger
 */
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import os from 'os';
/**
 * Get FASE home directory
 */
function getFaseHome() {
    const env = process.env.FASE_HOME;
    if (env)
        return env;
    return path.join(os.homedir(), '.fase-ai');
}
/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
    level: 'info',
    logToFile: true,
    logDir: path.join(getFaseHome(), 'logs'),
    maxFiles: 7,
    maxSizeMB: 10,
};
/**
 * Current logger configuration
 */
let currentConfig = { ...DEFAULT_CONFIG };
/**
 * Logger instance
 */
let loggerInstance = null;
/**
 * Ensure log directory exists
 */
function ensureLogDir() {
    if (!fs.existsSync(currentConfig.logDir)) {
        fs.mkdirSync(currentConfig.logDir, { recursive: true });
    }
}
/**
 * Rotate log files if needed
 * Deletes oldest logs when maxFiles or maxSizeMB is exceeded
 */
function rotateLogs() {
    if (!fs.existsSync(currentConfig.logDir)) {
        return;
    }
    try {
        const files = fs.readdirSync(currentConfig.logDir)
            .filter(f => f.endsWith('.log'))
            .map(f => ({
            name: f,
            path: path.join(currentConfig.logDir, f),
            time: fs.statSync(path.join(currentConfig.logDir, f)).mtime.getTime(),
        }))
            .sort((a, b) => b.time - a.time); // Newest first
        // Remove old files beyond maxFiles
        if (files.length > currentConfig.maxFiles) {
            for (const file of files.slice(currentConfig.maxFiles)) {
                fs.unlinkSync(file.path);
            }
        }
        // Check total size and remove oldest if over limit
        const totalSizeMB = files.reduce((sum, f) => {
            return sum + fs.statSync(f.path).size / (1024 * 1024);
        }, 0);
        if (totalSizeMB > currentConfig.maxSizeMB && files.length > 1) {
            // Remove oldest file
            const oldest = files[files.length - 1];
            fs.unlinkSync(oldest.path);
        }
    }
    catch (err) {
        // Ignore rotation errors
        console.error('[Logger] Rotation error:', err.message);
    }
}
/**
 * Get log file path for today
 */
function getLogFilePath() {
    const today = new Date().toISOString().split('T')[0];
    return path.join(currentConfig.logDir, `fase-${today}.log`);
}
/**
 * Initialize or reconfigure the logger
 *
 * @param config - Optional configuration override
 */
export function initLogger(config) {
    if (config) {
        currentConfig = { ...currentConfig, ...config };
    }
    // Reset logger instance to force recreation
    loggerInstance = null;
}
/**
 * Get the logger instance (creates if needed)
 */
export function getLogger() {
    if (loggerInstance) {
        return loggerInstance;
    }
    // Ensure log directory exists
    if (currentConfig.logToFile) {
        ensureLogDir();
        rotateLogs();
    }
    // Create pino transports
    const transports = [
        {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    ];
    // Add file transport if enabled
    if (currentConfig.logToFile) {
        transports.push({
            target: 'pino/file',
            options: {
                destination: getLogFilePath(),
                append: true,
            },
        });
    }
    // Create logger with multiple transports
    loggerInstance = pino({
        level: currentConfig.level,
        timestamp: pino.stdTimeFunctions.isoTime,
    }, pino.multistream(transports));
    return loggerInstance;
}
/**
 * Log at debug level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export function debug(msg, obj) {
    getLogger().debug(obj, msg);
}
/**
 * Log at info level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export function info(msg, obj) {
    getLogger().info(obj, msg);
}
/**
 * Log at warn level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export function warn(msg, obj) {
    getLogger().warn(obj, msg);
}
/**
 * Log at error level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export function error(msg, obj) {
    getLogger().error(obj, msg);
}
/**
 * Log at fatal level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export function fatal(msg, obj) {
    getLogger().fatal(obj, msg);
}
/**
 * Get current logger configuration
 */
export function getConfig() {
    return { ...currentConfig };
}
/**
 * Get log directory path
 */
export function getLogDir() {
    return currentConfig.logDir;
}
/**
 * Get list of log files
 */
export function getLogFiles() {
    if (!fs.existsSync(currentConfig.logDir)) {
        return [];
    }
    return fs.readdirSync(currentConfig.logDir)
        .filter(f => f.endsWith('.log'))
        .sort();
}
/**
 * Clear all log files
 */
export function clearLogs() {
    if (!fs.existsSync(currentConfig.logDir)) {
        return;
    }
    const files = fs.readdirSync(currentConfig.logDir)
        .filter(f => f.endsWith('.log'));
    for (const file of files) {
        fs.unlinkSync(path.join(currentConfig.logDir, file));
    }
}
// Auto-initialize logger on import
initLogger();
//# sourceMappingURL=logger.js.map