/**
 * Providers — Provider detection and configuration directory management
 *
 * Handles config directory paths for all supported AI providers:
 * - Claude Code (~/.claude)
 * - OpenCode (~/.config/opencode)
 * - Gemini (~/.gemini)
 * - Codex (~/.codex)
 * - GitHub Copilot (~/.github-copilot)
 *
 * @module install/providers
 */
/**
 * Supported provider runtimes
 */
export type ProviderRuntime = 'claude' | 'opencode' | 'gemini' | 'codex' | 'github-copilot' | 'qwen';
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
export declare function expandTilde(filePath: string): string;
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
export declare function getDirName(runtime: ProviderRuntime): string;
/**
 * Get the config directory path relative to home directory for a runtime
 * Used for templating hooks that use path.join(homeDir, '<configDir>', ...)
 *
 * @param runtime - Provider runtime name
 * @param isGlobal - Whether this is a global install
 * @returns String representation for path.join() replacement
 *
 * @example
 * ```typescript
 * getConfigDirFromHome('claude', false) // => "'.claude'"
 * getConfigDirFromHome('opencode', true) // => "'.config', 'opencode'"
 * ```
 */
export declare function getConfigDirFromHome(runtime: ProviderRuntime, isGlobal: boolean): string;
/**
 * Get the global config directory for OpenCode
 * OpenCode follows XDG Base Directory spec and uses ~/.config/opencode/
 *
 * Priority:
 * 1. OPENCODE_CONFIG_DIR env var
 * 2. dirname(OPENCODE_CONFIG) env var
 * 3. XDG_CONFIG_HOME/opencode
 * 4. ~/.config/opencode (default)
 *
 * @returns Absolute path to OpenCode config directory
 */
export declare function getOpencodeGlobalDir(): string;
/**
 * Get the global config directory for a runtime
 *
 * @param runtime - Provider runtime name
 * @param explicitDir - Explicit directory from --config-dir flag (optional)
 * @returns Absolute path to config directory
 *
 * @example
 * ```typescript
 * getGlobalDir('claude', null) // => '/home/user/.claude'
 * getGlobalDir('opencode', '/custom/path') // => '/custom/path'
 * ```
 */
export declare function getGlobalDir(runtime: ProviderRuntime, explicitDir?: string | null): string;
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
export declare function isValidProvider(runtime: string): runtime is ProviderRuntime;
/**
 * Get all supported providers
 *
 * @returns Array of valid provider runtime names
 */
export declare function getSupportedProviders(): ProviderRuntime[];
