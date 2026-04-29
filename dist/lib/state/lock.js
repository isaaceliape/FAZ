/**
 * State Lock — PID-based file locking for STATE.md atomic operations
 *
 * Uses atomic directory creation for lock acquisition with PID-based
 * stale lock detection to prevent deadlocks from crashed processes.
 */
import fs from 'fs';
import path from 'path';
import { error, checkDiskSpace } from '../core.js';
import { ensureInsidePlanejamento } from '../path.js';
import { syncStateFrontmatter } from './frontmatter-sync.js';
/**
 * Acquires an exclusive state lock using atomic directory creation.
 * Uses PID-based stale lock detection to prevent deadlocks.
 * @param lockPath - Path to the lock file
 * @param maxAttempts - Maximum number of acquisition attempts
 * @param baseDelayMs - Base delay for exponential backoff
 * @returns true if lock acquired
 * @throws Error if lock cannot be acquired
 */
export function acquireStateLock(lockPath, maxAttempts = 10, baseDelayMs = 50) {
    const lockDir = lockPath + '.d';
    const pidFile = path.join(lockDir, 'pid');
    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Atomic lock acquisition using mkdir (atomic on all platforms)
            fs.mkdirSync(lockDir, { recursive: false });
            // Write PID to verify ownership
            fs.writeFileSync(pidFile, String(process.pid), 'utf-8');
            // Register cleanup handler
            process.on('exit', () => {
                try {
                    fs.unlinkSync(pidFile);
                    fs.rmdirSync(lockDir);
                }
                catch (err) {
                    process.stderr.write(`[state:acquireLock] Cleanup error: ${err.message}\n`);
                }
            });
            return true;
        }
        catch (e) {
            const err = e;
            if (err.code !== 'EEXIST') {
                throw new Error(`state.cjs: erro ao adquirir lock: ${err.message}`);
            }
            // Lock exists - check if stale (process no longer running)
            try {
                const existingPid = fs.readFileSync(pidFile, 'utf-8').trim();
                const pidNum = parseInt(existingPid, 10);
                if (!isNaN(pidNum)) {
                    try {
                        // Check if process is still running
                        process.kill(pidNum, 0);
                        // Process is running, wait and retry
                    }
                    catch {
                        // Process is dead, remove stale lock
                        try {
                            fs.unlinkSync(pidFile);
                            fs.rmdirSync(lockDir);
                            continue; // Retry immediately
                        }
                        catch (err) {
                            process.stderr.write(`[state:acquireLock] Failed to remove stale lock: ${err.message}\n`);
                        }
                    }
                }
                else {
                    // Invalid PID file, treat as stale
                    try {
                        fs.unlinkSync(pidFile);
                        fs.rmdirSync(lockDir);
                        continue;
                    }
                    catch (err) {
                        process.stderr.write(`[state:acquireLock] Failed to remove invalid PID lock: ${err.message}\n`);
                    }
                }
            }
            catch (readErr) {
                // Can't read PID file, treat as stale
                process.stderr.write(`[state:acquireLock] Can't read PID file: ${readErr.message}\n`);
                try {
                    // Check if pidFile exists before unlinking (handles missing PID file case)
                    if (fs.existsSync(pidFile)) {
                        fs.unlinkSync(pidFile);
                    }
                    fs.rmdirSync(lockDir);
                    continue; // Retry immediately after cleanup
                }
                catch (cleanupErr) {
                    const cleanupError = cleanupErr;
                    // If rmdir fails because directory is not empty, force cleanup
                    if (cleanupError.code === 'ENOTEMPTY') {
                        try {
                            // Remove all files in lock directory and then remove directory
                            const files = fs.readdirSync(lockDir);
                            for (const file of files) {
                                fs.unlinkSync(path.join(lockDir, file));
                            }
                            fs.rmdirSync(lockDir);
                            continue;
                        }
                        catch (forceCleanupErr) {
                            process.stderr.write(`[state:acquireLock] Failed to force cleanup stale lock: ${forceCleanupErr.message}\n`);
                        }
                    }
                    else {
                        process.stderr.write(`[state:acquireLock] Failed to cleanup stale lock: ${cleanupErr.message}\n`);
                    }
                }
            }
            // Exponential backoff
            const delay = baseDelayMs * Math.pow(2, i);
            const deadline = Date.now() + delay;
            while (Date.now() < deadline) {
                /* spin */
            }
        }
    }
    throw new Error(`state.cjs: não foi possível adquirir lock após ${maxAttempts} tentativas`);
}
/**
 * Release the state lock.
 * Removes PID file and lock directory.
 */
export function releaseStateLock(lockPath) {
    const lockDir = lockPath + '.d';
    try {
        const pidFile = path.join(lockDir, 'pid');
        if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
        }
        if (fs.existsSync(lockDir)) {
            fs.rmdirSync(lockDir);
        }
    }
    catch (err) {
        process.stderr.write(`[state:releaseLock] Failed to release lock: ${err.message}\n`);
    }
}
/**
 * Write STATE.md with atomic lock and frontmatter sync.
 * Acquires lock, syncs frontmatter, writes content, releases lock.
 */
export function writeStateMd(statePath, content, cwd) {
    ensureInsidePlanejamento(cwd, statePath, 'STATE.md write');
    // Check disk space before acquiring lock
    if (!checkDiskSpace(statePath, 1024 * 1024)) {
        // 1MB minimum
        error('Espaço em disco insuficiente para salvar STATE.md');
    }
    const lockPath = path.join(path.dirname(statePath), '.state-lock');
    acquireStateLock(lockPath);
    try {
        const synced = syncStateFrontmatter(content, cwd);
        fs.writeFileSync(statePath, synced, 'utf-8');
    }
    finally {
        releaseStateLock(lockPath);
    }
}
//# sourceMappingURL=lock.js.map