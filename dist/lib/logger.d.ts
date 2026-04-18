/**
 * Logger — Unified logging with pino
 *
 * Provides structured logging with multiple levels, file output,
 * and log rotation. Replaces console.log/error throughout the codebase.
 *
 * @module logger
 */
import pino from 'pino';
/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * Logger configuration
 */
export interface LoggerConfig {
    level: LogLevel;
    logToFile: boolean;
    logDir: string;
    maxFiles: number;
    maxSizeMB: number;
}
/**
 * Initialize or reconfigure the logger
 *
 * @param config - Optional configuration override
 */
export declare function initLogger(config?: Partial<LoggerConfig>): void;
/**
 * Get the logger instance (creates if needed)
 */
export declare function getLogger(): pino.Logger;
/**
 * Log at debug level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export declare function debug(msg: string, obj?: any): void;
/**
 * Log at info level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export declare function info(msg: string, obj?: any): void;
/**
 * Log at warn level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export declare function warn(msg: string, obj?: any): void;
/**
 * Log at error level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export declare function error(msg: string, obj?: any): void;
/**
 * Log at fatal level
 *
 * @param msg - Log message
 * @param obj - Optional object to log
 */
export declare function fatal(msg: string, obj?: any): void;
/**
 * Get current logger configuration
 */
export declare function getConfig(): LoggerConfig;
/**
 * Get log directory path
 */
export declare function getLogDir(): string;
/**
 * Get list of log files
 */
export declare function getLogFiles(): string[];
/**
 * Clear all log files
 */
export declare function clearLogs(): void;
