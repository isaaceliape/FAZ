/**
 * OpenCode Converter — Convert FASE content to OpenCode format
 *
 * OpenCode-specific transformations:
 * - Tool names: lowercase, special mappings (AskUserQuestion → question)
 * - Colors: convert names to hex values
 * - Commands: flattened structure (fase-help.md, not help.md)
 * - Tools in frontmatter: object format with boolean values
 *
 * @module lib/converters/opencode
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * OpenCode Converter
 */
export declare const OpenCodeConverter: ProviderConverter;
