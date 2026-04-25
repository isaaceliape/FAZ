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

// Uninstallation logic
export * from './uninstall.js';

/**
 * Provider conversion has been refactored to src/lib/converters/
 * See src/lib/provider-converter.ts for the interface
 * See src/lib/converters/*.ts for provider-specific converters
 */
