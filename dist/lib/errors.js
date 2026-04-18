/**
 * Error classes for FASE - Padronized error handling
 *
 * All errors extend FaseError base class for consistent error handling
 * across the codebase. Errors should be thrown instead of calling process.exit()
 * for better testability and error recovery.
 *
 * @module errors
 */
/**
 * Base error class for all FASE errors
 *
 * All custom errors extend this class to provide consistent error handling.
 * Includes error code for programmatic handling and context for debugging.
 *
 * @example
 * ```typescript
 * try {
 *   throw new FaseError('Operation failed', 'OPERATION_FAILED', { path: '/some/path' });
 * } catch (error) {
 *   if (error instanceof FaseError) {
 *     console.error(`[${error.code}] ${error.message}`);
 *     console.error('Context:', error.context);
 *   }
 * }
 * ```
 */
export class FaseError extends Error {
    /**
     * Create a new FaseError
     *
     * @param message - Human-readable error message (in Portuguese for user-facing errors)
     * @param code - Machine-readable error code (e.g., 'CONFIG_NOT_FOUND')
     * @param context - Optional context object with additional error details
     */
    constructor(message, code, context) {
        super(message);
        this.name = 'FaseError';
        this.code = code;
        this.context = context;
        this.timestamp = Date.now();
        // Capture stack trace, excluding constructor call
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert error to plain object for logging/serialization
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}
/**
 * Configuration-related errors
 *
 * Thrown when there are issues with .fase-ai/config.json or other configuration files.
 *
 * @example
 * ```typescript
 * if (!fs.existsSync(configPath)) {
 *   throw new ConfigError(
 *     'Config file not found',
 *     'CONFIG_NOT_FOUND',
 *     { path: configPath }
 *   );
 * }
 * ```
 */
export class ConfigError extends FaseError {
    constructor(message, code, context) {
        super(message, `CONFIG_${code}`, context);
        this.name = 'ConfigError';
    }
}
/**
 * File operation errors
 *
 * Thrown when file read/write operations fail.
 *
 * @example
 * ```typescript
 * try {
 *   fs.writeFileSync(filePath, content);
 * } catch (err) {
 *   throw new FileError(
 *     'Failed to write file',
 *     'WRITE_FAILED',
 *     { path: filePath, error: (err as Error).message }
 *   );
 * }
 * ```
 */
export class FileError extends FaseError {
    constructor(message, code, context) {
        super(message, `FILE_${code}`, context);
        this.name = 'FileError';
    }
}
/**
 * Input validation errors
 *
 * Thrown when user input fails validation checks.
 *
 * @example
 * ```typescript
 * if (keyPath.split('.').length > MAX_DEPTH) {
 *   throw new ValidationError(
 *     'Path depth exceeds maximum',
 *     'PATH_TOO_DEEP',
 *     { path: keyPath, maxDepth: MAX_DEPTH }
 *   );
 * }
 * ```
 */
export class ValidationError extends FaseError {
    constructor(message, code, context) {
        super(message, `VALIDATION_${code}`, context);
        this.name = 'ValidationError';
    }
}
/**
 * Path traversal security errors
 *
 * Thrown when path validation detects attempted directory escape.
 *
 * @example
 * ```typescript
 * if (!normalizedFull.startsWith(normalizedPlanej + path.sep)) {
 *   throw new PathTraversalError(
 *     'Operation must be inside .fase-ai/',
 *     'PATH_OUTSIDE_BOUNDARY',
 *     { path: filePath, boundary: '.fase-ai' }
 *   );
 * }
 * ```
 */
export class PathTraversalError extends FaseError {
    constructor(message, code, context) {
        super(message, `SECURITY_${code}`, context);
        this.name = 'PathTraversalError';
    }
}
/**
 * Provider-related errors
 *
 * Thrown when there are issues with AI provider configuration or detection.
 *
 * @example
 * ```typescript
 * if (!supportedProviders.includes(provider)) {
 *   throw new ProviderError(
 *     `Provider "${provider}" is not supported`,
 *     'UNSUPPORTED_PROVIDER',
 *     { provider, supported: supportedProviders }
 *   );
 * }
 * ```
 */
export class ProviderError extends FaseError {
    constructor(message, code, context) {
        super(message, `PROVIDER_${code}`, context);
        this.name = 'ProviderError';
    }
}
/**
 * Hook-related errors
 *
 * Thrown when hook file operations fail.
 *
 * @example
 * ```typescript
 * if (!fs.existsSync(hooksDir)) {
 *   throw new HookError(
 *     'Hooks directory not found',
 *     'HOOKS_DIR_NOT_FOUND',
 *     { path: hooksDir }
 *   );
 * }
 * ```
 */
export class HookError extends FaseError {
    constructor(message, code, context) {
        super(message, `HOOK_${code}`, context);
        this.name = 'HookError';
    }
}
/**
 * Installation-related errors
 *
 * Thrown when installation or uninstallation operations fail.
 *
 * @example
 * ```typescript
 * if (!canWrite) {
 *   throw new InstallationError(
 *     'Cannot write to installation directory',
 *     'WRITE_PERMISSION_DENIED',
 *     { path: installPath }
 *   );
 * }
 * ```
 */
export class InstallationError extends FaseError {
    constructor(message, code, context) {
        super(message, `INSTALL_${code}`, context);
        this.name = 'InstallationError';
    }
}
/**
 * Template-related errors
 *
 * Thrown when template rendering or file operations fail.
 *
 * @example
 * ```typescript
 * if (!templateExists(templateName)) {
 *   throw new TemplateError(
 *     `Template "${templateName}" not found`,
 *     'TEMPLATE_NOT_FOUND',
 *     { template: templateName }
 *   );
 * }
 * ```
 */
export class TemplateError extends FaseError {
    constructor(message, code, context) {
        super(message, `TEMPLATE_${code}`, context);
        this.name = 'TemplateError';
    }
}
/**
 * Utility function to wrap unknown errors with FaseError
 *
 * @param error - The caught error (could be Error or unknown)
 * @param defaultMessage - Default message if error is not an Error instance
 * @param defaultCode - Default error code
 * @returns A FaseError instance
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (err) {
 *   throw wrapError(err, 'Operation failed', 'OPERATION_FAILED');
 * }
 * ```
 */
export function wrapError(error, defaultMessage = 'An unexpected error occurred', defaultCode = 'UNKNOWN_ERROR', context) {
    if (error instanceof FaseError) {
        return error;
    }
    if (error instanceof Error) {
        return new FaseError(error.message || defaultMessage, defaultCode, { ...context, originalError: error.name });
    }
    return new FaseError(defaultMessage, defaultCode, { ...context, originalError: String(error) });
}
/**
 * Type guard to check if an error is a FaseError
 *
 * @param error - The error to check
 * @returns true if error is a FaseError instance
 *
 * @example
 * ```typescript
 * try {
 *   doSomething();
 * } catch (err) {
 *   if (isFaseError(err)) {
 *     console.error(`[${err.code}] ${err.message}`);
 *   } else {
 *     console.error('Unknown error:', err);
 *   }
 * }
 * ```
 */
export function isFaseError(error) {
    return error instanceof FaseError;
}
//# sourceMappingURL=errors.js.map