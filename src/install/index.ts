/**
 * FASE Installer — Module Entry Point
 *
 * Re-exports all installation modules for use in the main install.ts script.
 *
 * @module install
 */

// Terminal output colors
export * from './constants.js';

// Utility helpers (JSON parsing, path expansion, etc.)
export * from './helpers.js';

// Provider detection and config directories
export * from './providers.js';

// Settings management (excluding removeHook which is in hooks.ts)
export {
  readSettings,
  writeSettings,
  ensureSettingsDir,
  mergeSettings,
  addHook,
  settingsExist,
  validateSettings,
  type ProviderSettings,
} from './settings.js';

// Commit attribution handling
export * from './attribution.js';

// Hook file management
export * from './hooks.js';

// Frontmatter conversion between providers
export * from './frontmatter-convert.js';

// Uninstallation logic
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
