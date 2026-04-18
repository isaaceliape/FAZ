/**
 * Analytics — Analytics configuration and preference management
 * 
 * Handles opt-in/opt-out analytics preferences stored in .fase-ai/config.json
 * 
 * @module install/analytics
 */

import fs from 'fs';
import path from 'path';

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
export function getLocalAnalyticsConfigPath(): string {
  return path.join(process.cwd(), '.fase-ai', 'config.json');
}

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
export function readAnalyticsPreference(): boolean | null {
  const configPath = getLocalAnalyticsConfigPath();
  if (fs.existsSync(configPath)) {
    try {
      const config: AnalyticsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (typeof config.analytics_enabled === 'boolean') {
        return config.analytics_enabled;
      }
    } catch {
      // Ignore parsing errors
    }
  }
  return null;
}

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
export function saveAnalyticsPreference(enabled: boolean): void {
  const configPath = getLocalAnalyticsConfigPath();
  const configDir = path.dirname(configPath);
  
  // Create .fase-ai directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Read existing config or create new one
  let config: AnalyticsConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      config = {};
    }
  }
  
  // Update analytics preference
  config.analytics_enabled = enabled;
  
  // Write back to file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Check if analytics is enabled
 * 
 * @returns true if enabled, false if disabled or not set
 */
export function isAnalyticsEnabled(): boolean {
  const preference = readAnalyticsPreference();
  return preference === true;
}

/**
 * Get analytics config for display
 * 
 * @returns { enabled: boolean, configured: boolean }
 */
export function getAnalyticsStatus(): { enabled: boolean; configured: boolean } {
  const preference = readAnalyticsPreference();
  return {
    enabled: preference === true,
    configured: preference !== null,
  };
}
