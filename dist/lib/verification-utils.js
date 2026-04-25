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
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { output, error } from './core.js';
/**
 * Load a file or return null with error handling
 *
 * @param fullPath - Absolute path to the file
 * @returns File content or null if not found
 */
export function loadVerificationFile(fullPath) {
    if (!fs.existsSync(fullPath)) {
        return null;
    }
    try {
        return fs.readFileSync(fullPath, 'utf-8');
    }
    catch {
        return null;
    }
}
/**
 * Resolve a file path relative to cwd
 *
 * @param cwd - Current working directory
 * @param filePath - Relative or absolute file path
 * @returns Absolute path
 */
export function resolveVerificationPath(cwd, filePath) {
    return path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
}
/**
 * Validate required parameter and error if missing
 *
 * @param value - Parameter value
 * @param paramName - Parameter name for error message
 * @throws Error if value is missing
 */
export function requireParam(value, paramName) {
    if (!value) {
        error(`${paramName} obrigatório`);
    }
}
/**
 * Output verification result with appropriate status label
 *
 * @param result - Verification result
 * @param raw - Whether to output raw JSON
 */
export function outputVerificationResult(result, raw) {
    const statusLabel = determineStatusLabel(result);
    output(result, raw, statusLabel);
}
/**
 * Determine the status label based on result structure
 */
function determineStatusLabel(result) {
    if (result.status)
        return result.status;
    if (result.passed !== undefined)
        return result.passed ? 'passed' : 'failed';
    if (result.valid !== undefined)
        return result.valid ? 'valid' : 'invalid';
    if (result.complete !== undefined)
        return result.complete ? 'complete' : 'incomplete';
    if (result.all_verified !== undefined)
        return result.all_verified ? 'valid' : 'invalid';
    if (result.all_passed !== undefined)
        return result.all_passed ? 'valid' : 'invalid';
    return 'unknown';
}
/**
 * Check if a commit hash exists in git history
 *
 * @param cwd - Current working directory
 * @param hash - Git commit hash
 * @returns true if hash is a valid commit
 */
export function isValidCommitHash(cwd, hash) {
    try {
        const output = execSync(`git -C "${cwd}" cat-file -t "${hash}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
        return output.trim() === 'commit';
    }
    catch {
        return false;
    }
}
/**
 * Check if a file exists
 *
 * @param fullPath - Absolute path to check
 * @returns true if file exists
 */
export function fileExists(fullPath) {
    return fs.existsSync(fullPath);
}
/**
 * Count lines in a file
 *
 * @param content - File content
 * @returns Number of lines
 */
export function countLines(content) {
    return content.split('\n').length;
}
/**
 * Extract @ references from content
 *
 * @param content - Content to scan
 * @returns Array of referenced paths
 */
export function extractAtReferences(content) {
    const refs = [];
    const matches = content.match(/@([^\s\n,)]+\/[^\s\n,)]+)/g) || [];
    for (const match of matches) {
        refs.push(match.slice(1));
    }
    return refs;
}
/**
 * Extract backtick file references from content
 *
 * @param content - Content to scan
 * @returns Array of referenced paths
 */
export function extractBacktickReferences(content) {
    const refs = [];
    const matches = content.match(/`([^`]+\/[^`]+\.[a-zA-Z]{1,10})`/g) || [];
    for (const match of matches) {
        const ref = match.slice(1, -1);
        if (!ref.startsWith('http') && !ref.includes('${') && !ref.includes('{{')) {
            refs.push(ref);
        }
    }
    return refs;
}
/**
 * Extract commit hashes from content
 *
 * @param content - Content to scan
 * @returns Array of commit hashes
 */
export function extractCommitHashes(content) {
    const matches = content.match(/\b[0-9a-f]{7,40}\b/g) || [];
    return matches;
}
//# sourceMappingURL=verification-utils.js.map