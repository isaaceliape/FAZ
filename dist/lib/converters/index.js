/**
 * Provider Converters — Index and factory
 *
 * Exports all provider converters and provides a factory function
 * to get the appropriate converter for a given runtime.
 *
 * @module lib/converters
 */
import { ClaudeConverter } from './claude.js';
import { OpenCodeConverter } from './opencode.js';
import { GeminiConverter } from './gemini.js';
import { CodexConverter } from './codex.js';
import { CopilotConverter } from './copilot.js';
import { QwenConverter } from './qwen.js';
// Export all converters
export { ClaudeConverter } from './claude.js';
export { OpenCodeConverter } from './opencode.js';
export { GeminiConverter } from './gemini.js';
export { CodexConverter } from './codex.js';
export { CopilotConverter } from './copilot.js';
export { QwenConverter } from './qwen.js';
/**
 * All available converters indexed by provider name
 */
const converters = {
    claude: ClaudeConverter,
    opencode: OpenCodeConverter,
    gemini: GeminiConverter,
    codex: CodexConverter,
    copilot: CopilotConverter,
    qwen: QwenConverter,
};
/**
 * Get the converter for a given provider runtime
 *
 * @param runtime - Provider runtime name
 * @returns ProviderConverter for the runtime
 * @throws Error if runtime is not supported
 *
 * @example
 * ```typescript
 * const converter = getConverter('opencode');
 * const converted = converter.convertAgent(content, context);
 * ```
 */
export function getConverter(runtime) {
    const converter = converters[runtime];
    if (!converter) {
        throw new Error(`Unsupported provider runtime: ${runtime}`);
    }
    return converter;
}
/**
 * Check if a runtime is supported
 *
 * @param runtime - String to validate
 * @returns true if runtime has a converter
 */
export function isSupportedRuntime(runtime) {
    return runtime in converters;
}
/**
 * Get all supported provider runtimes
 *
 * @returns Array of supported runtime names
 */
export function getSupportedRuntimes() {
    return Object.keys(converters);
}
//# sourceMappingURL=index.js.map