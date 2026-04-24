/**
 * Attribution — Commit attribution handling for AI providers
 *
 * Manages Co-Authored-By lines in git commits based on provider settings.
 * Supports removing, keeping, or customizing attribution.
 * Uses project-local configuration directories only.
 *
 * @module install/attribution
 */
import path from 'path';
import { readSettings } from './settings.js';
import { getDirName } from './providers.js';
/**
 * Cache for attribution settings (populated once per runtime during install)
 */
const attributionCache = new Map();
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
export function getCommitAttribution(runtime) {
    // Return cached value if available
    if (attributionCache.has(runtime)) {
        return attributionCache.get(runtime);
    }
    let result;
    const configDir = path.join(process.cwd(), getDirName(runtime));
    if (runtime === 'opencode') {
        const config = readSettings(path.join(configDir, 'opencode.json'));
        result = config.disable_ai_attribution === true ? null : undefined;
    }
    else if (runtime === 'gemini') {
        const settings = readSettings(path.join(configDir, 'settings.json'));
        if (!settings.attribution || settings.attribution.commit === undefined) {
            result = undefined;
        }
        else if (settings.attribution.commit === '') {
            result = null;
        }
        else {
            result = settings.attribution.commit;
        }
    }
    else if (runtime === 'claude') {
        const settings = readSettings(path.join(configDir, 'settings.json'));
        if (!settings.attribution || settings.attribution.commit === undefined) {
            result = undefined;
        }
        else if (settings.attribution.commit === '') {
            result = null;
        }
        else {
            result = settings.attribution.commit;
        }
    }
    else if (runtime === 'copilot') {
        const settings = readSettings(path.join(configDir, '.copilot-settings.json'));
        if (!settings.attribution || settings.attribution.commit === undefined) {
            result = undefined;
        }
        else if (settings.attribution.commit === '') {
            result = null;
        }
        else {
            result = settings.attribution.commit;
        }
    }
    else {
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
export function processAttribution(content, attribution) {
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
export function clearAttributionCache() {
    attributionCache.clear();
}
/**
 * Check if attribution is enabled for a runtime
 *
 * @param runtime - Provider runtime name
 * @returns true if attribution is enabled (not removed)
 */
export function isAttributionEnabled(runtime) {
    return getCommitAttribution(runtime) !== null;
}
//# sourceMappingURL=attribution.js.map