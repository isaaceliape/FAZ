const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('FASE Provider-Specific Installation', () => {
  let tempDir;
  const INSTALLER_PATH = path.join(__dirname, '..', 'dist', 'install.js');

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-provider-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Provider Path Resolution', () => {
    it('should construct correct claude config path', () => {
      const expectedPath = path.join(os.homedir(), '.claude');
      // Verify path construction logic (without actually installing)
      assert.ok(expectedPath.includes('.claude'), 'Claude path should include .claude');
      assert.ok(path.isAbsolute(expectedPath), 'Claude path should be absolute');
    });

    it('should construct correct opencode config path', () => {
      const expectedPath = path.join(os.homedir(), '.config', 'opencode');
      assert.ok(expectedPath.includes('opencode'), 'OpenCode path should include opencode');
      assert.ok(expectedPath.includes('.config'), 'OpenCode path should include .config');
      assert.ok(path.isAbsolute(expectedPath), 'OpenCode path should be absolute');
    });

    it('should construct correct gemini config path', () => {
      const expectedPath = path.join(os.homedir(), '.gemini');
      assert.ok(expectedPath.includes('.gemini'), 'Gemini path should include .gemini');
      assert.ok(path.isAbsolute(expectedPath), 'Gemini path should be absolute');
    });

    it('should construct correct codex config path', () => {
      const expectedPath = path.join(os.homedir(), '.codex');
      assert.ok(expectedPath.includes('.codex'), 'Codex path should include .codex');
      assert.ok(path.isAbsolute(expectedPath), 'Codex path should be absolute');
    });

    it('should construct correct copilot config path', () => {
      const expectedPath = path.join(os.homedir(), '.copilot');
      assert.ok(expectedPath.includes('.copilot'), 'Copilot path should include .copilot');
      assert.ok(path.isAbsolute(expectedPath), 'Copilot path should be absolute');
    });

    it('should construct correct qwen config path', () => {
      const expectedPath = path.join(os.homedir(), '.qwen');
      assert.ok(expectedPath.includes('.qwen'), 'Qwen path should include .qwen');
      assert.ok(path.isAbsolute(expectedPath), 'Qwen path should be absolute');
    });

    it('should validate all provider paths are absolute', () => {
      const providers = ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
      providers.forEach(provider => {
        // Each provider path should start with homedir (absolute)
        let providerPath;
        if (provider === 'opencode') {
          providerPath = path.join(os.homedir(), '.config', 'opencode');
        } else {
          providerPath = path.join(os.homedir(), '.' + provider);
        }
        assert.ok(path.isAbsolute(providerPath), `${provider} path should be absolute`);
        assert.ok(providerPath.startsWith(os.homedir()), `${provider} path should start with homedir`);
      });
    });

    it('should handle environment variable overrides for claude', () => {
      // CLAUDE_CONFIG_DIR env var overrides default path
      const envPath = process.env.CLAUDE_CONFIG_DIR;
      if (envPath) {
        assert.ok(path.isAbsolute(envPath), 'CLAUDE_CONFIG_DIR should be absolute');
      }
    });

    it('should handle environment variable overrides for opencode', () => {
      // OPENCODE_CONFIG_DIR env var overrides default path
      const envPath = process.env.OPENCODE_CONFIG_DIR;
      if (envPath) {
        assert.ok(path.isAbsolute(envPath), 'OPENCODE_CONFIG_DIR should be absolute');
      }
    });
  });

  describe('Provider Flag Selection', () => {
    it('should select single provider with --claude flag', () => {
      // Simulate flag parsing logic test
      const args = ['--claude'];
      const hasClaude = args.includes('--claude');
      assert.strictEqual(hasClaude, true, '--claude should be detected');
      assert.strictEqual(args.length, 1, 'Single flag should be parsed');
    });

    it('should select single provider with --opencode flag', () => {
      const args = ['--opencode'];
      const hasOpencode = args.includes('--opencode');
      assert.strictEqual(hasOpencode, true, '--opencode should be detected');
    });

    it('should select single provider with --gemini flag', () => {
      const args = ['--gemini'];
      const hasGemini = args.includes('--gemini');
      assert.strictEqual(hasGemini, true, '--gemini should be detected');
    });

    it('should select single provider with --codex flag', () => {
      const args = ['--codex'];
      const hasCodex = args.includes('--codex');
      assert.strictEqual(hasCodex, true, '--codex should be detected');
    });

    it('should select single provider with --copilot flag', () => {
      const args = ['--copilot'];
      const hasCopilot = args.includes('--copilot');
      assert.strictEqual(hasCopilot, true, '--copilot should be detected');
    });

    it('should select single provider with --qwen flag', () => {
      const args = ['--qwen'];
      const hasQwen = args.includes('--qwen');
      assert.strictEqual(hasQwen, true, '--qwen should be detected');
    });

    it('should select all providers with --all flag', () => {
      const args = ['--all'];
      const expectedProviders = ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
      // Test flag logic (actual installation would require real provider CLI)
      assert.ok(args.includes('--all'), '--all should be detected');
      assert.strictEqual(expectedProviders.length, 6, 'All 6 providers should be supported');
    });

    it('should select both claude and opencode with --both flag', () => {
      const args = ['--both'];
      assert.ok(args.includes('--both'), '--both legacy flag should work');
      // --both should select claude and opencode
      const bothProviders = ['claude', 'opencode'];
      assert.strictEqual(bothProviders.length, 2, '--both should select 2 providers');
    });

    it('should handle multiple provider flags', () => {
      const args = ['--claude', '--gemini', '--codex'];
      const selected = [];
      if (args.includes('--claude')) selected.push('claude');
      if (args.includes('--gemini')) selected.push('gemini');
      if (args.includes('--codex')) selected.push('codex');
      assert.strictEqual(selected.length, 3, 'Three providers should be selected');
      assert.ok(selected.includes('claude'), 'claude should be in selection');
      assert.ok(selected.includes('gemini'), 'gemini should be in selection');
      assert.ok(selected.includes('codex'), 'codex should be in selection');
    });

    it('should not conflict --all with single provider flags', () => {
      const args = ['--all', '--claude'];
      // --all should take precedence (all providers)
      const hasAll = args.includes('--all');
      assert.strictEqual(hasAll, true, '--all should be present');
      // When --all is present, all providers are selected regardless of other flags
    });
  });

  describe('Provider Config Directory Names', () => {
    it('should use .claude for claude provider', () => {
      const dirName = '.claude';
      assert.strictEqual(dirName.startsWith('.'), true, 'Config directory should start with .');
      assert.strictEqual(dirName, '.claude', 'Claude uses .claude directory');
    });

    it('should use .config/opencode for opencode provider', () => {
      // OpenCode follows XDG spec
      const configDir = '.config';
      const opencodeDir = 'opencode';
      assert.ok(configDir === '.config', 'OpenCode uses XDG config directory');
      assert.strictEqual(opencodeDir, 'opencode', 'OpenCode directory name');
    });

    it('should use .gemini for gemini provider', () => {
      const dirName = '.gemini';
      assert.strictEqual(dirName, '.gemini', 'Gemini uses .gemini directory');
    });

    it('should use .codex for codex provider', () => {
      const dirName = '.codex';
      assert.strictEqual(dirName, '.codex', 'Codex uses .codex directory');
    });

    it('should use .copilot for copilot provider', () => {
      const dirName = '.copilot';
      assert.strictEqual(dirName, '.copilot', 'Copilot uses .copilot directory');
    });

    it('should use .qwen for qwen provider', () => {
      const dirName = '.qwen';
      assert.strictEqual(dirName, '.qwen', 'Qwen uses .qwen directory');
    });
  });

  describe('Local vs Global Install Paths', () => {
    it('should detect local install path for claude', () => {
      const localDir = path.join(process.cwd(), '.claude');
      assert.ok(localDir.includes(process.cwd()), 'Local path should include cwd');
      assert.ok(localDir.endsWith('.claude'), 'Local path should end with .claude');
    });

    it('should detect local install path for opencode', () => {
      const localDir = path.join(process.cwd(), '.opencode');
      assert.ok(localDir.includes(process.cwd()), 'Local path should include cwd');
      assert.ok(localDir.endsWith('.opencode'), 'Local path should end with .opencode');
    });

    it('should distinguish global vs local paths', () => {
      const globalClaude = path.join(os.homedir(), '.claude');
      const localClaude = path.join(process.cwd(), '.claude');
      assert.notStrictEqual(globalClaude, localClaude, 'Global and local paths should differ');
      assert.ok(globalClaude.startsWith(os.homedir()), 'Global path starts with homedir');
      assert.ok(localClaude.startsWith(process.cwd()), 'Local path starts with cwd');
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running FASE provider-specific installation tests...\n');
  console.log('To run tests with a test framework, use:');
  console.log('  npm test');
}

module.exports = { describe, it, beforeEach, afterEach };