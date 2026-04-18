/**
 * Analytics — Analytics configuration and preference management
 *
 * Handles opt-in/opt-out analytics preferences stored in .fase-ai/config.json
 *
 * @module install/analytics
 */
/**
 * Analytics configuration interface
 */
export interface AnalyticsConfig {
    analytics_enabled?: boolean;
    [key: string]: unknown;
}
/**
 * Get the local .fase-ai config path in the current working directory
 *
 * @returns Absolute path to .fase-ai/config.json
 */
export declare function getLocalAnalyticsConfigPath(): string;
/**
 * Read analytics preference from local config if it exists
 *
 * @returns null if not set, true/false if set
 *
 * @example
 * ```typescript
 * const enabled = readAnalyticsPreference();
 * if (enabled === null) { /* Not set, ask user *\/ }
 * ```
 */
export declare function readAnalyticsPreference(): boolean | null;
/**
 * Save analytics preference to local config
 *
 * @param enabled - true to enable analytics, false to disable
 *
 * @example
 * ```typescript
 * saveAnalyticsPreference(true); // User opted in
 * ```
 */
export declare function saveAnalyticsPreference(enabled: boolean): void;
/**
 * Check if analytics is enabled
 *
 * @returns true if enabled, false if disabled or not set
 */
export declare function isAnalyticsEnabled(): boolean;
/**
 * Get analytics config for display
 *
 * @returns { enabled: boolean, configured: boolean }
 */
export declare function getAnalyticsStatus(): {
    enabled: boolean;
    configured: boolean;
};
