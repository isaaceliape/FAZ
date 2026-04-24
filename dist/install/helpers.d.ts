/**
 * Safely parses JSON with proper error handling.
 * @param jsonStr - JSON string to parse
 * @param context - Description of what's being parsed for error messages
 * @throws ValidationError if JSON parsing fails
 * @returns Parsed JSON object
 */
export declare function safeJsonParse(jsonStr: string, context?: string): unknown;
/**
 * Convert a pathPrefix (which uses absolute paths for global installs) to a
 * $HOME-relative form for replacing $HOME/.claude/ references in bash code blocks.
 * Preserves $HOME as a shell variable so paths remain portable across machines.
 */
export declare function toHomePrefix(pathPrefix: string): string;
