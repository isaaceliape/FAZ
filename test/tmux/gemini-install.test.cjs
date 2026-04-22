/**
 * Gemini Installation Test
 * 
 * Tests that FASE installs correctly for Gemini:
 * - Commands are copied to .gemini/commands/
 * - Agents are copied to .gemini/fase/agents/
 * - fase/ directory with shared files
 * - package.json is created
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testGeminiInstall() {
  const result = await runInstallTest({
    testName: 'gemini-install',
    runtime: 'gemini',
    timeout: 45000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testGeminiInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testGeminiInstall };
