/**
 * Codex Converter — Convert FASE content to Codex format
 *
 * Codex-specific transformations:
 * - Agents: Add <codex_agent_role> header block
 * - Commands: Convert to skills with SKILL.md structure
 * - Slash commands: /fase-command → $fase-command (skill mentions)
 * - $ARGUMENTS: → {{FASE_ARGS}}
 * - Per-agent .toml: Generated separately (handled by installer, not converter)
 *
 * Note: The per-agent .toml file generation is handled as a special case
 * in the installer, not in this converter interface.
 *
 * @module lib/converters/codex
 */
import type { ProviderConverter } from '../provider-converter.js';
/**
 * Codex Converter
 */
export declare const CodexConverter: ProviderConverter;
