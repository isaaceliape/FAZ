/**
 * Provider Converters — Index and factory
 *
 * Exports all provider converters and provides a factory function
 * to get the appropriate converter for a given runtime.
 *
 * @module lib/converters
 */

import type { ProviderConverter, ProviderRuntime } from '../provider-converter.js';
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
const converters: Record<ProviderRuntime, ProviderConverter> = {
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
export function getConverter(runtime: ProviderRuntime): ProviderConverter {
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
export function isSupportedRuntime(runtime: string): runtime is ProviderRuntime {
  return runtime in converters;
}

/**
 * Get all supported provider runtimes
 *
 * @returns Array of supported runtime names
 */
export function getSupportedRuntimes(): ProviderRuntime[] {
  return Object.keys(converters) as ProviderRuntime[];
}
