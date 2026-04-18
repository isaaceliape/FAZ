/**
 * Attribution — Commit attribution handling for AI providers
 * 
 * Manages Co-Authored-By lines in git commits based on provider settings.
 * Supports removing, keeping, or customizing attribution.
 * 
 * @module install/attribution
 */

import path from 'path';
import { readSettings } from './settings.js';
import { getGlobalDir } from './providers.js';
import type { ProviderRuntime } from './providers.js';

/**
 * Attribution setting result
 * - null: remove Co-Authored-By lines
 * - undefined: keep default behavior
 * - string: custom attribution text
 */
export type AttributionSetting = null | undefined | string;

/**
 * Cache for attribution settings (populated once per runtime during install)
 */
const attributionCache = new Map<ProviderRuntime, AttributionSetting>();

/**
 * Get commit attribution setting for a runtime
 * 
 * Checks provider-specific settings files:
 * - Claude Code: ~/.claude/settings.json
 * - OpenCode: ~/.config/opencode/opencode.json (disable_ai_attribution)
 * - Gemini: ~/.gemini/settings.json
 * - GitHub Copilot: ~/.github-copilot/.copilot-settings.json
 * - Codex: no attribution setting (returns undefined)
 * 
 * @param runtime - Provider runtime name
 * @param explicitConfigDir - Optional explicit config directory
 * @returns Attribution setting (null=remove, undefined=keep, string=custom)
 * 
 * @example
 * ```typescript
 * const attr = getCommitAttribution('claude');
 * if (attr === null) { /* Remove attribution *\/ }
 * ```
 */
export function getCommitAttribution(
  runtime: ProviderRuntime,
  explicitConfigDir: string | null = null
): AttributionSetting {
  // Return cached value if available
  if (attributionCache.has(runtime)) {
    return attributionCache.get(runtime);
  }
  
  let result: AttributionSetting;
  
  if (runtime === 'opencode') {
    const config = readSettings(path.join(getGlobalDir('opencode', null), 'opencode.json'));
    result = config.disable_ai_attribution === true ? null : undefined;
  } else if (runtime === 'gemini') {
    const settings = readSettings(path.join(getGlobalDir('gemini', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else if (runtime === 'claude') {
    const settings = readSettings(path.join(getGlobalDir('claude', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else if (runtime === 'github-copilot') {
    const settings = readSettings(path.join(getGlobalDir('github-copilot', explicitConfigDir), '.copilot-settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else {
    // Codex currently has no attribution setting equivalent
    result = undefined;
  }
  
  // Cache and return
  attributionCache.set(runtime, result);
  return result;
}

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
export function processAttribution(content: string, attribution: AttributionSetting): string {
  if (attribution === null) {
    // Remove Co-Authored-By lines and the preceding blank line
    return content.replace(/(\r?\n){2}Co-Authored-By:.*$/gim, '');
  }
  
  if (attribution === undefined) {
    return content;
  }
  
  // Replace with custom attribution (escape $ to prevent backreference injection)
  const safeAttribution = attribution.replace(/\$/g, '$$$$');
  return content.replace(/Co-Authored-By:.*$/gim, `Co-Authored-By: ${safeAttribution}`);
}

/**
 * Clear the attribution cache (useful for testing)
 * 
 * @example
 * ```typescript
 * clearAttributionCache();
 * ```
 */
export function clearAttributionCache(): void {
  attributionCache.clear();
}

/**
 * Check if attribution is enabled for a runtime
 * 
 * @param runtime - Provider runtime name
 * @returns true if attribution is enabled (not removed)
 */
export function isAttributionEnabled(runtime: ProviderRuntime): boolean {
  return getCommitAttribution(runtime) !== null;
}
