/**
 * Analytics — DISABLED
 *
 * Analytics has been disabled to keep FASE project-local only.
 * No tracking occurs.
 */

export interface AnalyticsEvent {
  ts: number;
  cmd: string;
  runtime: string;
}

/**
 * No-op: Track a command execution (disabled)
 */
export function trackEvent(cmd: string, runtime: string): void {
  // Analytics disabled - no tracking
}

/**
 * No-op: Check if we should upload analytics (disabled)
 */
export function maybeFlush(): void {
  // Analytics disabled - no flushing
}

/**
 * No-op: Write analytics config (disabled)
 */
export function saveAnalyticsConfig(enabled: boolean, installId: string): void {
  // Analytics disabled - no config saved
}
