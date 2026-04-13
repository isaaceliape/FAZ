/**
 * Path Utilities — Common path construction for runtime configuration directories
 * Reduces duplication across hooks and utilities
 */

import path from 'path';
import os from 'os';

/**
 * Get the configuration directory for a specific runtime
 * @param runtime - Runtime name: 'claude', 'opencode', 'gemini', or 'codex'
 * @param baseDir - Base directory (usually home directory). Defaults to os.homedir()
 */
export function getRuntimeConfigDir(runtime: string, baseDir: string = os.homedir()): string {
  switch (runtime) {
    case 'opencode':
      return path.join(baseDir, '.config', 'opencode');
    case 'gemini':
      return path.join(baseDir, '.gemini');
    case 'codex':
      return path.join(baseDir, '.codex');
    default:
      return path.join(baseDir, '.claude');
  }
}

/**
 * Get the commands directory for a runtime
 */
export function getRuntimeCommandsDir(runtime: string, baseDir: string = os.homedir()): string {
  const configDir = getRuntimeConfigDir(runtime, baseDir);
  switch (runtime) {
    case 'opencode':
      return path.join(configDir, 'command');
    default:
      return path.join(configDir, 'commands');
  }
}

/**
 * Get the hooks directory for a runtime (if applicable)
 */
export function getRuntimeHooksDir(runtime: string, baseDir: string = os.homedir()): string | null {
  switch (runtime) {
    case 'claude':
      return path.join(baseDir, '.claude', 'hooks');
    case 'opencode':
      return null; // OpenCode doesn't use hooks the same way
    case 'gemini':
      return null; // Gemini doesn't use hooks the same way
    case 'codex':
      return null; // Codex uses a different hook system
    default:
      return null;
  }
}

/**
 * Get the settings file for a runtime
 */
export function getRuntimeSettingsFile(runtime: string, baseDir: string = os.homedir()): string | null {
  const configDir = getRuntimeConfigDir(runtime, baseDir);
  switch (runtime) {
    case 'opencode':
      return path.join(configDir, 'opencode.json');
    case 'claude':
      return path.join(configDir, 'settings.json');
    case 'gemini':
      return path.join(configDir, 'settings.json');
    case 'codex':
      return path.join(configDir, 'config.toml');
    default:
      return null;
  }
}

/**
 * Get the shared FASE configuration directory
 */
export function getSharedFaseDir(baseDir: string = os.homedir()): string {
  return path.join(baseDir, '.fase-ai');
}

/**
 * Get the FASE cache directory
 */
export function getFaseCacheDir(baseDir: string = os.homedir()): string {
  return path.join(getSharedFaseDir(baseDir), 'cache');
}

/**
 * Get the FASE todos directory
 */
export function getFaseTodosDir(baseDir: string = os.homedir()): string {
  return path.join(getSharedFaseDir(baseDir), 'todos');
}

/**
 * Get all supported runtime names
 */
export const RUNTIMES = ['claude', 'opencode', 'gemini', 'codex'] as const;
export type Runtime = typeof RUNTIMES[number];

/**
 * Check if a string is a valid runtime name
 */
export function isValidRuntime(name: string): name is Runtime {
  return RUNTIMES.includes(name as Runtime);
}
