/**
 * Copilot Converter — Convert FASE content to GitHub Copilot format
 *
 * Copilot-specific transformations:
 * - Tool names: snake_case (similar to Gemini)
 * - Tools in frontmatter: boolean flags (tools: read_file: true)
 * - Commands: flattened structure (fase-help.md)
 * - /fase:command → /fase-command (flat command structure)
 * - name field: removed (uses filename)
 * - color/skills: removed (not supported)
 * - subagent_type: "general-purpose" → "general"
 *
 * @module lib/converters/copilot
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * Copilot Converter
 */
export declare const CopilotConverter: ProviderConverter;
