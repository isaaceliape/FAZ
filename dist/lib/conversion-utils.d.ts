/**
 * Conversion Utilities — Shared utilities for provider converters
 *
 * Common operations used across all provider converters:
 * - Frontmatter extraction and parsing
 * - YAML quoting and formatting
 * - Tool name mapping application
 * - Path replacement
 *
 * @module lib/conversion-utils
 */
import type { PathReplacement } from './provider-converter.js';
/**
 * Color name to hex mapping for providers that require hex colors
 */
export declare const colorNameToHex: Record<string, string>;
/**
 * Extract frontmatter and body from markdown content
 *
 * @param content - Markdown file content
 * @returns Object with frontmatter string (or null) and body
 */
export declare function extractFrontmatterAndBody(content: string): {
    frontmatter: string | null;
    body: string;
};
/**
 * Extract a specific field from frontmatter string
 *
 * @param frontmatter - Frontmatter string (without --- delimiters)
 * @param fieldName - Field name to extract
 * @returns Field value or null if not found
 */
export declare function extractFrontmatterField(frontmatter: string | null, fieldName: string): string | null;
/**
 * Convert string to single line (replace whitespace with single space)
 *
 * @param value - String with potential multi-line content
 * @returns Single-line string
 */
export declare function toSingleLine(value: string): string;
/**
 * Quote a value for YAML (using JSON.stringify for proper escaping)
 *
 * @param value - String to quote
 * @returns YAML-quoted string
 */
export declare function yamlQuote(value: string): string;
/**
 * Apply tool name mapping to content
 *
 * Replaces tool name references in markdown content based on the provided mapping.
 * Handles both standalone references and tool list items.
 *
 * @param content - Content with tool name references
 * @param toolMapping - Map of Claude tool names to provider tool names
 * @returns Content with tool names replaced
 */
export declare function applyToolMapping(content: string, toolMapping: Record<string, string>): string;
/**
 * Apply path replacements to content
 *
 * @param content - Content with path references
 * @param replacements - Array of from/to replacement patterns
 * @returns Content with paths replaced
 */
export declare function applyPathReplacements(content: string, replacements: PathReplacement[]): string;
/**
 * Convert slash commands to skill mentions (for Codex)
 *
 * @param content - Content with slash commands
 * @returns Content with skill mentions
 */
export declare function convertSlashCommandsToSkillMentions(content: string): string;
/**
 * Strip HTML <sub> tags for terminal output
 *
 * Converts <sub>text</sub> to italic *(text)* for readable terminal output.
 *
 * @param content - Content with potential <sub> tags
 * @returns Content with <sub> tags converted
 */
export declare function stripSubTags(content: string): string;
/**
 * Escape ${VAR} patterns for Gemini CLI compatibility
 *
 * Gemini's templateString() treats ${word} as template variables.
 * Convert to $VAR (no braces) which is equivalent bash.
 *
 * @param content - Content with potential ${VAR} patterns
 * @returns Content with ${VAR} converted to $VAR
 */
export declare function escapeTemplateVariables(content: string): string;
/**
 * Fix TOML escaping issues in agent instructions
 *
 * Handles:
 * - Backticks: \` → \\` (escapes backslashes for TOML)
 * - Grep patterns: \| → | (pipes don't need escaping in grep -E)
 *
 * @param content - Content with potential TOML escaping issues
 * @returns Content with TOML escaping fixed
 */
export declare function fixTomlEscaping(content: string): string;
/**
 * Normalize agent name to valid slug (lowercase, no accents)
 *
 * @param name - Agent name
 * @returns Normalized slug
 */
export declare function normalizeAgentName(name: string): string;
/**
 * Build YAML frontmatter from field map
 *
 * @param fields - Map of field name to value
 * @returns YAML frontmatter string with --- delimiters
 */
export declare function buildFrontmatter(fields: Record<string, string | undefined>): string;
/**
 * Parse allowed-tools from frontmatter
 *
 * Handles both YAML array format and comma-separated string format.
 *
 * @param frontmatter - Frontmatter string
 * @returns Array of tool names
 */
export declare function parseAllowedTools(frontmatter: string | null): string[];
