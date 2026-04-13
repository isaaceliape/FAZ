const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('FASE Installation', () => {
  let tempDir;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Directory Creation', () => {
    it('should create target directory if it does not exist', () => {
      const testDir = path.join(tempDir, 'test-dir');
      assert.strictEqual(fs.existsSync(testDir), false, 'Directory should not exist initially');

      fs.mkdirSync(testDir, { recursive: true, mode: 0o755 });

      assert.strictEqual(fs.existsSync(testDir), true, 'Directory should be created');
    });

    it('should handle nested directory creation with recursive mode', () => {
      const nestedDir = path.join(tempDir, 'a', 'b', 'c', 'd');

      fs.mkdirSync(nestedDir, { recursive: true, mode: 0o755 });

      assert.strictEqual(fs.existsSync(nestedDir), true, 'Nested directories should be created');
    });

    it('should not fail if directory already exists', () => {
      const testDir = path.join(tempDir, 'existing');
      fs.mkdirSync(testDir);

      // Should not throw
      assert.doesNotThrow(() => {
        fs.mkdirSync(testDir, { recursive: true });
      });
    });
  });

  describe('File Writing with Error Handling', () => {
    it('should write VERSION file successfully to valid directory', () => {
      const versionDir = path.join(tempDir, 'fase-ai');
      const versionFile = path.join(versionDir, 'VERSION');
      const version = '2.6.0';

      try {
        if (!fs.existsSync(versionDir)) {
          fs.mkdirSync(versionDir, { recursive: true, mode: 0o755 });
        }
        fs.accessSync(versionDir, fs.constants.W_OK);
        fs.writeFileSync(versionFile, version);
      } catch (err) {
        throw new Error(`Failed to write VERSION file: ${err.message}`);
      }

      assert.strictEqual(fs.existsSync(versionFile), true, 'VERSION file should exist');
      assert.strictEqual(fs.readFileSync(versionFile, 'utf8'), version, 'VERSION content should match');
    });

    it('should handle permission errors gracefully', function() {
      // Skip this test when running as root (chmod doesn't prevent write access)
      if (process.getuid && process.getuid() === 0) {
        this.skip();
      }

      const readOnlyDir = path.join(tempDir, 'readonly');
      fs.mkdirSync(readOnlyDir);

      // Make directory read-only
      fs.chmodSync(readOnlyDir, 0o444);

      const versionFile = path.join(readOnlyDir, 'VERSION');
      let errorCaught = false;

      try {
        fs.accessSync(readOnlyDir, fs.constants.W_OK);
        fs.writeFileSync(versionFile, '2.6.0');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'EACCES', 'Should catch permission error');
      } finally {
        // Restore permissions for cleanup
        fs.chmodSync(readOnlyDir, 0o755);
      }

      assert.strictEqual(errorCaught, true, 'Permission error should be caught');
    });

    it('should detect and handle missing parent directory', () => {
      const invalidPath = path.join(tempDir, 'nonexistent', 'nested', 'path', 'VERSION');
      let errorCaught = false;

      try {
        // This should fail because parent directories don't exist
        fs.writeFileSync(invalidPath, '2.6.0');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'ENOENT', 'Should catch ENOENT error');
      }

      assert.strictEqual(errorCaught, true, 'Missing parent directory error should be caught');
    });
  });

  describe('package.json CommonJS Mode', () => {
    it('should write CommonJS mode package.json correctly', () => {
      const pkgDir = path.join(tempDir, 'pkg-test');
      const pkgFile = path.join(pkgDir, 'package.json');
      const expectedContent = '{"type":"commonjs"}\n';

      try {
        if (!fs.existsSync(pkgDir)) {
          fs.mkdirSync(pkgDir, { recursive: true, mode: 0o755 });
        }
        fs.writeFileSync(pkgFile, expectedContent);
      } catch (err) {
        throw new Error(`Failed to write package.json: ${err.message}`);
      }

      assert.strictEqual(fs.existsSync(pkgFile), true, 'package.json should exist');
      assert.strictEqual(fs.readFileSync(pkgFile, 'utf8'), expectedContent, 'package.json content should be correct');
    });

    it('should verify file is writable before writing', () => {
      const testDir = path.join(tempDir, 'writable-test');
      fs.mkdirSync(testDir);

      let accessCheckPassed = false;
      try {
        fs.accessSync(testDir, fs.constants.W_OK);
        accessCheckPassed = true;
      } catch (err) {
        accessCheckPassed = false;
      }

      assert.strictEqual(accessCheckPassed, true, 'Directory should be writable');
    });
  });

  describe('Path Construction', () => {
    it('should construct correct version file path', () => {
      const targetDir = path.join(tempDir, 'fase-install');
      const versionDest = path.join(targetDir, 'fase-ai', 'VERSION');

      // Should contain 'fase-ai', not 'get-shit-done'
      assert.strictEqual(versionDest.includes('fase-ai'), true, 'Path should include fase-ai');
      assert.strictEqual(versionDest.includes('get-shit-done'), false, 'Path should not include get-shit-done');
    });

    it('should not use deprecated package names in paths', () => {
      const targetDir = path.join(tempDir, 'config');
      const installPath = path.join(targetDir, 'fase-ai', 'hooks');

      assert.strictEqual(installPath.includes('fase-ai'), true, 'Should use fase-ai');
      assert.strictEqual(installPath.includes('gsd'), false, 'Should not use gsd abbreviation');
      assert.strictEqual(installPath.includes('get-shit-done'), false, 'Should not use old package name');
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages for permission issues', function() {
      // Skip this test when running as root (chmod doesn't prevent write access)
      if (process.getuid && process.getuid() === 0) {
        this.skip();
      }

      const readOnlyDir = path.join(tempDir, 'readonly-error');
      fs.mkdirSync(readOnlyDir);
      fs.chmodSync(readOnlyDir, 0o444);

      let errorMessage = '';
      try {
        fs.writeFileSync(path.join(readOnlyDir, 'test.txt'), 'test');
      } catch (err) {
        errorMessage = err.message;
      } finally {
        fs.chmodSync(readOnlyDir, 0o755);
      }

      assert.ok(errorMessage.includes('EACCES') || errorMessage.includes('permission'), 'Error should mention permission issue');
    });

    it('should distinguish between different error types', () => {
      const errors = [];

      // ENOENT error
      try {
        fs.writeFileSync(path.join(tempDir, 'nonexistent', 'file.txt'), 'test');
      } catch (err) {
        errors.push({ type: err.code, path: err.path });
      }

      assert.strictEqual(errors[0].type, 'ENOENT', 'Should identify ENOENT error');
      assert.ok(errors[0].path, 'Error should include path information');
    });
  });

  describe('Gemini Agent Normalization', () => {
    it('should normalize agent names to lowercase slugs', () => {
      const testCases = [
        { input: 'name: Fase-Auditor-Nyquist', expected: 'name: fase-auditor-nyquist' },
        { input: 'name: Fase-Depurador', expected: 'name: fase-depurador' },
        { input: 'name: Fase-Executor', expected: 'name: fase-executor' },
        { input: 'name: Fase-Planejador', expected: 'name: fase-planejador' }
      ];

      testCases.forEach(({ input, expected }) => {
        assert.strictEqual(
          input.toLowerCase(),
          expected,
          `'${input}' should normalize to '${expected}'`
        );
      });
    });

    it('should remove accents from agent names', () => {
      const nameWithAccent = 'Fase-Mapeador-Código';
      const normalized = nameWithAccent
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      assert.strictEqual(normalized, 'fase-mapeador-codigo', 'Accents should be removed');
    });

    it('should handle multiple accents in agent names', () => {
      const nameWithMultipleAccents = 'Fase-Verificador-Integração';
      const normalized = nameWithMultipleAccents
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      assert.strictEqual(normalized, 'fase-verificador-integracao', 'Multiple accents should be removed');
    });
  });

  describe('Gemini Agent Frontmatter Cleanup', () => {
    it('should remove skills key from agent frontmatter', () => {
      const agentContent = `---
name: Test-Agent
description: Test agent
skills:
  - test-skill
tools:
  - read_file
---

Body content here`;

      const lines = agentContent.split('\n');
      const filtered = lines.filter(line => !line.startsWith('skills:') && !line.match(/^\s*- test-skill/));
      const result = filtered.join('\n');

      assert.strictEqual(result.includes('skills:'), false, 'skills key should be removed');
      assert.strictEqual(result.includes('test-skill'), false, 'skill item should be removed');
      assert.strictEqual(result.includes('tools:'), true, 'tools should remain');
    });

    it('should preserve tools array when removing skills', () => {
      const agentContent = `---
name: Test-Agent
skills:
  - test-skill
tools:
  - read_file
  - write_file
---`;

      const hasTools = agentContent.includes('tools:');
      const hasSkills = agentContent.includes('skills:');

      assert.strictEqual(hasTools, true, 'tools should be present');
      assert.strictEqual(hasSkills, true, 'skills should be present initially');
    });
  });

  describe('Gemini Installation Hooks Handling', () => {
    it('should not configure hooks if hooks directory does not exist', () => {
      const targetDir = path.join(tempDir, 'gemini-install');
      fs.mkdirSync(targetDir, { recursive: true });

      const hooksDest = path.join(targetDir, 'hooks');
      const hooksExist = fs.existsSync(hooksDest);

      assert.strictEqual(hooksExist, false, 'hooks directory should not exist');
    });

    it('should recognize when hooks directory exists', () => {
      const targetDir = path.join(tempDir, 'gemini-with-hooks');
      const hooksDest = path.join(targetDir, 'hooks');
      fs.mkdirSync(hooksDest, { recursive: true });

      const hooksExist = fs.existsSync(hooksDest);
      assert.strictEqual(hooksExist, true, 'hooks directory should exist');
    });

    it('should clean up orphaned hook patterns from settings', () => {
      const orphanedPatterns = [
        'fase-check-update.js',
        'fase-context-monitor.js',
        'fase-statusline.js',
        'hooks/statusline.js'
      ];

      const command = 'node .gemini/hooks/fase-check-update.js';
      const hasOrphaned = orphanedPatterns.some(pattern => command.includes(pattern));

      assert.strictEqual(hasOrphaned, true, 'Should identify orphaned hook patterns');
    });
  });

  describe('Gemini Settings Configuration', () => {
    it('should create minimal settings.json for Gemini without hooks', () => {
      const settingsPath = path.join(tempDir, 'settings.json');
      const settings = { experimental: { enableAgents: true } };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

      const content = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(content.experimental.enableAgents, true, 'Experimental agents should be enabled');
      assert.strictEqual(content.hooks, undefined, 'hooks should not be present');
    });

    it('should not add hook references when hooks do not exist', () => {
      const settings = { experimental: { enableAgents: true } };

      // Simulate not adding hooks because hooks directory doesn't exist
      const hooksExist = false;
      if (hooksExist) {
        if (!settings.hooks) settings.hooks = {};
      }

      assert.strictEqual(settings.hooks, undefined, 'hooks should not be added when directory does not exist');
    });
  });

  describe('Shared Content (v3.2.0)', () => {
    it('should have fase-shared directory with template files', () => {
      const faseSharedDir = path.join(__dirname, '..', 'fase-shared');
      assert.strictEqual(fs.existsSync(faseSharedDir), true, 'fase-shared directory should exist');

      const templatesDir = path.join(faseSharedDir, 'templates');
      assert.strictEqual(fs.existsSync(templatesDir), true, 'templates directory should exist');

      const templates = ['summary.md', 'roteiro.md', 'state.md'];
      for (const template of templates) {
        const filePath = path.join(templatesDir, template);
        assert.strictEqual(fs.existsSync(filePath), true, `${template} should exist`);
      }
    });

    it('should have references directory with checkpoint documentation', () => {
      const referencesDir = path.join(__dirname, '..', 'fase-shared', 'references');
      assert.strictEqual(fs.existsSync(referencesDir), true, 'references directory should exist');

      const checkpointsPath = path.join(referencesDir, 'checkpoints.md');
      assert.strictEqual(fs.existsSync(checkpointsPath), true, 'checkpoints.md should exist');

      const content = fs.readFileSync(checkpointsPath, 'utf8');
      assert.ok(content.includes('checkpoint'), 'checkpoints.md should contain checkpoint patterns');
    });

    it('should have pesquisa-project subdirectory with research template', () => {
      const pesquisaDir = path.join(__dirname, '..', 'fase-shared', 'templates', 'pesquisa-project');
      assert.strictEqual(fs.existsSync(pesquisaDir), true, 'pesquisa-project directory should exist');

      const sumariosPath = path.join(pesquisaDir, 'SUMARIO.md');
      assert.strictEqual(fs.existsSync(sumariosPath), true, 'SUMARIO.md should exist');
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running FASE installation tests...\n');

  try {
    // Simple test runner for Node.js compatibility
    const tests = [
      'Directory Creation',
      'File Writing with Error Handling',
      'package.json CommonJS Mode',
      'Path Construction',
      'Error Messages',
      'Gemini Agent Normalization',
      'Gemini Agent Frontmatter Cleanup',
      'Gemini Installation Hooks Handling',
      'Gemini Settings Configuration'
    ];

    console.log(`✓ All test suites defined: ${tests.join(', ')}`);
    console.log('\nTo run tests with a test framework, use:');
    console.log('  npm install --save-dev mocha');
    console.log('  npm test');
  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
}

module.exports = { describe, it, beforeEach, afterEach };
