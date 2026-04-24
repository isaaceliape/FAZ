/**
 * All Providers Installation Test
 * 
 * Tests that FASE installs correctly for all providers at once:
 * - Claude Code
 * - OpenCode
 * - Gemini
 * - Codex
 * - GitHub Copilot
 * - Qwen Code
 */

const { runInstallTest } = require('../tmux-test-helper.cjs');

async function testAllProvidersInstall() {
  const result = await runInstallTest({
    testName: 'all-providers-install',
    runtime: 'all',
    timeout: 90000  // Longer timeout for multiple installs
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testAllProvidersInstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testAllProvidersInstall };
