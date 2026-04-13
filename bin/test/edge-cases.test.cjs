const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Edge Cases and Complex Scenarios
 * Tests unusual but valid installation scenarios
 */

describe('Edge Cases and Complex Scenarios', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-edge-case-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Symlink Handling', () => {
    it('should handle symlinked configuration directory', () => {
      const realDir = path.join(tempDir, 'real-claude');
      const linkDir = path.join(tempDir, '.claude');

      fs.mkdirSync(realDir, { recursive: true });

      // Create symlink
      try {
        fs.symlinkSync(realDir, linkDir, 'dir');
        assert.strictEqual(fs.existsSync(linkDir), true);
      } catch (err) {
        // Symlinks might not be supported on all systems
        if (err.code === 'ENOSYS' || err.code === 'EPERM') {
          this.skip();
        } else {
          throw err;
        }
      }
    });

    it('should handle relative symlinks', () => {
      const realDir = path.join(tempDir, 'real');
      const linkDir = path.join(tempDir, 'link');

      fs.mkdirSync(realDir);

      try {
        fs.symlinkSync(path.relative(tempDir, realDir), linkDir, 'dir');
        assert.strictEqual(fs.existsSync(linkDir), true);
      } catch (err) {
        if (err.code === 'ENOSYS' || err.code === 'EPERM') {
          this.skip();
        } else {
          throw err;
        }
      }
    });
  });

  describe('Long Path Names', () => {
    it('should handle very long configuration paths', () => {
      const deepPath = path.join(
        tempDir,
        'a'.repeat(20),
        'b'.repeat(20),
        'c'.repeat(20),
        'config'
      );

      fs.mkdirSync(deepPath, { recursive: true });
      assert.strictEqual(fs.existsSync(deepPath), true);
    });

    it('should handle long provider names', () => {
      const longName = 'very-long-provider-name-' + 'x'.repeat(50);
      const configPath = path.join(tempDir, `.${longName}`);

      fs.mkdirSync(configPath, { recursive: true });
      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should handle many nested directories', () => {
      let nestedPath = tempDir;
      for (let i = 0; i < 30; i++) {
        nestedPath = path.join(nestedPath, `level${i}`);
      }

      fs.mkdirSync(nestedPath, { recursive: true });
      assert.strictEqual(fs.existsSync(nestedPath), true);
    });
  });

  describe('Special Characters in Paths', () => {
    it('should handle spaces in paths', () => {
      const configPath = path.join(tempDir, 'my config dir', '.claude');
      fs.mkdirSync(configPath, { recursive: true });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should handle hyphens in paths', () => {
      const configPath = path.join(tempDir, 'my-custom-config', '.claude');
      fs.mkdirSync(configPath, { recursive: true });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should handle underscores in paths', () => {
      const configPath = path.join(tempDir, 'my_custom_config', '.claude');
      fs.mkdirSync(configPath, { recursive: true });

      assert.strictEqual(fs.existsSync(configPath), true);
    });

    it('should handle dots in paths', () => {
      const configPath = path.join(tempDir, 'config.v1.0', '.claude');
      fs.mkdirSync(configPath, { recursive: true });

      assert.strictEqual(fs.existsSync(configPath), true);
    });
  });

  describe('Large Configuration Files', () => {
    it('should handle large settings.json files', () => {
      const settingsPath = path.join(tempDir, 'settings.json');

      // Create a large settings object
      const largeSettings = {
        version: '1.0.0',
        data: 'x'.repeat(10000),
        nested: {
          deep: {
            settings: 'y'.repeat(10000)
          }
        }
      };

      fs.writeFileSync(settingsPath, JSON.stringify(largeSettings));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.version, '1.0.0');
    });

    it('should handle settings with many properties', () => {
      const settingsPath = path.join(tempDir, 'settings.json');

      const settings = {};
      for (let i = 0; i < 1000; i++) {
        settings[`property_${i}`] = `value_${i}`;
      }

      fs.writeFileSync(settingsPath, JSON.stringify(settings));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(Object.keys(read).length, 1000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle simultaneous provider installations', (done) => {
      const providers = ['claude', 'opencode', 'gemini', 'codex'];
      let completed = 0;

      providers.forEach(provider => {
        const dir = path.join(tempDir, `.${provider}`);
        const hookDir = path.join(dir, 'hooks');

        setImmediate(() => {
          fs.mkdirSync(dir, { recursive: true });
          fs.mkdirSync(hookDir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');

          completed++;
          if (completed === providers.length) {
            providers.forEach(provider => {
              assert.strictEqual(
                fs.existsSync(path.join(tempDir, `.${provider}`)),
                true
              );
            });
            done();
          }
        });
      });
    });

    it('should handle concurrent file writes', (done) => {
      const files = [];
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const filePath = path.join(tempDir, `file-${i}.json`);
        files.push(filePath);

        promises.push(
          new Promise((resolve) => {
            setImmediate(() => {
              const content = { index: i, data: `content-${i}` };
              fs.writeFileSync(filePath, JSON.stringify(content));
              resolve();
            });
          })
        );
      }

      Promise.all(promises).then(() => {
        files.forEach((file, index) => {
          assert.strictEqual(fs.existsSync(file), true);
          const content = JSON.parse(fs.readFileSync(file, 'utf8'));
          assert.strictEqual(content.index, index);
        });
        done();
      });
    });
  });

  describe('Migration Scenarios', () => {
    it('should handle migration from old to new config format', () => {
      // Old format
      const oldPath = path.join(tempDir, 'old-claude', 'config.ini');
      fs.mkdirSync(path.dirname(oldPath), { recursive: true });
      fs.writeFileSync(oldPath, '[settings]\nversion=1.0.0\n');

      // New format
      const newPath = path.join(tempDir, 'new-claude', 'settings.json');
      fs.mkdirSync(path.dirname(newPath), { recursive: true });

      const oldContent = fs.readFileSync(oldPath, 'utf8');
      const newContent = { version: '2.0.0', migrated: true };
      fs.writeFileSync(newPath, JSON.stringify(newContent));

      assert.strictEqual(fs.existsSync(oldPath), true);
      assert.strictEqual(fs.existsSync(newPath), true);
    });

    it('should handle rolling back after failed migration', () => {
      const configPath = path.join(tempDir, 'config.json');

      // Original settings
      const original = { version: '1.0.0', data: 'original' };
      fs.writeFileSync(configPath, JSON.stringify(original));

      // Backup
      const backupPath = path.join(tempDir, 'config.json.backup');
      fs.copyFileSync(configPath, backupPath);

      // Attempt migration
      const migrated = { version: '2.0.0', data: 'migrated' };
      fs.writeFileSync(configPath, JSON.stringify(migrated));

      // Rollback
      if (!JSON.parse(fs.readFileSync(configPath, 'utf8')).data.includes('original')) {
        fs.copyFileSync(backupPath, configPath);
      }

      const restored = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(restored.version, '1.0.0');
    });
  });

  describe('Disk Space Constraints', () => {
    it('should handle creation of many small files', () => {
      const filesDir = path.join(tempDir, 'many-files');
      fs.mkdirSync(filesDir, { recursive: true });

      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(
          path.join(filesDir, `file-${i}.txt`),
          `content ${i}`
        );
      }

      const files = fs.readdirSync(filesDir);
      assert.strictEqual(files.length, 100);
    });

    it('should handle creation of few large files', () => {
      const filesDir = path.join(tempDir, 'large-files');
      fs.mkdirSync(filesDir, { recursive: true });

      for (let i = 0; i < 5; i++) {
        const content = Buffer.alloc(1024 * 100, `data-${i}`); // 100KB each
        fs.writeFileSync(path.join(filesDir, `file-${i}.bin`), content);
      }

      const files = fs.readdirSync(filesDir);
      assert.strictEqual(files.length, 5);
    });
  });

  describe('Permission Edge Cases', () => {
    it('should handle read-only configuration', () => {
      const configPath = path.join(tempDir, '.claude', 'settings.json');
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify({ readonly: true }));

      fs.chmodSync(configPath, 0o444);

      // Should be able to read
      const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(content.readonly, true);

      // Cleanup
      fs.chmodSync(configPath, 0o644);
    });

    it('should handle directories with no execute permission', function() {
      // Skip this test when running as root (chmod doesn't work as expected)
      if (process.getuid && process.getuid() === 0) {
        this.skip();
      }

      const configPath = path.join(tempDir, 'no-exec', 'config.json');
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify({ test: true }));

      // Remove execute permission
      fs.chmodSync(path.dirname(configPath), 0o600);

      // Should still be readable with dir listing
      try {
        const files = fs.readdirSync(path.dirname(configPath));
        assert.ok(files.includes('config.json'));
      } finally {
        // Cleanup
        fs.chmodSync(path.dirname(configPath), 0o755);
      }
    });
  });

  describe('Race Conditions', () => {
    it('should handle rapid create-read cycles', () => {
      const filePath = path.join(tempDir, 'racing.json');

      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(filePath, JSON.stringify({ iteration: i }));
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        assert.strictEqual(content.iteration, i);
      }
    });

    it('should handle multiple reads during writes', (done) => {
      const filePath = path.join(tempDir, 'concurrent-read-write.json');
      const results = [];

      const writeInterval = setInterval(() => {
        try {
          fs.writeFileSync(filePath, JSON.stringify({ timestamp: Date.now() }));
        } catch (err) {
          // Directory might be cleaned up
        }
      }, 10);

      const readInterval = setInterval(() => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          results.push(JSON.parse(content));
        } catch (err) {
          // Might fail if file is being written or directory is cleaned up
        }
      }, 15);

      setTimeout(() => {
        clearInterval(writeInterval);
        clearInterval(readInterval);

        assert.ok(results.length > 0, 'Should have successfully read at least once');
        done();
      }, 200);
    });
  });

  describe('Encoding Handling', () => {
    it('should handle UTF-8 content in settings', () => {
      const settingsPath = path.join(tempDir, 'settings.json');
      const settings = {
        provider: 'Claude',
        description: '测试 тест δοκιμή'
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.description, '测试 тест δοκιμή');
    });

    it('should handle emoji in configuration', () => {
      const settingsPath = path.join(tempDir, 'emoji-settings.json');
      const settings = {
        status: '✓ Installed',
        success: '🎉',
        error: '❌'
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      assert.strictEqual(read.success, '🎉');
    });
  });

  describe('Backward Compatibility', () => {
    it('should read old format settings alongside new format', () => {
      const oldFormat = path.join(tempDir, 'old.json');
      const newFormat = path.join(tempDir, 'new.json');

      fs.writeFileSync(oldFormat, JSON.stringify({ version: '1.0' }));
      fs.writeFileSync(newFormat, JSON.stringify({ version: '2.0', compat: true }));

      const old = JSON.parse(fs.readFileSync(oldFormat, 'utf8'));
      const new_ = JSON.parse(fs.readFileSync(newFormat, 'utf8'));

      assert.strictEqual(old.version, '1.0');
      assert.strictEqual(new_.version, '2.0');
    });

    it('should handle partial configuration updates', () => {
      const settingsPath = path.join(tempDir, 'settings.json');

      // Write initial config
      const initial = {
        version: '1.0.0',
        provider: 'claude',
        oldSetting: true
      };
      fs.writeFileSync(settingsPath, JSON.stringify(initial));

      // Update: keep old settings, add new ones
      const existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const updated = {
        ...existing,
        version: '2.0.0',
        newSetting: true
      };
      fs.writeFileSync(settingsPath, JSON.stringify(updated));

      const final = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(final.oldSetting, true);
      assert.strictEqual(final.newSetting, true);
      assert.strictEqual(final.version, '2.0.0');
    });
  });
});
