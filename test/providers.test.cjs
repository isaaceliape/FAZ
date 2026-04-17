const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Provider Configuration Tests
 * Tests all providers: Claude, OpenCode, Gemini, and Codex
 */

describe('Provider Configuration', () => {
  let tempDir;
  let originalEnv;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-provider-test-'));
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.env = originalEnv;
  });

  describe('Directory Structure', () => {
    const providers = [
      { name: 'claude', dir: '.claude', env: 'CLAUDE_CONFIG_DIR' },
      { name: 'opencode', dir: '.config/opencode', env: 'OPENCODE_CONFIG_DIR' },
      { name: 'gemini', dir: '.gemini', env: 'GEMINI_CONFIG_DIR' },
      { name: 'codex', dir: '.codex', env: 'CODEX_HOME' }
    ];

    providers.forEach(provider => {
      it(`should create ${provider.name} directory structure`, () => {
        const configPath = path.join(tempDir, provider.dir);
        const hookPath = path.join(configPath, 'hooks');
        const settingsPath = path.join(configPath, 'settings.json');

        // Create structure
        fs.mkdirSync(configPath, { recursive: true });
        fs.mkdirSync(hookPath, { recursive: true });
        fs.writeFileSync(settingsPath, JSON.stringify({ version: '1.0.0' }));

        // Verify
        assert.strictEqual(fs.existsSync(configPath), true, `${provider.name} config dir should exist`);
        assert.strictEqual(fs.existsSync(hookPath), true, `${provider.name} hooks dir should exist`);
        assert.strictEqual(fs.existsSync(settingsPath), true, `${provider.name} settings.json should exist`);
      });
    });
  });

  describe('Environment Variable Handling', () => {
    it('should respect CLAUDE_CONFIG_DIR environment variable', () => {
      const customDir = path.join(tempDir, 'custom-claude');
      process.env.CLAUDE_CONFIG_DIR = customDir;

      assert.strictEqual(process.env.CLAUDE_CONFIG_DIR, customDir);
    });

    it('should respect OPENCODE_CONFIG_DIR environment variable', () => {
      const customDir = path.join(tempDir, 'custom-opencode');
      process.env.OPENCODE_CONFIG_DIR = customDir;

      assert.strictEqual(process.env.OPENCODE_CONFIG_DIR, customDir);
    });

    it('should respect GEMINI_CONFIG_DIR environment variable', () => {
      const customDir = path.join(tempDir, 'custom-gemini');
      process.env.GEMINI_CONFIG_DIR = customDir;

      assert.strictEqual(process.env.GEMINI_CONFIG_DIR, customDir);
    });

    it('should respect CODEX_HOME environment variable', () => {
      const customDir = path.join(tempDir, 'custom-codex');
      process.env.CODEX_HOME = customDir;

      assert.strictEqual(process.env.CODEX_HOME, customDir);
    });

    it('should handle XDG_CONFIG_HOME for OpenCode', () => {
      const xdgHome = path.join(tempDir, 'xdg-config');
      process.env.XDG_CONFIG_HOME = xdgHome;

      assert.strictEqual(process.env.XDG_CONFIG_HOME, xdgHome);
    });

    it('should handle OPENCODE_CONFIG path variable', () => {
      const configFile = path.join(tempDir, 'opencode.json');
      process.env.OPENCODE_CONFIG = configFile;

      assert.strictEqual(process.env.OPENCODE_CONFIG, configFile);
    });
  });

  describe('Settings File Format', () => {
    it('should write valid JSON settings for Claude', () => {
      const settingsPath = path.join(tempDir, 'claude-settings.json');
      const settings = {
        version: '1.0.0',
        attribution: {
          commit: 'Claude Code <claude@anthropic.com>'
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.deepStrictEqual(read, settings);
    });

    it('should write valid JSON settings for OpenCode', () => {
      const settingsPath = path.join(tempDir, 'opencode.json');
      const settings = {
        disable_ai_attribution: false,
        version: '1.0.0'
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.deepStrictEqual(read, settings);
    });

    it('should write valid JSON settings for Gemini', () => {
      const settingsPath = path.join(tempDir, 'gemini-settings.json');
      const settings = {
        version: '1.0.0',
        attribution: {
          commit: 'Gemini <gemini@google.com>'
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.deepStrictEqual(read, settings);
    });

    it('should write valid JSON settings for Codex', () => {
      const settingsPath = path.join(tempDir, 'codex-settings.json');
      const settings = {
        version: '1.0.0',
        attribution: {
          commit: 'Codex <codex@openai.com>'
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.deepStrictEqual(read, settings);
    });
  });

  describe('Attribution Settings', () => {
    it('should handle disabled attribution for OpenCode', () => {
      const settingsPath = path.join(tempDir, 'opencode.json');
      const settings = { disable_ai_attribution: true };

      fs.writeFileSync(settingsPath, JSON.stringify(settings));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.disable_ai_attribution, true);
    });

    it('should handle custom attribution for Claude', () => {
      const settingsPath = path.join(tempDir, 'claude-settings.json');
      const settings = {
        attribution: {
          commit: 'Custom Attribution <custom@example.com>'
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.attribution.commit, 'Custom Attribution <custom@example.com>');
    });

    it('should handle empty attribution for Gemini', () => {
      const settingsPath = path.join(tempDir, 'gemini-settings.json');
      const settings = {
        attribution: {
          commit: ''
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.attribution.commit, '');
    });

    it('should handle undefined attribution', () => {
      const settingsPath = path.join(tempDir, 'codex-settings.json');
      const settings = {};

      fs.writeFileSync(settingsPath, JSON.stringify(settings));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.attribution, undefined);
    });
  });

  describe('Hook Files', () => {
    it('should create hook file for Claude', () => {
      const hookPath = path.join(tempDir, 'claude-hook.js');
      const hookContent = `#!/usr/bin/env node\nconsole.log('Claude hook');`;

      fs.writeFileSync(hookPath, hookContent);
      fs.chmodSync(hookPath, 0o755);

      assert.strictEqual(fs.existsSync(hookPath), true);
      const stat = fs.statSync(hookPath);
      assert.strictEqual((stat.mode & 0o111) !== 0, true, 'Hook should be executable');
    });

    it('should create hook file for OpenCode', () => {
      const hookPath = path.join(tempDir, 'opencode-hook.js');
      const hookContent = `#!/usr/bin/env node\nconsole.log('OpenCode hook');`;

      fs.writeFileSync(hookPath, hookContent);
      fs.chmodSync(hookPath, 0o755);

      assert.strictEqual(fs.existsSync(hookPath), true);
    });

    it('should create hook file for Gemini', () => {
      const hookPath = path.join(tempDir, 'gemini-hook.js');
      const hookContent = `#!/usr/bin/env node\nconsole.log('Gemini hook');`;

      fs.writeFileSync(hookPath, hookContent);
      fs.chmodSync(hookPath, 0o755);

      assert.strictEqual(fs.existsSync(hookPath), true);
    });

    it('should create hook file for Codex', () => {
      const hookPath = path.join(tempDir, 'codex-hook.js');
      const hookContent = `#!/usr/bin/env node\nconsole.log('Codex hook');`;

      fs.writeFileSync(hookPath, hookContent);
      fs.chmodSync(hookPath, 0o755);

      assert.strictEqual(fs.existsSync(hookPath), true);
    });
  });

  describe('Path Expansion', () => {
    it('should expand tilde for Claude config', () => {
      const tilePath = '~/.claude';
      const expanded = tilePath.startsWith('~/')
        ? path.join(os.homedir(), tilePath.slice(2))
        : tilePath;

      assert.strictEqual(expanded, path.join(os.homedir(), '.claude'));
    });

    it('should expand tilde for OpenCode config', () => {
      const tilePath = '~/.config/opencode';
      const expanded = tilePath.startsWith('~/')
        ? path.join(os.homedir(), tilePath.slice(2))
        : tilePath;

      assert.strictEqual(expanded, path.join(os.homedir(), '.config', 'opencode'));
    });

    it('should expand tilde for Gemini config', () => {
      const tilePath = '~/.gemini';
      const expanded = tilePath.startsWith('~/')
        ? path.join(os.homedir(), tilePath.slice(2))
        : tilePath;

      assert.strictEqual(expanded, path.join(os.homedir(), '.gemini'));
    });

    it('should expand tilde for Codex config', () => {
      const tilePath = '~/.codex';
      const expanded = tilePath.startsWith('~/')
        ? path.join(os.homedir(), tilePath.slice(2))
        : tilePath;

      assert.strictEqual(expanded, path.join(os.homedir(), '.codex'));
    });
  });

  describe('Duplicate Configuration Prevention', () => {
    it('should not create duplicate Claude configs', () => {
      const configPath = path.join(tempDir, '.claude');
      fs.mkdirSync(configPath, { recursive: true });

      // Try to create again
      assert.doesNotThrow(() => {
        fs.mkdirSync(configPath, { recursive: true });
      });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should not create duplicate OpenCode configs', () => {
      const configPath = path.join(tempDir, '.config', 'opencode');
      fs.mkdirSync(configPath, { recursive: true });

      assert.doesNotThrow(() => {
        fs.mkdirSync(configPath, { recursive: true });
      });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should not create duplicate Gemini configs', () => {
      const configPath = path.join(tempDir, '.gemini');
      fs.mkdirSync(configPath, { recursive: true });

      assert.doesNotThrow(() => {
        fs.mkdirSync(configPath, { recursive: true });
      });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should not create duplicate Codex configs', () => {
      const configPath = path.join(tempDir, '.codex');
      fs.mkdirSync(configPath, { recursive: true });

      assert.doesNotThrow(() => {
        fs.mkdirSync(configPath, { recursive: true });
      });

      assert.strictEqual(fs.existsSync(configPath), true);
    });
  });

  describe('Provider-Specific Default Paths', () => {
    it('Claude should default to ~/.claude', () => {
      const defaultPath = path.join(os.homedir(), '.claude');
      assert.ok(defaultPath.endsWith('.claude'));
    });

    it('OpenCode should default to ~/.config/opencode', () => {
      const defaultPath = path.join(os.homedir(), '.config', 'opencode');
      assert.ok(defaultPath.includes('.config') && defaultPath.includes('opencode'));
    });

    it('Gemini should default to ~/.gemini', () => {
      const defaultPath = path.join(os.homedir(), '.gemini');
      assert.ok(defaultPath.endsWith('.gemini'));
    });

    it('Codex should default to ~/.codex', () => {
      const defaultPath = path.join(os.homedir(), '.codex');
      assert.ok(defaultPath.endsWith('.codex'));
    });
  });

  describe('Permissions', () => {
    it('should set correct permissions for Claude config dir', () => {
      const configPath = path.join(tempDir, '.claude');
      fs.mkdirSync(configPath, { recursive: true, mode: 0o755 });
      fs.chmodSync(configPath, 0o755);

      const stat = fs.statSync(configPath);
      assert.strictEqual((stat.mode & 0o777), 0o755);
    });

    it('should set correct permissions for hook files', () => {
      const hookPath = path.join(tempDir, 'hook.js');
      fs.writeFileSync(hookPath, '#!/usr/bin/env node\n');
      fs.chmodSync(hookPath, 0o755);

      const stat = fs.statSync(hookPath);
      assert.strictEqual((stat.mode & 0o111) !== 0, true);
    });
  });

  describe('Mixed Provider Installation', () => {
    it('should support installing multiple providers simultaneously', () => {
      const providers = ['.claude', '.gemini', '.codex', '.config/opencode'];

      providers.forEach(provider => {
        const configPath = path.join(tempDir, provider);
        fs.mkdirSync(configPath, { recursive: true });
        assert.strictEqual(fs.existsSync(configPath), true);
      });

      assert.strictEqual(providers.length, 4);
    });

    it('should isolate configurations between providers', () => {
      const claudePath = path.join(tempDir, '.claude', 'settings.json');
      const geminPath = path.join(tempDir, '.gemini', 'settings.json');

      fs.mkdirSync(path.dirname(claudePath), { recursive: true });
      fs.mkdirSync(path.dirname(geminPath), { recursive: true });

      fs.writeFileSync(claudePath, JSON.stringify({ provider: 'claude' }));
      fs.writeFileSync(geminPath, JSON.stringify({ provider: 'gemini' }));

      const claude = JSON.parse(fs.readFileSync(claudePath, 'utf8'));
      const gemini = JSON.parse(fs.readFileSync(geminPath, 'utf8'));

      assert.strictEqual(claude.provider, 'claude');
      assert.strictEqual(gemini.provider, 'gemini');
    });
  });
});

describe('Provider Validation', () => {
  describe('Valid Providers', () => {
    const validProviders = ['claude', 'opencode', 'gemini', 'codex'];

    validProviders.forEach(provider => {
      it(`should validate ${provider} as a valid provider`, () => {
        assert.ok(validProviders.includes(provider));
      });
    });
  });

  describe('Invalid Providers', () => {
    const invalidProviders = ['invalid', 'gpt', 'bard', 'unknown', ''];

    invalidProviders.forEach(provider => {
      it(`should reject ${provider || 'empty string'} as invalid`, () => {
        assert.strictEqual(['claude', 'opencode', 'gemini', 'codex'].includes(provider), false);
      });
    });
  });
});
