/**
 * Verification Utilities — Common patterns for verification functions
 *
 * Provides shared types and helper functions for the verification suite:
 * - VerificationResult type for consistent output structure
 * - File loading with error handling
 * - Error/warning collection helpers
 * - Output formatting
 *
 * @module lib/verification-utils
 */
/**
 * Severity levels for verification issues
 */
export type VerificationSeverity = 'error' | 'warning' | 'info';
/**
 * A single verification issue
 */
export interface VerificationIssue {
    code?: string;
    message: string;
    fix?: string;
    repairable?: boolean;
}
/**
 * Common verification result structure
 */
export interface VerificationResult {
    /** Overall pass/fail status */
    passed?: boolean;
    /** Valid/invalid status (alternative to passed) */
    valid?: boolean;
    /** Complete/incomplete status (for phase checks) */
    complete?: boolean;
    /** All verified status (for link checks) */
    all_verified?: boolean;
    /** All passed status (for artifact checks) */
    all_passed?: boolean;
    /** Health status (for health checks) */
    status?: 'ok' | 'quebrado' | 'needs_attention';
    /** Errors found */
    errors: string[] | VerificationIssue[];
    /** Warnings found */
    warnings?: string[] | VerificationIssue[];
    /** Info messages */
    info?: VerificationIssue[];
    /** Additional context-specific data */
    [key: string]: unknown;
}
/**
 * Load a file or return null with error handling
 *
 * @param fullPath - Absolute path to the file
 * @returns File content or null if not found
 */
export declare function loadVerificationFile(fullPath: string): string | null;
/**
 * Resolve a file path relative to cwd
 *
 * @param cwd - Current working directory
 * @param filePath - Relative or absolute file path
 * @returns Absolute path
 */
export declare function resolveVerificationPath(cwd: string, filePath: string): string;
/**
 * Validate required parameter and error if missing
 *
 * @param value - Parameter value
 * @param paramName - Parameter name for error message
 * @throws Error if value is missing
 */
export declare function requireParam(value: string | undefined, paramName: string): void;
/**
 * Output verification result with appropriate status label
 *
 * @param result - Verification result
 * @param raw - Whether to output raw JSON
 */
export declare function outputVerificationResult(result: VerificationResult, raw: boolean): void;
/**
 * Check if a commit hash exists in git history
 *
 * @param cwd - Current working directory
 * @param hash - Git commit hash
 * @returns true if hash is a valid commit
 */
export declare function isValidCommitHash(cwd: string, hash: string): boolean;
/**
 * Check if a file exists
 *
 * @param fullPath - Absolute path to check
 * @returns true if file exists
 */
export declare function fileExists(fullPath: string): boolean;
/**
 * Count lines in a file
 *
 * @param content - File content
 * @returns Number of lines
 */
export declare function countLines(content: string): number;
/**
 * Extract @ references from content
 *
 * @param content - Content to scan
 * @returns Array of referenced paths
 */
export declare function extractAtReferences(content: string): string[];
/**
 * Extract backtick file references from content
 *
 * @param content - Content to scan
 * @returns Array of referenced paths
 */
export declare function extractBacktickReferences(content: string): string[];
/**
 * Extract commit hashes from content
 *
 * @param content - Content to scan
 * @returns Array of commit hashes
 */
export declare function extractCommitHashes(content: string): string[];
