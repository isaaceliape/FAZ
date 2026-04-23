/**
 * FASE Tests - State Locking Mechanism
 * 
 * Tests for acquireStateLock and releaseStateLock functionality
 * in src/lib/state.ts (lines 227-330).
 * 
 * Since lock functions are internal (not exported), we test via CLI
 * commands that trigger state operations (writeStateMd uses locks).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('state.ts locking mechanism', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Stale Lock Detection Tests
  // ─────────────────────────────────────────────────────────────────────────────

  describe('stale lock detection', () => {
    test('lock acquisition succeeds when no lock exists (fresh start)', () => {
      // Create a valid STATE.md in the expected path (.fase-ai/)
      // The CLI expects .fase-ai/ directory
      fs.mkdirSync(path.join(tmpDir, '.fase-ai'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.fase-ai', 'STATE.md'),
        '# Project State\n\n**Status:** Active\n'
      );

      // No lock directory exists initially
      const lockDir = path.join(tmpDir, '.fase-ai', '.state-lock.d');
      assert.strictEqual(fs.existsSync(lockDir), false, 'No lock should exist initially');

      // State operation should succeed without any stale lock cleanup
      const result = runGsdTools(['state', 'update', 'Status', 'Testing'], tmpDir);
      assert.ok(result.success, 'State operation should succeed on fresh start');

      // Verify the update happened
      const state = fs.readFileSync(path.join(tmpDir, '.fase-ai', 'STATE.md'), 'utf-8');
      assert.ok(state.includes('**Status:** Testing'), 'Status should be updated');
    });

    test('removes stale lock when PID is dead', () => {
      // Create a STATE.md
      fs.mkdirSync(path.join(tmpDir, '.fase-ai'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.fase-ai', 'STATE.md'),
        '# Project State\n\n**Status:** Active\n'
      );

      const lockDir = path.join(tmpDir, '.fase-ai', '.state-lock.d');
      const pidFile = path.join(lockDir, 'pid');

      // Create stale lock with non-existent PID (999999999 won't exist)
      fs.mkdirSync(lockDir, { recursive: false });
      fs.writeFileSync(pidFile, '999999999');

      // Verify stale lock exists
      assert.strictEqual(fs.existsSync(lockDir), true, 'Stale lock directory should exist');
      assert.strictEqual(fs.existsSync(pidFile), true, 'Stale PID file should exist');

      // State operation should detect dead PID, clean up stale lock, and succeed
      const result = runGsdTools(['state', 'update', 'Status', 'Testing'], tmpDir);

      // The operation should succeed after stale lock cleanup
      // Note: acquireStateLock checks if PID is alive via process.kill(pid, 0)
      // A dead PID (999999999) will throw, causing stale lock removal
      assert.ok(result.success, 'State operation should succeed after stale lock cleanup');

      // Verify the update happened
      const state = fs.readFileSync(path.join(tmpDir, '.fase-ai', 'STATE.md'), 'utf-8');
      assert.ok(state.includes('**Status:** Testing'), 'Status should be updated');
    });

    test('handles invalid PID file (non-numeric)', () => {
      // Create a STATE.md
      fs.mkdirSync(path.join(tmpDir, '.fase-ai'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.fase-ai', 'STATE.md'),
        '# Project State\n\n**Status:** Active\n'
      );

      const lockDir = path.join(tmpDir, '.fase-ai', '.state-lock.d');
      const pidFile = path.join(lockDir, 'pid');

      // Create lock with invalid (non-numeric) PID
      fs.mkdirSync(lockDir, { recursive: false });
      fs.writeFileSync(pidFile, 'not-a-number');

      // State operation should treat invalid PID as stale and succeed
      const result = runGsdTools(['state', 'update', 'Status', 'Testing'], tmpDir);
      assert.ok(result.success, 'State operation should handle invalid PID');

      // Verify the update happened
      const state = fs.readFileSync(path.join(tmpDir, '.fase-ai', 'STATE.md'), 'utf-8');
      assert.ok(state.includes('**Status:** Testing'), 'Status should be updated');
    });

    test('handles lock directory without PID file', () => {
      // Create a STATE.md
      fs.mkdirSync(path.join(tmpDir, '.fase-ai'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.fase-ai', 'STATE.md'),
        '# Project State\n\n**Status:** Active\n'
      );

      const lockDir = path.join(tmpDir, '.fase-ai', '.state-lock.d');

      // Create lock directory without PID file
      fs.mkdirSync(lockDir, { recursive: false });

      // State operation should handle missing PID file as stale
      const result = runGsdTools(['state', 'update', 'Status', 'Testing'], tmpDir);

      // The implementation tries to read PID file; on error, treats as stale
      assert.ok(result.success, 'State operation should handle missing PID file');

      // Verify the update happened
      const state = fs.readFileSync(path.join(tmpDir, '.fase-ai', 'STATE.md'), 'utf-8');
      assert.ok(state.includes('**Status:** Testing'), 'Status should be updated');
    });
  });
});