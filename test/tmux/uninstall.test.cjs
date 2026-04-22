/**
 * Uninstall Test
 * 
 * Tests that FASE uninstalls correctly:
 * - Install first
 * - Verify installation exists
 * - Run uninstall
 * - Verify cleanup
 */

const { runUninstallTest } = require('../tmux-test-helper.cjs');

async function testUninstall() {
  const result = await runUninstallTest({
    testName: 'uninstall',
    runtime: 'claude',
    timeout: 60000
  });

  return result.success ? 0 : 1;
}

// Run if executed directly
if (require.main === module) {
  testUninstall()
    .then(code => process.exit(code))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testUninstall };
