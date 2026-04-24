/**
 * Uninstall — FASE uninstallation logic
 *
 * Handles complete removal of FASE from a provider,
 * including settings, hooks, and configuration files.
 * Uninstalls from project-local configuration directories only.
 *
 * @module install/uninstall
 */
import { type ProviderRuntime } from './providers.js';
/**
 * Uninstall result
 */
export interface UninstallResult {
    success: boolean;
    removed: {
        settings: boolean;
        hooks: boolean;
        versionFile: boolean;
        faseDir: boolean;
    };
    errors: string[];
}
/**
 * Remove FASE hooks from settings
 *
 * @param settingsPath - Path to settings.json
 * @returns true if hooks were removed
 */
export declare function removeFaseHooksFromSettings(settingsPath: string): boolean;
/**
 * Remove FASE hooks directory
 *
 * @param configDir - Configuration directory
 * @returns true if hooks were removed
 */
export declare function removeFaseHooksDir(configDir: string): boolean;
/**
 * Remove FASE version file
 *
 * @param configDir - Configuration directory
 * @returns true if version file was removed
 */
export declare function removeVersionFile(configDir: string): boolean;
/**
 * Remove entire FASE configuration directory
 *
 * @param configDir - Configuration directory
 * @returns true if directory was removed
 */
export declare function removeFaseDir(configDir: string): boolean;
/**
 * Completely uninstall FASE from a provider
 *
 * @param runtime - Provider runtime
 * @returns Uninstall result with details
 */
export declare function uninstallFase(runtime: ProviderRuntime): UninstallResult;
/**
 * Check if FASE is installed for a provider
 *
 * @param runtime - Provider runtime
 * @returns true if FASE is installed
 */
export declare function isFaseInstalled(runtime: ProviderRuntime): boolean;
