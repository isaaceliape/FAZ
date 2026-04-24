/**
 * Providers — Provider detection and configuration directory management
 *
 * Handles config directory paths for all supported AI providers (project-local only):
 * - Claude Code (./.claude)
 * - OpenCode (./.opencode)
 * - Gemini (./.gemini)
 * - Codex (./.codex)
 * - GitHub Copilot (./.copilot)
 * - Qwen (./.qwen)
 *
 * @module install/providers
 */

import path from 'path';
import os from 'os';

/**
 * Supported provider runtimes
 */
export type ProviderRuntime = 'claude' | 'opencode' | 'gemini' | 'codex' | 'copilot' | 'qwen';

/**
 * Expand ~ to home directory (shell doesn't expand in env vars passed to node)
 *
 * @param filePath - Path that may start with ~/
 * @returns Expanded path with full home directory
 *
 * @example
 * ```typescript
 * expandTilde('~/.claude') // => '/home/user/.claude'
 * ```
 */
export function expandTilde(filePath: string): string {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Get directory name for a runtime (used for local/project installs)
 *
 * @param runtime - Provider runtime name
 * @returns Directory name for the runtime
 *
 * @example
 * ```typescript
 * getDirName('claude') // => '.claude'
 * getDirName('opencode') // => '.opencode'
 * ```
 */
export function getDirName(runtime: ProviderRuntime): string {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.gemini';
  if (runtime === 'codex') return '.codex';
  if (runtime === 'copilot') return '.copilot';
  if (runtime === 'qwen') return '.qwen';
  return '.claude';
}

/**
 * Get the config directory path relative to home directory for a runtime
 * Used for templating hooks that use path.join(homeDir, '<configDir>', ...)
 * Local project-based installs only.
 *
 * @param runtime - Provider runtime name
 * @returns String representation for path.join() replacement
 *
 * @example
 * ```typescript
 * getConfigDirFromHome('claude') // => "'.claude'"
 * getConfigDirFromHome('opencode') // => "'.opencode'"
 * ```
 */
export function getConfigDirFromHome(runtime: ProviderRuntime): string {
  // Local installs use the same dir name pattern
  return `'${getDirName(runtime)}'`;
}

/**
 * Check if a runtime is valid/supported
 *
 * @param runtime - String to validate
 * @returns true if runtime is a valid provider
 *
 * @example
 * ```typescript
 * isValidProvider('claude') // => true
 * isValidProvider('gpt') // => false
 * ```
 */
export function isValidProvider(runtime: string): runtime is ProviderRuntime {
  return ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'].includes(runtime);
}

/**
 * Get all supported providers
 *
 * @returns Array of valid provider runtime names
 */
export function getSupportedProviders(): ProviderRuntime[] {
  return ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
}
