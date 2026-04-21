import os from 'os';

/**
 * Safely parses JSON with proper error handling.
 * @param jsonStr - JSON string to parse
 * @param context - Description of what's being parsed for error messages
 * @param options - Options for error handling (exitOnError: whether to exit on failure)
 * @returns Parsed JSON object, or null if parsing fails and exitOnError is false
 */
export function safeJsonParse(jsonStr: string, context = 'JSON', options = { exitOnError: true }): any {
  try {
    return JSON.parse(jsonStr);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Invalid ${context}: ${message}`);
    if (options.exitOnError) {
      process.exit(1);
    }
    return null;
  }
}

/**
 * Convert a pathPrefix (which uses absolute paths for global installs) to a
 * $HOME-relative form for replacing $HOME/.claude/ references in bash code blocks.
 * Preserves $HOME as a shell variable so paths remain portable across machines.
 */
export function toHomePrefix(pathPrefix: string): string {
  const home = os.homedir().replace(/\\/g, '/');
  const normalized = pathPrefix.replace(/\\/g, '/');
  if (normalized.startsWith(home)) {
    return '$HOME' + normalized.slice(home.length);
  }
  // For relative paths or paths not under $HOME, return as-is
  return normalized;
}
