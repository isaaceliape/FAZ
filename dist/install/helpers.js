import os from 'os';
import { ValidationError } from '../lib/errors.js';
/**
 * Safely parses JSON with proper error handling.
 * @param jsonStr - JSON string to parse
 * @param context - Description of what's being parsed for error messages
 * @throws ValidationError if JSON parsing fails
 * @returns Parsed JSON object
 */
export function safeJsonParse(jsonStr, context = 'JSON') {
    try {
        return JSON.parse(jsonStr);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ValidationError(`Inválido ${context}: ${message}`, 'JSON_PARSE_FAILED', {
            context,
            originalMessage: message,
        });
    }
}
/**
 * Convert a pathPrefix (which uses absolute paths for global installs) to a
 * $HOME-relative form for replacing $HOME/.claude/ references in bash code blocks.
 * Preserves $HOME as a shell variable so paths remain portable across machines.
 */
export function toHomePrefix(pathPrefix) {
    const home = os.homedir().replace(/\\/g, '/');
    const normalized = pathPrefix.replace(/\\/g, '/');
    if (normalized.startsWith(home)) {
        return '$HOME' + normalized.slice(home.length);
    }
    // For relative paths or paths not under $HOME, return as-is
    return normalized;
}
//# sourceMappingURL=helpers.js.map