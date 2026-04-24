/**
 * Uninstall — FASE uninstallation logic
 *
 * Handles complete removal of FASE from a provider,
 * including settings, hooks, and configuration files.
 *
 * @module install/uninstall
 */
import fs from 'fs';
import path from 'path';
import { readSettings, writeSettings } from './settings.js';
import { getGlobalDir } from './providers.js';
/**
 * Remove FASE hooks from settings
 *
 * @param settingsPath - Path to settings.json
 * @returns true if hooks were removed
 */
export function removeFaseHooksFromSettings(settingsPath) {
    const settings = readSettings(settingsPath);
    if (!settings.hooks) {
        return false;
    }
    let changed = false;
    const hooks = settings.hooks;
    if (Array.isArray(hooks)) {
        const originalLength = hooks.length;
        settings.hooks = hooks.filter((h) => !String(h).startsWith('fase-'));
        changed = settings.hooks.length !== originalLength;
    }
    else {
        // Type assertion: we know it's an object here
        const hooksObj = hooks;
        const settingsObj = settings.hooks;
        for (const key of Object.keys(hooksObj)) {
            if (String(hooksObj[key]).startsWith('fase-')) {
                delete settingsObj[key];
                changed = true;
            }
        }
    }
    if (changed) {
        writeSettings(settingsPath, settings);
    }
    return changed;
}
/**
 * Remove FASE hooks directory
 *
 * @param configDir - Configuration directory
 * @returns true if hooks were removed
 */
export function removeFaseHooksDir(configDir) {
    const hooksDir = path.join(configDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        return false;
    }
    try {
        const files = fs.readdirSync(hooksDir);
        const faseFiles = files.filter((f) => f.startsWith('fase-'));
        for (const file of faseFiles) {
            fs.unlinkSync(path.join(hooksDir, file));
        }
        // Remove hooks dir if empty
        const remaining = fs.readdirSync(hooksDir);
        if (remaining.length === 0) {
            fs.rmdirSync(hooksDir);
        }
        return faseFiles.length > 0;
    }
    catch {
        return false;
    }
}
/**
 * Remove FASE version file
 *
 * @param configDir - Configuration directory
 * @returns true if version file was removed
 */
export function removeVersionFile(configDir) {
    const versionPath = path.join(configDir, 'fase-ai', 'VERSION');
    if (fs.existsSync(versionPath)) {
        fs.unlinkSync(versionPath);
        // Remove fase-ai dir if empty
        const faseDir = path.join(configDir, 'fase-ai');
        try {
            const files = fs.readdirSync(faseDir);
            if (files.length === 0) {
                fs.rmdirSync(faseDir);
            }
        }
        catch {
            // Ignore
        }
        return true;
    }
    return false;
}
/**
 * Remove entire FASE configuration directory
 *
 * @param configDir - Configuration directory
 * @returns true if directory was removed
 */
export function removeFaseDir(configDir) {
    const faseDir = path.join(configDir, 'fase-ai');
    if (fs.existsSync(faseDir)) {
        try {
            fs.rmSync(faseDir, { recursive: true, force: true });
            return true;
        }
        catch {
            return false;
        }
    }
    return false;
}
/**
 * Completely uninstall FASE from a provider
 *
 * @param runtime - Provider runtime
 * @param explicitConfigDir - Optional explicit config directory
 * @returns Uninstall result with details
 */
export function uninstallFase(runtime, explicitConfigDir = null) {
    const result = {
        success: true,
        removed: {
            settings: false,
            hooks: false,
            versionFile: false,
            faseDir: false,
        },
        errors: [],
    };
    const configDir = getGlobalDir(runtime, explicitConfigDir);
    try {
        // Remove hooks from settings
        const settingsPath = path.join(configDir, runtime === 'opencode'
            ? 'opencode.json'
            : runtime === 'copilot'
                ? '.copilot-settings.json'
                : 'settings.json');
        if (fs.existsSync(settingsPath)) {
            result.removed.settings = removeFaseHooksFromSettings(settingsPath);
        }
        // Remove hook files
        result.removed.hooks = removeFaseHooksDir(configDir);
        // Remove version file
        result.removed.versionFile = removeVersionFile(configDir);
        // Remove fase-ai directory
        result.removed.faseDir = removeFaseDir(configDir);
    }
    catch (err) {
        result.success = false;
        result.errors.push(err.message);
    }
    return result;
}
/**
 * Check if FASE is installed for a provider
 *
 * @param runtime - Provider runtime
 * @param explicitConfigDir - Optional explicit config directory
 * @returns true if FASE is installed
 */
export function isFaseInstalled(runtime, explicitConfigDir = null) {
    const configDir = getGlobalDir(runtime, explicitConfigDir);
    const versionPath = path.join(configDir, 'fase-ai', 'VERSION');
    return fs.existsSync(versionPath);
}
//# sourceMappingURL=uninstall.js.map