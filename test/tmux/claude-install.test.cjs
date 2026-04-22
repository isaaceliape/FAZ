/**
 * Claude Code Installation Test
 * 
 * Tests that FASE installs correctly for Claude Code:
 * - Commands are copied to .claude/command/fase/
 * - Agents are copied to .claude/agents/
 * - fase/ directory with shared files
 * - package.json is created
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testClaudeInstall() {
  const result = await runInstallTest({
    testName: 'claude-install',
    runtime: 'claude',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testClaudeInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testClaudeInstall };
