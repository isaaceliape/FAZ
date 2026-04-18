/**
 * FASE Installer — Module Entry Point
 *
 * Re-exports all installation modules for use in the main install.ts script.
 *
 * @module install
 */
export * from './providers.js';
export { readSettings, writeSettings, ensureSettingsDir, mergeSettings, addHook, settingsExist, validateSettings, type ProviderSettings, } from './settings.js';
export * from './attribution.js';
export * from './analytics.js';
export * from './hooks.js';
export * from './frontmatter-convert.js';
export * from './uninstall.js';
