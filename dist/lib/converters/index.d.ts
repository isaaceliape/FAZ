/**
 * Provider Converters — Index and factory
 *
 * Exports all provider converters and provides a factory function
 * to get the appropriate converter for a given runtime.
 *
 * @module lib/converters
 */
import type { ProviderConverter, ProviderRuntime } from '../provider-converter.js';
export { ClaudeConverter } from './claude.js';
export { OpenCodeConverter } from './opencode.js';
export { GeminiConverter } from './gemini.js';
export { CodexConverter } from './codex.js';
export { CopilotConverter } from './copilot.js';
export { QwenConverter } from './qwen.js';
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
export declare function getConverter(runtime: ProviderRuntime): ProviderConverter;
/**
 * Check if a runtime is supported
 *
 * @param runtime - String to validate
 * @returns true if runtime has a converter
 */
export declare function isSupportedRuntime(runtime: string): runtime is ProviderRuntime;
/**
 * Get all supported provider runtimes
 *
 * @returns Array of supported runtime names
 */
export declare function getSupportedRuntimes(): ProviderRuntime[];
