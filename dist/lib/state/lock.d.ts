/**
 * State Lock — PID-based file locking for STATE.md atomic operations
 *
 * Uses atomic directory creation for lock acquisition with PID-based
 * stale lock detection to prevent deadlocks from crashed processes.
 */
/**
 * Acquires an exclusive state lock using atomic directory creation.
 * Uses PID-based stale lock detection to prevent deadlocks.
 * @param lockPath - Path to the lock file
 * @param maxAttempts - Maximum number of acquisition attempts
 * @param baseDelayMs - Base delay for exponential backoff
 * @returns true if lock acquired
 * @throws Error if lock cannot be acquired
 */
export declare function acquireStateLock(lockPath: string, maxAttempts?: number, baseDelayMs?: number): boolean;
/**
 * Release the state lock.
 * Removes PID file and lock directory.
 */
export declare function releaseStateLock(lockPath: string): void;
/**
 * Write STATE.md with atomic lock and frontmatter sync.
 * Acquires lock, syncs frontmatter, writes content, releases lock.
 */
export declare function writeStateMd(statePath: string, content: string, cwd: string): void;
