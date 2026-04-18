/**
 * Hooks — Hook file generation and management
 *
 * Handles creation, updating, and removal of hook files
 * for Claude Code, OpenCode, Gemini, and Codex.
 *
 * @module install/hooks
 */
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
export declare function buildHookCommand(configDir: string, hookName: string): string;
/**
 * Ensure hooks directory exists
 *
 * @param configDir - Configuration directory (e.g., ~/.claude)
 * @returns Path to hooks directory
 */
export declare function ensureHooksDir(configDir: string): string;
/**
 * Check if hooks directory exists
 *
 * @param configDir - Configuration directory
 * @returns true if hooks directory exists
 */
export declare function hooksDirExists(configDir: string): boolean;
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
export declare function writeHook(configDir: string, hookName: string, content: string): void;
/**
 * Read a hook file
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns Hook content or null if not found
 */
export declare function readHook(configDir: string, hookName: string): string | null;
/**
 * Remove a hook file
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook to remove
 * @returns true if removed, false if not found
 */
export declare function removeHook(configDir: string, hookName: string): boolean;
/**
 * List all hook files in a directory
 *
 * @param configDir - Configuration directory
 * @returns Array of hook file names
 */
export declare function listHooks(configDir: string): string[];
/**
 * Count FASE hook files
 *
 * @param configDir - Configuration directory
 * @returns Number of FASE hooks (files starting with 'fase-')
 */
export declare function countFaseHooks(configDir: string): number;
/**
 * Check if a specific hook exists
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns true if hook exists
 */
export declare function hookExists(configDir: string, hookName: string): boolean;
/**
 * Get hook file path
 *
 * @param configDir - Configuration directory
 * @param hookName - Name of the hook
 * @returns Absolute path to hook file
 */
export declare function getHookPath(configDir: string, hookName: string): string;
