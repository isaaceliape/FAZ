/**
 * Provider Converter — Interface for converting FASE content between provider formats
 *
 * Each provider (Claude, OpenCode, Gemini, Codex, Copilot, Qwen) has a converter
 * that transforms agent and command files from Claude format to the target format.
 *
 * @module lib/provider-converter
 */
/**
 * Supported AI coding assistant providers
 */
export type ProviderRuntime = 'claude' | 'opencode' | 'gemini' | 'codex' | 'copilot' | 'qwen';
/**
 * Runtime context for conversion operations
 */
export interface ConversionContext {
    /** Current working directory */
    cwd: string;
    /** Target directory path for path replacements (e.g., '.opencode/') */
    pathPrefix: string;
}
/**
 * Result of a file conversion
 */
export interface ConvertedFile {
    /** Output filename (may differ from source, e.g., flattened commands) */
    filename: string;
    /** Converted file content */
    content: string;
}
/**
 * Path replacement pattern
 */
export interface PathReplacement {
    /** Pattern to search for (e.g., '~/.claude/') */
    from: string;
    /** Replacement string (e.g., '.opencode/') */
    to: string;
}
/**
 * Provider Converter Interface
 *
 * Converts FASE agents and commands from Claude format to a target provider format.
 * Implementations are plain objects with these properties and methods.
 */
export interface ProviderConverter {
    /** Provider name identifier */
    readonly name: ProviderRuntime;
    /** Directory name for this provider (e.g., '.claude', '.opencode') */
    readonly dirName: string;
    /**
     * Convert an agent .md file from Claude format to provider format
     *
     * @param content - Claude agent markdown content
     * @param context - Conversion context with cwd and pathPrefix
     * @returns Converted agent file
     */
    convertAgent(content: string, context: ConversionContext): ConvertedFile;
    /**
     * Convert a command .md file from Claude format to provider format
     *
     * @param content - Claude command markdown content
     * @param filename - Source filename (used for flattening decisions)
     * @param context - Conversion context with cwd and pathPrefix
     * @returns Converted command file
     */
    convertCommand(content: string, filename: string, context: ConversionContext): ConvertedFile;
    /**
     * Get tool name mapping from Claude tools to provider tools
     *
     * @returns Map of Claude tool name to provider tool name
     */
    getToolMapping(): Record<string, string>;
    /**
     * Get path replacement patterns for this provider
     *
     * @param context - Conversion context with pathPrefix
     * @returns Array of from/to replacement patterns
     */
    getPathReplacements(context: ConversionContext): PathReplacement[];
}
