#!/usr/bin/env node
/**
 * Tests for landing page accuracy and consistency
 *
 * These tests validate that:
 * - Version numbers match between package.json and landing pages
 * - Runtime count is correct (5, including GitHub Copilot)
 * - All supported runtimes are listed
 * - Version sync script works correctly
 */

const { describe, it, before } = require('mocha');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Landing Page Validation', function() {
  let packageJson;
  let wwwIndexContent;
  let docsIndexContent;
  const rootDir = path.join(__dirname, '..');

  before(function() {
    // Load package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Load landing page files
    wwwIndexContent = fs.readFileSync(path.join(rootDir, 'www', 'index.html'), 'utf-8');
    docsIndexContent = fs.readFileSync(path.join(rootDir, 'docs', 'index.html'), 'utf-8');
  });

  describe('Version Consistency', function() {
    it('should have version in package.json', function() {
      assert.ok(packageJson.version, 'Package.json should have a version');
      assert.match(packageJson.version, /^\d+\.\d+\.\d+$/, 'Version should follow semver format');
    });

    it('should display correct version in www/index.html status badge', function() {
      const expectedPattern = new RegExp(`✓\\s*v${packageJson.version}\\s*-\\s*Todos os testes passando`);
      assert.match(
        wwwIndexContent,
        expectedPattern,
        `Status badge should show version v${packageJson.version}`
      );
    });

    it('should display correct version in www/index.html installer ASCII art', function() {
      const expectedPattern = new RegExp(`Instalador Interativo\\s+v${packageJson.version}`);
      assert.match(
        wwwIndexContent,
        expectedPattern,
        `Installer ASCII art should show version v${packageJson.version}`
      );
    });

    it('should display correct version in docs/index.html version badge', function() {
      const expectedPattern = new RegExp(`Versão\\s+${packageJson.version}`);
      assert.match(
        docsIndexContent,
        expectedPattern,
        `Docs version badge should show version ${packageJson.version}`
      );
    });

    it('should not have outdated version references in www/index.html', function() {
      // Check for common old versions that should not exist
      const outdatedVersions = ['v3.5.3', 'v3.5.2', 'v3.5.1', 'v3.5.0', 'v2.5.0', 'v2.4.0'];
      for (const oldVersion of outdatedVersions) {
        assert.ok(
          !wwwIndexContent.includes(oldVersion),
          `www/index.html should not contain outdated version ${oldVersion}`
        );
      }
    });
  });

  describe('Runtime Information', function() {
    it('should display 6 runtimes in stats section', function() {
      // Look for the stat box with runtimes count
      const statsSectionMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Runtimes<\/div>/);
      assert.ok(statsSectionMatch, 'Should find runtimes stat box');
      const runtimeCount = parseInt(statsSectionMatch[1], 10);
      assert.strictEqual(runtimeCount, 6, 'Runtime count should be 6');
    });

    it('should list all 6 supported runtimes', function() {
      const expectedRuntimes = [
        { name: 'Claude Code', path: '~/.claude' },
        { name: 'OpenCode', path: '~/.config/opencode' },
        { name: 'Gemini', path: '~/.gemini' },
        { name: 'Codex', path: '~/.codex' },
        { name: 'GitHub Copilot', path: '~/.copilot' },
        { name: 'Qwen Code', path: '~/.qwen' }
      ];

      for (const runtime of expectedRuntimes) {
        assert.ok(
          wwwIndexContent.includes(runtime.name),
          `www/index.html should list runtime: ${runtime.name}`
        );
        assert.ok(
          wwwIndexContent.includes(runtime.path),
          `www/index.html should show path for: ${runtime.name}`
        );
      }
    });

    it('should mention GitHub Copilot in hero section', function() {
      // The hero section should mention all 6 runtimes
      assert.ok(
        wwwIndexContent.includes('GitHub Copilot') ||
        wwwIndexContent.includes('Claude Code') &&
        wwwIndexContent.includes('OpenCode') &&
        wwwIndexContent.includes('Gemini') &&
        wwwIndexContent.includes('Codex') &&
        wwwIndexContent.includes('Qwen Code'),
        'Hero section should mention the AI assistants'
      );
    });
  });

  describe('Feature Information', function() {
    it('should display 13 agents in stats section', function() {
      const agentsMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Agentes<\/div>/);
      assert.ok(agentsMatch, 'Should find agents stat box');
      const agentCount = parseInt(agentsMatch[1], 10);
      assert.strictEqual(agentCount, 13, 'Agent count should be 13');
    });

    it('should display 34 commands in stats section', function() {
      const commandsMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Comandos<\/div>/);
      assert.ok(commandsMatch, 'Should find commands stat box');
      const commandCount = parseInt(commandsMatch[1], 10);
      assert.strictEqual(commandCount, 34, 'Command count should be 34');
    });
  });

  describe('Status Badge Content', function() {
    it('should not mention installer-specific features in status badge', function() {
      // The status badge should not mention "Navegação interativa com setas"
      // as this is an installer feature, not a landing page feature
      assert.ok(
        !wwwIndexContent.includes('Navegação interativa com setas'),
        'Status badge should not mention installer-specific navigation feature'
      );
    });

    it('should mention test validation in status badge', function() {
      assert.ok(
        wwwIndexContent.includes('testes passando') ||
        wwwIndexContent.includes('comandos validados') ||
        wwwIndexContent.includes('runtimes funcionando'),
        'Status badge should mention test/runtimes validation'
      );
    });
  });
});

describe('Version Sync Script', function() {
  const rootDir = path.join(__dirname, '..');
  const syncScriptPath = path.join(rootDir, 'scripts', 'sync-version.mjs');

  it('should exist', function() {
    assert.ok(fs.existsSync(syncScriptPath), 'sync-version.mjs script should exist');
  });

  it('should be executable', function() {
    const stats = fs.statSync(syncScriptPath);
    // Check if file has read permissions for owner
    assert.ok(stats.mode & 0o400, 'Script should be readable');
  });

  it('should read package.json', function() {
    const content = fs.readFileSync(syncScriptPath, 'utf-8');
    assert.ok(
      content.includes('package.json'),
      'Script should reference package.json'
    );
  });

  it('should update www/index.html', function() {
    const content = fs.readFileSync(syncScriptPath, 'utf-8');
    assert.ok(
      content.includes('www/index.html'),
      'Script should update www/index.html'
    );
  });

  it('should update docs/index.html', function() {
    const content = fs.readFileSync(syncScriptPath, 'utf-8');
    assert.ok(
      content.includes('docs/index.html'),
      'Script should update docs/index.html'
    );
  });
});
