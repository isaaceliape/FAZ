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
export * from './frontmatter-convert.js';
export * from './uninstall.js';
/**
 * Phase 3 Refactoring Status:
 *
 * Foundation modules created:
 * ✅ constants.ts - ANSI colors and Codex config
 * ✅ helpers.ts - Utility functions
 *
 * Modules awaiting integration with main install.ts:
 * • providers.ts (expandTilde, getDirName, etc.)
 * • settings.ts (readSettings, writeSettings, etc.)
 * • hooks.ts (hook management)
 * • attribution.ts (attribution handling)
 * • frontmatter-convert.ts (format conversion)
 * • uninstall.ts (uninstall logic)
 *
 * See: specs/PHASE_3_REFACTORING_GUIDE.md for detailed roadmap
 */
