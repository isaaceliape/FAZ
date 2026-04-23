/**
 * Hooks — Hook file generation and management
 *
 * Handles creation, updating, and removal of hook files
 * for Claude Code, OpenCode, Gemini, and Codex.
 *
 * @module install/hooks
 */

import fs from 'fs';
import path from 'path';

/**
 * Build a hook command path using forward slashes for cross-platform compatibility
 *
 * @param configDir - Configuration directory path
 * @param hookName - Name of the hook file (without extension)
 * @returns Command string to execute the hook
 *
 * @example
 * ```typescript
 * buildHookCommand('/home/user/.claude', 'fase-statusline')
 * // => 'node "/home/user/.claude/hooks/fase-statusline"'
 * ```
 */
export function buildHookCommand(configDir: string, hookName: string): string {
  // Use forward slashes for Node.js compatibility on all platforms
  const hooksPath = configDir.replace(/\\/g, '/') + '/hooks/' + hookName;
  return `node "${hooksPath}"`;
}

/**
 * Ensure hooks directory exists
 *
 * @param configDir - Configuration directory (e.g., ~/.claude)
 * @returns Path to hooks directory
 */
export function ensureHooksDir(configDir: string): string {
  const hooksDir = path.join(configDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  return hooksDir;
}

/**
 * Check if hooks directory exists
 *
 * @param configDir - Configuration directory
 * @returns true if hooks directory exists
 */
export function hooksDirExists(configDir: string): boolean {
  return fs.existsSync(path.join(configDir, 'hooks'));
}

/**
 * Write a hook file
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook (without extension)
 * @param content - Hook file content
 *
 * @example
 * ```typescript
 * writeHook('~/.claude', 'fase-statusline', '#!/usr/bin/env node\n...');
 * ```
 */
export function writeHook(configDir: string, hookName: string, content: string): void {
  const hooksDir = ensureHooksDir(configDir);
  const hookPath = path.join(hooksDir, hookName);
  fs.writeFileSync(hookPath, content, 'utf-8');

  // Make executable on Unix-like systems
  try {
    fs.chmodSync(hookPath, 0o755);
  } catch {
    // Ignore on Windows
  }
}

/**
 * Read a hook file
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns Hook content or null if not found
 */
export function readHook(configDir: string, hookName: string): string | null {
  const hookPath = path.join(configDir, 'hooks', hookName);
  if (!fs.existsSync(hookPath)) {
    return null;
  }
  return fs.readFileSync(hookPath, 'utf-8');
}

/**
 * Remove a hook file
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook to remove
 * @returns true if removed, false if not found
 */
export function removeHook(configDir: string, hookName: string): boolean {
  const hookPath = path.join(configDir, 'hooks', hookName);
  if (fs.existsSync(hookPath)) {
    fs.unlinkSync(hookPath);
    return true;
  }
  return false;
}

/**
 * List all hook files in a directory
 *
 * @param configDir - Configuration directory
 * @returns Array of hook file names
 */
export function listHooks(configDir: string): string[] {
  const hooksDir = path.join(configDir, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    return [];
  }

  try {
    return fs.readdirSync(hooksDir).filter((f) => f.endsWith('.js') || f.endsWith('.cjs'));
  } catch {
    return [];
  }
}

/**
 * Count FASE hook files
 *
 * @param configDir - Configuration directory
 * @returns Number of FASE hooks (files starting with 'fase-')
 */
export function countFaseHooks(configDir: string): number {
  const hooks = listHooks(configDir);
  return hooks.filter((h) => h.startsWith('fase-')).length;
}

/**
 * Check if a specific hook exists
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns true if hook exists
 */
export function hookExists(configDir: string, hookName: string): boolean {
  const hookPath = path.join(configDir, 'hooks', hookName);
  return fs.existsSync(hookPath);
}

/**
 * Get hook file path
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns Absolute path to hook file
 */
export function getHookPath(configDir: string, hookName: string): string {
  return path.join(configDir, 'hooks', hookName);
}
