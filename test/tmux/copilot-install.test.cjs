/**
 * GitHub Copilot Installation Test
 *
 * Tests that FASE installs correctly for GitHub Copilot:
 * - Commands are copied to .copilot/commands/
 * - Agents are copied to .copilot/agents/
 * - fase/ directory with shared files
 * - package.json is created
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testCopilotInstall() {
  const result = await runInstallTest({
    testName: 'copilot-install',
    runtime: 'copilot',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testCopilotInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testCopilotInstall };
