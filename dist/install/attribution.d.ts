/**
 * Attribution — Commit attribution handling for AI providers
 *
 * Manages Co-Authored-By lines in git commits based on provider settings.
 * Supports removing, keeping, or customizing attribution.
 * Uses project-local configuration directories only.
 *
 * @module install/attribution
 */
import type { ProviderRuntime } from './providers.js';
/**
 * Attribution setting result
 * - null: remove Co-Authored-By lines
 * - undefined: keep default behavior
 * - string: custom attribution text
 */
export type AttributionSetting = null | undefined | string;
/**
 * Get commit attribution setting for a runtime
 *
 * Checks provider-specific settings files in project-local directories:
 * - Claude Code: ./.claude/settings.json
 * - OpenCode: ./.opencode/opencode.json (disable_ai_attribution)
 * - Gemini: ./.gemini/settings.json
 * - GitHub Copilot: ./.copilot/.copilot-settings.json
 * - Codex: no attribution setting (returns undefined)
 *
 * @param runtime - Provider runtime name
 * @returns Attribution setting (null=remove, undefined=keep, string=custom)
 *
 * @example
 * ```typescript
 * const attr = getCommitAttribution('claude');
 * if (attr === null) { /* Remove attribution *\/ }
 * ```
 */
export declare function getCommitAttribution(runtime: ProviderRuntime): AttributionSetting;
/**
 * Process Co-Authored-By lines based on attribution setting
 *
 * @param content - File content to process (e.g., hook file template)
 * @param attribution - Attribution setting (null=remove, undefined=keep, string=replace)
 * @returns Processed content
 *
 * @example
 * ```typescript
 * const content = 'Some text\nCo-Authored-By: AI Assistant';
 * const processed = processAttribution(content, null); // Removes Co-Authored-By line
 * ```
 */
export declare function processAttribution(content: string, attribution: AttributionSetting): string;
/**
 * Clear the attribution cache (useful for testing)
 *
 * @example
 * ```typescript
 * clearAttributionCache();
 * ```
 */
export declare function clearAttributionCache(): void;
/**
 * Check if attribution is enabled for a runtime
 *
 * @param runtime - Provider runtime name
 * @returns true if attribution is enabled (not removed)
 */
export declare function isAttributionEnabled(runtime: ProviderRuntime): boolean;
