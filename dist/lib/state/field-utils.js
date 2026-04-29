/**
 * State Field Utilities — Extract and replace fields in STATE.md content
 *
 * Pure string manipulation functions with no file I/O.
 */
import { escapeRegex } from '../core.js';
/**
 * Extract a field value from STATE.md content.
 * Supports both bold format (**Field:** value) and plain format (Field: value).
 */
export function stateExtractField(content, fieldName) {
    const escaped = escapeRegex(fieldName);
    const boldPattern = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+)`, 'i');
    const boldMatch = content.match(boldPattern);
    if (boldMatch)
        return boldMatch[1].trim();
    const plainPattern = new RegExp(`^${escaped}:\\s*(.+)`, 'im');
    const plainMatch = content.match(plainPattern);
    return plainMatch ? plainMatch[1].trim() : null;
}
/**
 * Replace a field value in STATE.md content.
 * Supports both bold format and plain format.
 * Returns the modified content, or null if the field wasn't found.
 */
export function stateReplaceField(content, fieldName, newValue) {
    const escaped = escapeRegex(fieldName);
    const boldPattern = new RegExp(`(\\*\\*${escaped}:\\*\\*\\s*)(.*)`, 'i');
    if (boldPattern.test(content)) {
        return content.replace(boldPattern, (_match, prefix) => `${prefix}${newValue}`);
    }
    const plainPattern = new RegExp(`(^${escaped}:\\s*)(.*)`, 'im');
    if (plainPattern.test(content)) {
        return content.replace(plainPattern, (_match, prefix) => `${prefix}${newValue}`);
    }
    return null;
}
//# sourceMappingURL=field-utils.js.map