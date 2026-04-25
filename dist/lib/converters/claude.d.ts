/**
 * Claude Converter — Identity converter for Claude Code format
 *
 * Claude is the source format for FASE content. This converter provides
 * identity transformations with path replacements, useful for:
 * - Testing the converter interface
 * - Copying Claude files to target directories with path updates
 *
 * @module lib/converters/claude
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * Claude Converter
 *
 * Identity transformations: tool names unchanged, minimal frontmatter changes.
 * Applies path replacements for project-local installs.
 */
export declare const ClaudeConverter: ProviderConverter;
