/**
 * State Field Utilities — Extract and replace fields in STATE.md content
 *
 * Pure string manipulation functions with no file I/O.
 */
/**
 * Extract a field value from STATE.md content.
 * Supports both bold format (**Field:** value) and plain format (Field: value).
 */
export declare function stateExtractField(content: string, fieldName: string): string | null;
/**
 * Replace a field value in STATE.md content.
 * Supports both bold format and plain format.
 * Returns the modified content, or null if the field wasn't found.
 */
export declare function stateReplaceField(content: string, fieldName: string, newValue: string): string | null;
