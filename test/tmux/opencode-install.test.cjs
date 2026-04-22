/**
 * OpenCode Installation Test
 * 
 * Tests that FASE installs correctly for OpenCode:
 * - Commands are copied to .opencode/command/
 * - Agents are copied to .opencode/fase/agents/
 * - fase/ directory with shared files
 * - package.json is created
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testOpenCodeInstall() {
  const result = await runInstallTest({
    testName: 'opencode-install',
    runtime: 'opencode',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testOpenCodeInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testOpenCodeInstall };
