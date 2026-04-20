/**
 * Frontmatter Conversion — Convert agent frontmatter between provider formats
 *
 * Handles conversion of Claude Code agent format to OpenCode, Gemini, and Codex formats.
 * Includes tool name mapping, color conversion, and format-specific transformations.
 *
 * @module install/frontmatter-convert
 */
/**
 * Color name to hex mapping for opencode compatibility
 */
export declare const colorNameToHex: Record<string, string>;
/**
 * Tool name mapping from Claude Code to OpenCode
 * OpenCode uses lowercase tool names; special mappings for renamed tools
 */
export declare const claudeToOpencodeTools: Record<string, string>;
/**
 * Tool name mapping from Claude Code to Gemini CLI
 * Gemini CLI uses snake_case built-in tool names
 */
export declare const claudeToGeminiTools: Record<string, string>;
/**
 * Convert a Claude Code tool name to OpenCode format
 *
 * @param claudeTool - Claude Code tool name
 * @returns OpenCode tool name
 */
export declare function convertToolName(claudeTool: string): string;
/**
 * Convert a Claude Code tool name to Gemini CLI format
 * Filters out MCP tools and Task (auto-registered in Gemini)
 *
 * @param claudeTool - Claude Code tool name
 * @returns Gemini tool name or null if should be excluded
 */
export declare function convertGeminiToolName(claudeTool: string): string | null;
/**
 * Extract frontmatter and body from markdown content
 *
 * @param content - Markdown file content
 * @returns Object with frontmatter string and body
 */
export declare function extractFrontmatterAndBody(content: string): {
    frontmatter: string | null;
    body: string;
};
/**
 * Extract a specific field from frontmatter
 *
 * @param frontmatter - Frontmatter string
 * @param fieldName - Field name to extract
 * @returns Field value or null
 */
export declare function extractFrontmatterField(frontmatter: string, fieldName: string): string | null;
/**
 * Convert string to single line (replace whitespace with single space)
 */
export declare function toSingleLine(value: string): string;
/**
 * Quote a value for YAML
 */
export declare function yamlQuote(value: string): string;
/**
 * Convert slash commands to Codex skill mentions
 *
 * @param content - Content with slash commands
 * @returns Content with skill mentions
 */
export declare function convertSlashCommandsToCodexSkillMentions(content: string): string;
/**
 * Convert Claude agent content to Codex format
 *
 * @param content - Claude agent content
 * @returns Codex agent content
 */
export declare function convertClaudeToCodexMarkdown(content: string): string;
/**
 * Get Codex skill adapter header
 *
 * @param skillName - Name of the skill
 * @returns Skill adapter header markdown
 */
export declare function getCodexSkillAdapterHeader(skillName: string): string;
/**
 * Convert Claude Code agent content to Qwen Code command format
 * Qwen Commands use markdown files with optional YAML frontmatter
 * - Only 'description' is supported in frontmatter
 * - tools, color, skills are stripped (not supported)
 * - Command name comes from filename, not frontmatter
 *
 * @param content - Claude agent content
 * @returns Qwen command content
 */
export declare function convertClaudeToQwenCommand(content: string): string;
