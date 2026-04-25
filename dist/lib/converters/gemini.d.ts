/**
 * Gemini Converter — Convert FASE content to Gemini CLI format
 *
 * Gemini-specific transformations:
 * - Tool names: snake_case (read_file, write_file, run_shell_command)
 * - Tools in frontmatter: YAML array format (not object)
 * - Color: removed (causes validation error)
 * - MCP tools: excluded (auto-discovered at runtime)
 * - ${VAR} patterns: escaped to $VAR (Gemini treats ${word} as template variables)
 * - <sub> tags: stripped and converted to italic *(text)*
 * - Agent name: normalized to lowercase slug without accents
 *
 * @module lib/converters/gemini
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * Gemini Converter
 */
export declare const GeminiConverter: ProviderConverter;
