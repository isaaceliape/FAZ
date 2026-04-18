/**
 * Settings — Settings.json management for AI providers
 *
 * Handles reading, writing, and merging settings.json files
 * for Claude Code, OpenCode, Gemini, Codex, and GitHub Copilot.
 *
 * @module install/settings
 */
/**
 * Settings interface for type safety
 */
export interface ProviderSettings {
    [key: string]: unknown;
    attribution?: {
        commit?: string;
    };
    disable_ai_attribution?: boolean;
    hooks?: {
        [key: string]: string;
    } | string[];
}
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
export declare function readSettings(settingsPath: string): ProviderSettings;
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
export declare function writeSettings(settingsPath: string, settings: ProviderSettings): void;
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
export declare function ensureSettingsDir(settingsPath: string): void;
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
export declare function mergeSettings(settingsPath: string, newSettings: ProviderSettings, options?: {
    overwrite?: boolean;
}): ProviderSettings;
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
export declare function removeHook(settingsPath: string, hookPattern: string): boolean;
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
export declare function addHook(settingsPath: string, hookPattern: string, hookName?: string): void;
/**
 * Check if settings file exists
 *
 * @param settingsPath - Path to settings.json
 * @returns true if file exists
 */
export declare function settingsExist(settingsPath: string): boolean;
/**
 * Validate settings JSON structure
 *
 * @param settingsPath - Path to settings.json
 * @returns { valid: boolean, error?: string }
 */
export declare function validateSettings(settingsPath: string): {
    valid: boolean;
    error?: string;
};
