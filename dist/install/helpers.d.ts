/**
 * Safely parses JSON with proper error handling.
 * @param jsonStr - JSON string to parse
 * @param context - Description of what's being parsed for error messages
 * @param options - Options for error handling (exitOnError: whether to exit on failure)
 * @returns Parsed JSON object, or null if parsing fails and exitOnError is false
 */
export declare function safeJsonParse(jsonStr: string, context?: string, options?: {
    exitOnError: boolean;
}): unknown;
/**
 * Convert a pathPrefix (which uses absolute paths for global installs) to a
 * $HOME-relative form for replacing $HOME/.claude/ references in bash code blocks.
 * Preserves $HOME as a shell variable so paths remain portable across machines.
 */
export declare function toHomePrefix(pathPrefix: string): string;
