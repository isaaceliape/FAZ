#!/usr/bin/env node
/**
 * E2E Tests for Landing Page - Package Consistency
 *
 * These tests validate that the landing page (www/index.html) displays
 * accurate information that matches the actual project state:
 * - Version from package.json
 * - Command count from .github/commands/ directory
 * - Agent count from .github/agents/ directory
 * - Runtime count from source code
 *
 * Run with: npm run test:e2e:landing
 */

const { describe, it, before } = require('mocha');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('E2E: Landing Page Package Consistency', function() {
  this.timeout(5000);

  let packageJson;
  let wwwIndexContent;
  const rootDir = path.join(__dirname, '..', '..');

  before(function() {
    // Load package.json
    const packageJsonPath = path.join(rootDir, 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Load landing page
    wwwIndexContent = fs.readFileSync(path.join(rootDir, 'www', 'index.html'), 'utf-8');
  });

  describe('Version Consistency E2E', function() {
    it('E2E: Landing page version must match package.json exactly', function() {
      const expectedVersion = packageJson.version;

      // Extract version from status badge
      const statusBadgeMatch = wwwIndexContent.match(/✓\s*v([\d.]+)\s*-\s*Todos os testes passando/);
      assert.ok(statusBadgeMatch, 'Status badge should contain version');

      const displayedVersion = statusBadgeMatch[1];
      assert.strictEqual(
        displayedVersion,
        expectedVersion,
        `Landing page version (${displayedVersion}) must match package.json version (${expectedVersion})`
      );
    });

    it('E2E: Installer ASCII version must match package.json', function() {
      const expectedVersion = packageJson.version;

      const installerMatch = wwwIndexContent.match(/Instalador Interativo\s+v([\d.]+)/);
      assert.ok(installerMatch, 'Installer ASCII should contain version');

      const installerVersion = installerMatch[1];
      assert.strictEqual(
        installerVersion,
        expectedVersion,
        `Installer version (${installerVersion}) must match package.json version (${expectedVersion})`
      );
    });
  });

  describe('Command Count E2E', function() {
    it('E2E: Command count on landing page must match actual .github/commands/ directory', function() {
      // Get actual command count from filesystem
      const comandosDir = path.join(rootDir, '.github', 'commands');
      const actualCommandCount = fs.readdirSync(comandosDir)
        .filter(f => !f.startsWith('.') && f.endsWith('.md'))
        .length;

      // Extract displayed command count from landing page
      const commandCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Comandos<\/div>/);
      assert.ok(commandCountMatch, 'Landing page should display command count');

      const displayedCommandCount = parseInt(commandCountMatch[1], 10);

      assert.strictEqual(
        displayedCommandCount,
        actualCommandCount,
        `Landing page shows ${displayedCommandCount} commands but .github/commands/ directory has ${actualCommandCount} files`
      );
    });

    it('E2E: Command count in status badge must match .github/commands/ directory', function() {
      const comandosDir = path.join(rootDir, '.github', 'commands');
      const actualCommandCount = fs.readdirSync(comandosDir)
        .filter(f => !f.startsWith('.') && f.endsWith('.md'))
        .length;

      // Status badge shows "34/34 comandos validados"
      const statusBadgeMatch = wwwIndexContent.match(/(\d+)\/(\d+)\s+comandos\s+validados/);
      assert.ok(statusBadgeMatch, 'Status badge should show command validation count');

      const validatedCount = parseInt(statusBadgeMatch[1], 10);
      const totalCount = parseInt(statusBadgeMatch[2], 10);

      assert.strictEqual(
        totalCount,
        actualCommandCount,
        `Status badge shows ${totalCount} total commands but .github/commands/ directory has ${actualCommandCount} files`
      );

      assert.strictEqual(
        validatedCount,
        totalCount,
        `Status badge should show all commands validated (${validatedCount}/${totalCount})`
      );
    });
  });

  describe('Agent Count E2E', function() {
    it('E2E: Agent count on landing page must match actual .github/agents/ directory', function() {
      // Get actual agent count from filesystem
      const agentesDir = path.join(rootDir, '.github', 'agents');
      const actualAgentCount = fs.readdirSync(agentesDir)
        .filter(f => !f.startsWith('.') && f.endsWith('.md'))
        .length;

      // Extract displayed agent count from landing page
      const agentCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Agentes<\/div>/);
      assert.ok(agentCountMatch, 'Landing page should display agent count');

      const displayedAgentCount = parseInt(agentCountMatch[1], 10);

      assert.strictEqual(
        displayedAgentCount,
        actualAgentCount,
        `Landing page shows ${displayedAgentCount} agents but .github/agents/ directory has ${actualAgentCount} files`
      );
    });
  });

  describe('Runtime Count E2E', function() {
    it('E2E: Runtime count must match actual supported providers', function() {
      // Get actual runtime count from source code
      const installSourcePath = path.join(rootDir, 'src', 'install', 'providers.ts');

      // If TypeScript source exists, count providers there
      let actualRuntimeCount = 6; // Default based on known providers

      if (fs.existsSync(installSourcePath)) {
        const installSource = fs.readFileSync(installSourcePath, 'utf-8');
        // Count PROVIDERS entries
        const providerMatches = installSource.match(/PROVIDERS\s*=\s*\[([\s\S]*?)\]/);
        if (providerMatches) {
          const providerBlock = providerMatches[1];
          actualRuntimeCount = (providerBlock.match(/name:/g) || []).length;
        }
      } else {
        // Fallback: count from verificar-instalacao.js compiled output
        const verificarPath = path.join(rootDir, 'dist', 'verificar-instalacao.js');
        if (fs.existsSync(verificarPath)) {
          const verificarContent = fs.readFileSync(verificarPath, 'utf-8');
          // Look for runtime checks
          const runtimeMatches = [
            'claude', 'opencode', 'gemini', 'codex', 'github-copilot'
          ].filter(runtime => verificarContent.toLowerCase().includes(runtime));
          actualRuntimeCount = runtimeMatches.length;
        }
      }

      // Extract displayed runtime count from landing page
      const runtimeCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Runtimes<\/div>/);
      assert.ok(runtimeCountMatch, 'Landing page should display runtime count');

      const displayedRuntimeCount = parseInt(runtimeCountMatch[1], 10);

      assert.strictEqual(
        displayedRuntimeCount,
        actualRuntimeCount,
        `Landing page shows ${displayedRuntimeCount} runtimes but source code supports ${actualRuntimeCount}`
      );
    });

    it('E2E: All supported runtimes must be listed on landing page', function() {
      // Get expected runtimes from source
      const expectedRuntimes = [
        { name: 'Claude Code', key: 'claude' },
        { name: 'OpenCode', key: 'opencode' },
        { name: 'Gemini', key: 'gemini' },
        { name: 'Codex', key: 'codex' },
        { name: 'GitHub Copilot', key: 'github-copilot' },
        { name: 'Qwen Code', key: 'qwen' }
      ];

      const runtimesSectionMatch = wwwIndexContent.match(/<div id="runtimes"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Workflow Section -->/);
      assert.ok(runtimesSectionMatch, 'Should find runtimes section');

      const runtimesSection = runtimesSectionMatch[0];

      for (const runtime of expectedRuntimes) {
        assert.ok(
          runtimesSection.includes(runtime.name) ||
          runtimesSection.toLowerCase().includes(runtime.key),
          `Runtimes section should list ${runtime.name}`
        );
      }
    });
  });

  describe('Complete Landing Page Validation E2E', function() {
    it('E2E: All stats must be consistent with actual project state', function() {
      // Collect all actual values
      const comandosDir = path.join(rootDir, 'comandos');
      const actualCommandCount = fs.readdirSync(comandosDir)
        .filter(f => !f.startsWith('.') && f.endsWith('.md'))
        .length;

      const agentesDir = path.join(rootDir, 'agentes');
      const actualAgentCount = fs.readdirSync(agentesDir)
        .filter(f => !f.startsWith('.') && f.endsWith('.md'))
        .length;

      const expectedRuntimeCount = 6;

      // Extract all displayed values
      const agentCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Agentes<\/div>/);
      const commandCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Comandos<\/div>/);
      const runtimeCountMatch = wwwIndexContent.match(/<div class="stat-number">(\d+)<\/div>\s*<div class="stat-label">Runtimes<\/div>/);

      const displayedAgentCount = parseInt(agentCountMatch[1], 10);
      const displayedCommandCount = parseInt(commandCountMatch[1], 10);
      const displayedRuntimeCount = parseInt(runtimeCountMatch[1], 10);

      // Build comparison report
      const report = {
        agents: {
          expected: actualAgentCount,
          actual: displayedAgentCount,
          match: actualAgentCount === displayedAgentCount
        },
        commands: {
          expected: actualCommandCount,
          actual: displayedCommandCount,
          match: actualCommandCount === displayedCommandCount
        },
        runtimes: {
          expected: expectedRuntimeCount,
          actual: displayedRuntimeCount,
          match: expectedRuntimeCount === displayedRuntimeCount
        }
      };

      // Assert all match
      const allMatch = report.agents.match && report.commands.match && report.runtimes.match;

      if (!allMatch) {
        console.log('\n❌ Landing Page Consistency Report:');
        console.log(JSON.stringify(report, null, 2));
      }

      assert.ok(allMatch, 'All landing page stats must match actual project state');
    });
  });
});
