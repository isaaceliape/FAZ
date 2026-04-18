/**
 * FASE Installer — Module Entry Point
 * 
 * Re-exports all installation modules for use in the main install.ts script.
 * 
 * @module install
 */

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

// Analytics preferences
export * from './analytics.js';

// Hook file management
export * from './hooks.js';

// Frontmatter conversion between providers
export * from './frontmatter-convert.js';

// Uninstallation logic
export * from './uninstall.js';
