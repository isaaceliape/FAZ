/**
 * Qwen Code Installation Test
 *
 * Tests that FASE installs correctly for Qwen Code:
 * - Commands are copied to .qwen/commands/
 * - Agents are copied to .qwen/agents/
 * - fase/ directory with shared files
 * - package.json is created
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testQwenInstall() {
  const result = await runInstallTest({
    testName: 'qwen-install',
    runtime: 'qwen',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testQwenInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testQwenInstall };
