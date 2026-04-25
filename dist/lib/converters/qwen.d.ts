/**
 * Qwen Converter — Convert FASE content to Qwen Code format
 *
 * Qwen-specific transformations:
 * - Commands: markdown files with optional YAML frontmatter
 * - Frontmatter: only 'description' is supported (name, tools, color, skills stripped)
 * - Command name: comes from filename, not frontmatter
 * - Path replacements: ~/.claude → .qwen, ~/.fase → .qwen
 *
 * @module lib/converters/qwen
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * Qwen Converter
 */
export declare const QwenConverter: ProviderConverter;
