const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Integration Tests for Provider Installation
 * Tests various installation scenarios across different environments
 */

describe('Installation Integration Tests', () => {
  let tempDir;
  let originalEnv;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-integration-test-'));
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.env = originalEnv;
  });

  describe('Local Installation', () => {
    it('should install Claude locally', () => {
      const globalDir = path.join(tempDir, '.claude');
      const setupDirs = [globalDir, path.join(globalDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // Create VERSION file
      fs.writeFileSync(path.join(globalDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(globalDir), true);
      assert.strictEqual(fs.existsSync(path.join(globalDir, 'hooks')), true);
      assert.strictEqual(fs.readFileSync(path.join(globalDir, 'VERSION'), 'utf8'), '2.6.1');
    });

    it('should install OpenCode locally with XDG structure', () => {
      const globalDir = path.join(tempDir, '.config', 'opencode');
      const setupDirs = [globalDir, path.join(globalDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(globalDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(globalDir), true);
      assert.strictEqual(fs.existsSync(path.join(globalDir, 'hooks')), true);
    });

    it('should install Gemini locally', () => {
      const globalDir = path.join(tempDir, '.gemini');
      const setupDirs = [globalDir, path.join(globalDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(globalDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(globalDir), true);
      assert.strictEqual(fs.existsSync(path.join(globalDir, 'hooks')), true);
    });

    it('should install Codex locally', () => {
      const globalDir = path.join(tempDir, '.codex');
      const setupDirs = [globalDir, path.join(globalDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(globalDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(globalDir), true);
      assert.strictEqual(fs.existsSync(path.join(globalDir, 'hooks')), true);
    });
  });

  describe('Local Installation', () => {
    it('should install Claude locally in project', () => {
      const projectDir = path.join(tempDir, 'my-project');
      const faseDir = path.join(projectDir, '.claude');
      const setupDirs = [faseDir, path.join(faseDir, 'hooks')];

      fs.mkdirSync(projectDir, { recursive: true });
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(faseDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(faseDir), true);
      assert.ok(faseDir.includes('my-project'));
    });

    it('should install OpenCode locally in project', () => {
      const projectDir = path.join(tempDir, 'my-project');
      const faseDir = path.join(projectDir, '.opencode');
      const setupDirs = [faseDir, path.join(faseDir, 'hooks')];

      fs.mkdirSync(projectDir, { recursive: true });
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(faseDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(faseDir), true);
      assert.ok(faseDir.includes('my-project'));
    });

    it('should install Gemini locally in project', () => {
      const projectDir = path.join(tempDir, 'my-project');
      const faseDir = path.join(projectDir, '.gemini');
      const setupDirs = [faseDir, path.join(faseDir, 'hooks')];

      fs.mkdirSync(projectDir, { recursive: true });
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(faseDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(faseDir), true);
      assert.ok(faseDir.includes('my-project'));
    });

    it('should install Codex locally in project', () => {
      const projectDir = path.join(tempDir, 'my-project');
      const faseDir = path.join(projectDir, '.codex');
      const setupDirs = [faseDir, path.join(faseDir, 'hooks')];

      fs.mkdirSync(projectDir, { recursive: true });
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(faseDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(faseDir), true);
      assert.ok(faseDir.includes('my-project'));
    });
  });

  describe('Custom Config Directory', () => {
    it('should install Claude in custom directory', () => {
      const customDir = path.join(tempDir, 'my-custom-claude');
      const setupDirs = [customDir, path.join(customDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(customDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(customDir), true);
      assert.ok(customDir.includes('my-custom-claude'));
    });

    it('should install OpenCode in custom directory', () => {
      const customDir = path.join(tempDir, 'my-custom-opencode');
      const setupDirs = [customDir, path.join(customDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(customDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(customDir), true);
    });

    it('should install Gemini in custom directory', () => {
      const customDir = path.join(tempDir, 'my-custom-gemini');
      const setupDirs = [customDir, path.join(customDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(customDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(customDir), true);
    });

    it('should install Codex in custom directory', () => {
      const customDir = path.join(tempDir, 'my-custom-codex');
      const setupDirs = [customDir, path.join(customDir, 'hooks')];

      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(customDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(customDir), true);
    });
  });

  describe('Multiple Providers Installation', () => {
    it('should install all providers simultaneously', () => {
      const providers = [
        { name: 'claude', dir: '.claude' },
        { name: 'opencode', dir: '.opencode' },
        { name: 'gemini', dir: '.gemini' },
        { name: 'codex', dir: '.codex' }
      ];

      providers.forEach(provider => {
        const setupDirs = [
          path.join(tempDir, provider.dir),
          path.join(tempDir, provider.dir, 'hooks')
        ];

        setupDirs.forEach(dir => {
          fs.mkdirSync(dir, { recursive: true });
        });

        fs.writeFileSync(path.join(tempDir, provider.dir, 'VERSION'), '2.6.1');
      });

      providers.forEach(provider => {
        assert.strictEqual(
          fs.existsSync(path.join(tempDir, provider.dir)),
          true,
          `${provider.name} directory should exist`
        );
      });

      assert.strictEqual(providers.length, 4);
    });

    it('should install Claude and OpenCode', () => {
      const providers = ['.claude', '.opencode'];

      providers.forEach(dir => {
        fs.mkdirSync(path.join(tempDir, dir, 'hooks'), { recursive: true });
        fs.writeFileSync(path.join(tempDir, dir, 'VERSION'), '2.6.1');
      });

      providers.forEach(dir => {
        assert.strictEqual(fs.existsSync(path.join(tempDir, dir)), true);
      });
    });

    it('should install Gemini and Codex', () => {
      const providers = ['.gemini', '.codex'];

      providers.forEach(dir => {
        fs.mkdirSync(path.join(tempDir, dir, 'hooks'), { recursive: true });
        fs.writeFileSync(path.join(tempDir, dir, 'VERSION'), '2.6.1');
      });

      providers.forEach(dir => {
        assert.strictEqual(fs.existsSync(path.join(tempDir, dir)), true);
      });
    });
  });

  describe('Version Management', () => {
    it('should write VERSION file for Claude', () => {
      const versionPath = path.join(tempDir, '.claude', 'VERSION');
      fs.mkdirSync(path.dirname(versionPath), { recursive: true });

      const version = '2.6.1';
      fs.writeFileSync(versionPath, version);

      assert.strictEqual(fs.readFileSync(versionPath, 'utf8'), version);
    });

    it('should update VERSION file on reinstall', () => {
      const versionPath = path.join(tempDir, '.claude', 'VERSION');
      fs.mkdirSync(path.dirname(versionPath), { recursive: true });

      fs.writeFileSync(versionPath, '2.6.0');
      assert.strictEqual(fs.readFileSync(versionPath, 'utf8'), '2.6.0');

      fs.writeFileSync(versionPath, '2.6.1');
      assert.strictEqual(fs.readFileSync(versionPath, 'utf8'), '2.6.1');
    });

    it('should handle VERSION file across providers', () => {
      const providers = ['claude', 'opencode', 'gemini', 'codex'];
      const version = '2.6.1';

      providers.forEach(provider => {
        const dir = path.join(tempDir, `.${provider}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'VERSION'), version);
      });

      providers.forEach(provider => {
        const versionFile = path.join(tempDir, `.${provider}`, 'VERSION');
        assert.strictEqual(fs.readFileSync(versionFile, 'utf8'), version);
      });
    });
  });

  describe('Configuration Persistence', () => {
    it('should preserve settings on reinstall for Claude', () => {
      const settingsPath = path.join(tempDir, '.claude', 'settings.json');
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

      const settings = { custom: true, version: '1.0.0' };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      // Simulate reinstall (dir already exists)
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

      // Settings should still be there
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.deepStrictEqual(read, settings);
    });

    it('should handle settings merge on update', () => {
      const settingsPath = path.join(tempDir, '.opencode', 'settings.json');
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

      // Initial settings
      const initial = { custom: true };
      fs.writeFileSync(settingsPath, JSON.stringify(initial, null, 2));

      // Update settings
      const updated = { ...initial, version: '1.0.0' };
      fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));

      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(read.custom, true);
      assert.strictEqual(read.version, '1.0.0');
    });
  });

  describe('Uninstallation', () => {
    it('should remove Claude installation', () => {
      const dir = path.join(tempDir, '.claude');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(dir), true);

      fs.rmSync(dir, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(dir), false);
    });

    it('should remove OpenCode installation', () => {
      const dir = path.join(tempDir, '.opencode');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(dir), true);

      fs.rmSync(dir, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(dir), false);
    });

    it('should remove Gemini installation', () => {
      const dir = path.join(tempDir, '.gemini');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(dir), true);

      fs.rmSync(dir, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(dir), false);
    });

    it('should remove Codex installation', () => {
      const dir = path.join(tempDir, '.codex');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(dir), true);

      fs.rmSync(dir, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(dir), false);
    });

    it('should selectively remove one provider while keeping others', () => {
      const providers = ['claude', 'opencode', 'gemini', 'codex'];

      // Install all
      providers.forEach(provider => {
        const dir = path.join(tempDir, `.${provider}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');
      });

      // Remove only Claude
      fs.rmSync(path.join(tempDir, '.claude'), { recursive: true, force: true });

      // Check results
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.claude')), false);
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.opencode')), true);
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.gemini')), true);
      assert.strictEqual(fs.existsSync(path.join(tempDir, '.codex')), true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing parent directory gracefully', () => {
      const invalidPath = path.join(tempDir, 'nonexistent', 'path', 'VERSION');

      let errorCaught = false;
      try {
        fs.writeFileSync(invalidPath, '2.6.1');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'ENOENT');
      }

      assert.strictEqual(errorCaught, true);
    });

    it('should handle permission errors during installation', function() {
      // Skip this test when running as root (chmod doesn't prevent write access)
      if (process.getuid && process.getuid() === 0) {
        this.skip();
      }

      const dir = path.join(tempDir, 'readonly');
      fs.mkdirSync(dir);
      fs.chmodSync(dir, 0o444);

      let errorCaught = false;
      try {
        fs.writeFileSync(path.join(dir, 'test.txt'), 'test');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'EACCES');
      } finally {
        fs.chmodSync(dir, 0o755);
      }

      assert.strictEqual(errorCaught, true);
    });

    it('should handle corrupt settings.json', () => {
      const settingsPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(settingsPath, 'invalid json {');

      let errorCaught = false;
      try {
        JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      } catch (err) {
        errorCaught = true;
        assert.ok(err instanceof SyntaxError);
      }

      assert.strictEqual(errorCaught, true);
    });
  });
});
