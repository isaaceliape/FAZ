/**
 * Settings — Settings.json management for AI providers
 *
 * Handles reading, writing, and merging settings.json files
 * for Claude Code, OpenCode, Gemini, Codex, and GitHub Copilot.
 *
 * @module install/settings
 */
import fs from 'fs';
import path from 'path';
/**
 * Read and parse settings.json, returning empty object if it doesn't exist
 *
 * @param settingsPath - Path to settings.json file
 * @returns Parsed settings object or empty object
 *
 * @example
 * ```typescript
 * const settings = readSettings('~/.claude/settings.json');
 * if (settings.hooks) { ... }
 * ```
 */
export function readSettings(settingsPath) {
    if (fs.existsSync(settingsPath)) {
        try {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }
        catch {
            return {};
        }
    }
    return {};
}
/**
 * Write settings.json with proper formatting (2-space indent + newline)
 *
 * @param settingsPath - Path to settings.json file
 * @param settings - Settings object to write
 *
 * @example
 * ```typescript
 * writeSettings('~/.claude/settings.json', { hooks: {...} });
 * ```
 */
export function writeSettings(settingsPath, settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}
/**
 * Ensure settings directory exists
 *
 * @param settingsPath - Path to settings.json (directory will be created)
 *
 * @example
 * ```typescript
 * ensureSettingsDir('~/.claude/settings.json');
 * ```
 */
export function ensureSettingsDir(settingsPath) {
    const settingsDir = path.dirname(settingsPath);
    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
    }
}
/**
 * Merge new settings with existing settings
 *
 * @param settingsPath - Path to settings.json
 * @param newSettings - New settings to merge
 * @param options - Merge options
 * @param options.overwrite - If true, overwrite existing keys (default: false)
 * @returns Merged settings object
 *
 * @example
 * ```typescript
 * const merged = mergeSettings('~/.claude/settings.json', { hooks: {...} });
 * ```
 */
export function mergeSettings(settingsPath, newSettings, options = {}) {
    const existing = readSettings(settingsPath);
    const { overwrite = false } = options;
    if (overwrite) {
        return { ...existing, ...newSettings };
    }
    // Deep merge for hooks
    const merged = { ...existing };
    if (newSettings.hooks && existing.hooks) {
        merged.hooks = { ...existing.hooks, ...newSettings.hooks };
    }
    else if (newSettings.hooks) {
        merged.hooks = newSettings.hooks;
    }
    // Merge other top-level keys
    for (const [key, value] of Object.entries(newSettings)) {
        if (key !== 'hooks' && !(key in existing)) {
            merged[key] = value;
        }
    }
    return merged;
}
/**
 * Remove a hook pattern from settings
 *
 * @param settingsPath - Path to settings.json
 * @param hookPattern - Hook pattern to remove
 * @returns true if hook was removed, false if not found
 *
 * @example
 * ```typescript
 * const removed = removeHook('~/.claude/settings.json', 'fase-*');
 * ```
 */
export function removeHook(settingsPath, hookPattern) {
    const settings = readSettings(settingsPath);
    if (!settings.hooks) {
        return false;
    }
    if (Array.isArray(settings.hooks)) {
        const index = settings.hooks.indexOf(hookPattern);
        if (index !== -1) {
            settings.hooks.splice(index, 1);
            writeSettings(settingsPath, settings);
            return true;
        }
        return false;
    }
    // Object format
    for (const [key, value] of Object.entries(settings.hooks)) {
        if (value === hookPattern) {
            delete settings.hooks[key];
            writeSettings(settingsPath, settings);
            return true;
        }
    }
    return false;
}
/**
 * Add a hook pattern to settings
 *
 * @param settingsPath - Path to settings.json
 * @param hookPattern - Hook pattern to add
 * @param hookName - Optional name for the hook (for object format)
 *
 * @example
 * ```typescript
 * addHook('~/.claude/settings.json', 'fase-*', 'fase_commands');
 * ```
 */
export function addHook(settingsPath, hookPattern, hookName) {
    const settings = readSettings(settingsPath);
    if (!settings.hooks) {
        settings.hooks = {};
    }
    if (Array.isArray(settings.hooks)) {
        if (!settings.hooks.includes(hookPattern)) {
            settings.hooks.push(hookPattern);
        }
    }
    else {
        const name = hookName || `hook_${Date.now()}`;
        if (!(name in settings.hooks)) {
            settings.hooks[name] = hookPattern;
        }
    }
    writeSettings(settingsPath, settings);
}
/**
 * Check if settings file exists
 *
 * @param settingsPath - Path to settings.json
 * @returns true if file exists
 */
export function settingsExist(settingsPath) {
    return fs.existsSync(settingsPath);
}
/**
 * Validate settings JSON structure
 *
 * @param settingsPath - Path to settings.json
 * @returns { valid: boolean, error?: string }
 */
export function validateSettings(settingsPath) {
    if (!fs.existsSync(settingsPath)) {
        return { valid: true }; // Missing is OK, will be created
    }
    try {
        const content = fs.readFileSync(settingsPath, 'utf8');
        JSON.parse(content);
        return { valid: true };
    }
    catch (err) {
        return {
            valid: false,
            error: `Invalid JSON: ${err.message}`
        };
    }
}
//# sourceMappingURL=settings.js.map