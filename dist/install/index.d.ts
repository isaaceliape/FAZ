/**
 * FASE Installer — Module Entry Point
 *
 * Re-exports all installation modules for use in the main install.ts script.
 *
 * @module install
 */
export * from './constants.js';
export * from './helpers.js';
export * from './providers.js';
export { readSettings, writeSettings, ensureSettingsDir, mergeSettings, addHook, settingsExist, validateSettings, type ProviderSettings, } from './settings.js';
export * from './attribution.js';
export * from './hooks.js';
export * from './uninstall.js';
/**
 * Provider conversion has been refactored to src/lib/converters/
 * See src/lib/provider-converter.ts for the interface
 * See src/lib/converters/*.ts for provider-specific converters
 */
