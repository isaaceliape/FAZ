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
import path from 'path';
import os from 'os';
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
export function expandTilde(filePath) {
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
export function getDirName(runtime) {
    if (runtime === 'opencode')
        return '.opencode';
    if (runtime === 'gemini')
        return '.gemini';
    if (runtime === 'codex')
        return '.codex';
    if (runtime === 'copilot')
        return '.copilot';
    if (runtime === 'qwen')
        return '.qwen';
    return '.claude';
}
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
export function getConfigDirFromHome(runtime, isGlobal) {
    if (!isGlobal) {
        // Local installs use the same dir name pattern
        return `'${getDirName(runtime)}'`;
    }
    // Global installs - OpenCode uses XDG path structure
    if (runtime === 'opencode') {
        // OpenCode: ~/.config/opencode -> '.config', 'opencode'
        // Return as comma-separated for path.join() replacement
        return "'.config', 'opencode'";
    }
    if (runtime === 'gemini')
        return "'.gemini'";
    if (runtime === 'codex')
        return "'.codex'";
    if (runtime === 'copilot')
        return "'.copilot'";
    if (runtime === 'qwen')
        return "'.qwen'";
    return "'.claude'";
}
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
export function getOpencodeGlobalDir() {
    // 1. Explicit OPENCODE_CONFIG_DIR env var
    if (process.env.OPENCODE_CONFIG_DIR) {
        return expandTilde(process.env.OPENCODE_CONFIG_DIR);
    }
    // 2. OPENCODE_CONFIG env var (use its directory)
    if (process.env.OPENCODE_CONFIG) {
        return path.dirname(expandTilde(process.env.OPENCODE_CONFIG));
    }
    // 3. XDG_CONFIG_HOME/opencode
    if (process.env.XDG_CONFIG_HOME) {
        return path.join(expandTilde(process.env.XDG_CONFIG_HOME), 'opencode');
    }
    // 4. Default: ~/.config/opencode (XDG default)
    return path.join(os.homedir(), '.config', 'opencode');
}
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
export function getGlobalDir(runtime, explicitDir = null) {
    if (runtime === 'opencode') {
        // For OpenCode, --config-dir overrides env vars
        if (explicitDir) {
            return expandTilde(explicitDir);
        }
        return getOpencodeGlobalDir();
    }
    if (runtime === 'gemini') {
        // Gemini: --config-dir > GEMINI_CONFIG_DIR > ~/.gemini
        if (explicitDir) {
            return expandTilde(explicitDir);
        }
        if (process.env.GEMINI_CONFIG_DIR) {
            return expandTilde(process.env.GEMINI_CONFIG_DIR);
        }
        return path.join(os.homedir(), '.gemini');
    }
    if (runtime === 'codex') {
        // Codex: --config-dir > CODEX_HOME > ~/.codex
        if (explicitDir) {
            return expandTilde(explicitDir);
        }
        if (process.env.CODEX_HOME) {
            return expandTilde(process.env.CODEX_HOME);
        }
        return path.join(os.homedir(), '.codex');
    }
    if (runtime === 'copilot') {
        // GitHub Copilot: --config-dir > COPILOT_CONFIG_DIR > ~/.github-copilot
        if (explicitDir) {
            return expandTilde(explicitDir);
        }
        if (process.env.COPILOT_CONFIG_DIR) {
            return expandTilde(process.env.COPILOT_CONFIG_DIR);
        }
        return path.join(os.homedir(), '.copilot');
    }
    if (runtime === 'qwen') {
        // Qwen Code: --config-dir > QWEN_CONFIG_DIR > ~/.qwen
        if (explicitDir) {
            return expandTilde(explicitDir);
        }
        if (process.env.QWEN_CONFIG_DIR) {
            return expandTilde(process.env.QWEN_CONFIG_DIR);
        }
        return path.join(os.homedir(), '.qwen');
    }
    // Claude Code: --config-dir > CLAUDE_CONFIG_DIR > ~/.claude
    if (explicitDir) {
        return expandTilde(explicitDir);
    }
    if (process.env.CLAUDE_CONFIG_DIR) {
        return expandTilde(process.env.CLAUDE_CONFIG_DIR);
    }
    return path.join(os.homedir(), '.claude');
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
export function isValidProvider(runtime) {
    return ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'].includes(runtime);
}
/**
 * Get all supported providers
 *
 * @returns Array of valid provider runtime names
 */
export function getSupportedProviders() {
    return ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
}
//# sourceMappingURL=providers.js.map