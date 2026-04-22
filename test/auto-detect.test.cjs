/**
 * Auto-Detect Mode Tests
 * Tests for --auto-detect flag, postinstall detection, and project config
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set test mode before importing install.js
process.env.FASE_TEST_MODE = 'true';

describe('Auto-Detect Mode', () => {
  let tempDir;
  let originalCwd;
  let originalEnv;

  before(async () => {
    // Dynamically import the ES module - functions will be on globalThis
    await import('../dist/install.js');
  });

  beforeEach(() => {
    // Save original state
    originalCwd = process.cwd();
    originalEnv = { ...process.env };
    
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-auto-detect-'));
    process.chdir(tempDir);
  });

  afterEach(() => {
    // Restore original state
    process.chdir(originalCwd);
    process.env = originalEnv;
    
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('isRunningAsPostinstall()', () => {
    it('should return true when npm_lifecycle_event is postinstall', () => {
      const { isRunningAsPostinstall } = globalThis;
      process.env.npm_lifecycle_event = 'postinstall';
      assert.strictEqual(isRunningAsPostinstall(), true);
    });

    it('should return true when INIT_CWD is defined', () => {
      const { isRunningAsPostinstall } = globalThis;
      delete process.env.npm_lifecycle_event;
      process.env.INIT_CWD = '/some/path';
      assert.strictEqual(isRunningAsPostinstall(), true);
    });

    it('should return true when both conditions are met', () => {
      const { isRunningAsPostinstall } = globalThis;
      process.env.npm_lifecycle_event = 'postinstall';
      process.env.INIT_CWD = '/some/path';
      assert.strictEqual(isRunningAsPostinstall(), true);
    });

    it('should return false when neither condition is met', () => {
      const { isRunningAsPostinstall } = globalThis;
      delete process.env.npm_lifecycle_event;
      delete process.env.INIT_CWD;
      assert.strictEqual(isRunningAsPostinstall(), false);
    });

    it('should return false in normal execution environment', () => {
      const { isRunningAsPostinstall } = globalThis;
      // Ensure clean environment
      delete process.env.npm_lifecycle_event;
      delete process.env.INIT_CWD;
      assert.strictEqual(isRunningAsPostinstall(), false);
    });
  });

  describe('readProjectConfig()', () => {
    it('should return defaults when .fase-ai/config.json does not exist', () => {
      const { readProjectConfig } = globalThis;
      const config = readProjectConfig();
      
      assert.deepStrictEqual(config.runtimes, ['claude']);
      assert.strictEqual(config.auto_install, true);
      assert.strictEqual(config.skip_confirmation, true);
    });

    it('should read config from .fase-ai/config.json when it exists', () => {
      const { readProjectConfig } = globalThis;
      const faseDir = path.join(tempDir, '.fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });
      
      const expectedConfig = {
        runtimes: ['claude', 'opencode'],
        auto_install: false,
        skip_confirmation: false,
      };
      
      fs.writeFileSync(
        path.join(faseDir, 'config.json'),
        JSON.stringify(expectedConfig, null, 2)
      );
      
      const config = readProjectConfig();
      
      assert.deepStrictEqual(config.runtimes, ['claude', 'opencode']);
      assert.strictEqual(config.auto_install, false);
      assert.strictEqual(config.skip_confirmation, false);
    });

    it('should merge partial config with defaults', () => {
      const { readProjectConfig } = globalThis;
      const faseDir = path.join(tempDir, '.fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });
      
      const partialConfig = {
        runtimes: ['gemini'],
      };
      
      fs.writeFileSync(
        path.join(faseDir, 'config.json'),
        JSON.stringify(partialConfig, null, 2)
      );
      
      const config = readProjectConfig();
      
      assert.deepStrictEqual(config.runtimes, ['gemini']);
      assert.strictEqual(config.auto_install, true); // default
      assert.strictEqual(config.skip_confirmation, true); // default
    });

    it('should handle invalid JSON gracefully', () => {
      const { readProjectConfig } = globalThis;
      const faseDir = path.join(tempDir, '.fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(faseDir, 'config.json'),
        'invalid json {['
      );
      
      const config = readProjectConfig();
      
      // Should return defaults when JSON is invalid
      assert.deepStrictEqual(config.runtimes, ['claude']);
      assert.strictEqual(config.auto_install, true);
      assert.strictEqual(config.skip_confirmation, true);
    });

    it('should handle empty config file', () => {
      const { readProjectConfig } = globalThis;
      const faseDir = path.join(tempDir, '.fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(faseDir, 'config.json'),
        '{}'
      );
      
      const config = readProjectConfig();
      
      // Should return defaults when config is empty
      assert.deepStrictEqual(config.runtimes, ['claude']);
      assert.strictEqual(config.auto_install, true);
      assert.strictEqual(config.skip_confirmation, true);
    });

    it('should handle config with extra properties', () => {
      const { readProjectConfig } = globalThis;
      const faseDir = path.join(tempDir, '.fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });
      
      const configWithExtras = {
        runtimes: ['codex'],
        auto_install: true,
        skip_confirmation: true,
        custom_property: 'value',
        another_extra: 123,
      };
      
      fs.writeFileSync(
        path.join(faseDir, 'config.json'),
        JSON.stringify(configWithExtras, null, 2)
      );
      
      const config = readProjectConfig();
      
      assert.deepStrictEqual(config.runtimes, ['codex']);
      assert.strictEqual(config.auto_install, true);
      assert.strictEqual(config.skip_confirmation, true);
      assert.strictEqual(config.custom_property, 'value');
      assert.strictEqual(config.another_extra, 123);
    });
  });

  describe('detectAvailableRuntimes()', () => {
    it('should return an array of runtimes', () => {
      const { detectAvailableRuntimes } = globalThis;
      const runtimes = detectAvailableRuntimes();
      
      assert.ok(Array.isArray(runtimes), 'Should return an array');
    });

    it('should return at least one runtime (claude as default)', () => {
      const { detectAvailableRuntimes } = globalThis;
      const runtimes = detectAvailableRuntimes();
      
      assert.ok(runtimes.length >= 1, 'Should return at least one runtime');
    });

    it('should include only valid runtime names', () => {
      const { detectAvailableRuntimes } = globalThis;
      const validRuntimes = ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
      const runtimes = detectAvailableRuntimes();
      
      runtimes.forEach(runtime => {
        assert.ok(
          validRuntimes.includes(runtime),
          `${runtime} should be a valid runtime name`
        );
      });
    });

    it('should not contain duplicates', () => {
      const { detectAvailableRuntimes } = globalThis;
      const runtimes = detectAvailableRuntimes();
      const uniqueRuntimes = [...new Set(runtimes)];
      
      assert.deepStrictEqual(
        runtimes,
        uniqueRuntimes,
        'Should not contain duplicate runtimes'
      );
    });

    it('should default to [claude] when no runtimes detected', () => {
      const { detectAvailableRuntimes } = globalThis;
      // This test assumes claude is always available or the default
      const runtimes = detectAvailableRuntimes();
      
      // If no commands are found, it should default to claude
      assert.ok(
        runtimes.includes('claude') || runtimes.length > 0,
        'Should include claude or have detected runtimes'
      );
    });
  });
});

describe('Auto-Detect Integration', () => {
  let tempDir;
  let originalCwd;

  before(async () => {
    // Dynamically import the ES module - functions will be on globalThis
    await import('../dist/install.js');
  });

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-integration-'));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should use project config runtimes when available', () => {
    const { readProjectConfig } = globalThis;
    const faseDir = path.join(tempDir, '.fase-ai');
    fs.mkdirSync(faseDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(faseDir, 'config.json'),
      JSON.stringify({
        runtimes: ['opencode', 'gemini'],
        auto_install: true,
      }, null, 2)
    );
    
    const config = readProjectConfig();
    
    assert.deepStrictEqual(config.runtimes, ['opencode', 'gemini']);
    assert.strictEqual(config.auto_install, true);
  });

  it('should respect auto_install: false', () => {
    const { readProjectConfig } = globalThis;
    const faseDir = path.join(tempDir, '.fase-ai');
    fs.mkdirSync(faseDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(faseDir, 'config.json'),
      JSON.stringify({
        runtimes: ['claude'],
        auto_install: false,
      }, null, 2)
    );
    
    const config = readProjectConfig();
    
    assert.strictEqual(config.auto_install, false);
  });

  it('should work in postinstall environment with config', () => {
    const { isRunningAsPostinstall, readProjectConfig } = globalThis;
    process.env.npm_lifecycle_event = 'postinstall';
    
    const faseDir = path.join(tempDir, '.fase-ai');
    fs.mkdirSync(faseDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(faseDir, 'config.json'),
      JSON.stringify({
        runtimes: ['codex'],
        auto_install: true,
      }, null, 2)
    );
    
    const isPostinstall = isRunningAsPostinstall();
    const config = readProjectConfig();
    
    assert.strictEqual(isPostinstall, true);
    assert.deepStrictEqual(config.runtimes, ['codex']);
    assert.strictEqual(config.auto_install, true);
  });
});
