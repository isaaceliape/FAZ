/**
 * Codex Installation Test
 * 
 * Tests that FASE installs correctly for Codex:
 * - Skills are copied to .codex/skills/
 * - Agents are copied to .codex/fase/agents/
 * - fase/ directory with shared files
 * - TOML config files for agents
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testCodexInstall() {
  const result = await runInstallTest({
    testName: 'codex-install',
    runtime: 'codex',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testCodexInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testCodexInstall };
