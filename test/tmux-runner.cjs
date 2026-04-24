/**
 * Tmux Test Runner for FASE
 * 
 * Orchestrates running multiple tmux-based tests in parallel
 * and reports results with colored output.
 */

const { runInstallTest, runUninstallTest, checkTmuxAvailable } = require('./tmux-test-helper.cjs');
const path = require('path');
const fs = require('fs');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

/**
 * Test definition
 */
class Test {
  constructor(name, fn, options = {}) {
    this.name = name;
    this.fn = fn;
    this.options = options;
    this.duration = 0;
    this.result = null;
  }
}

/**
 * Test suite runner
 */
class TmuxTestRunner {
  constructor(options = {}) {
    this.tests = [];
    this.results = [];
    this.parallel = options.parallel ?? 3;
    this.timeout = options.timeout ?? 60000;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Add installation test
   */
  addInstallTest(name, runtime, flags = '') {
    this.tests.push(new Test(name, async () => {
      return await runInstallTest({
        testName: name,
        runtime,
        flags,
        timeout: this.timeout
      });
    }));
    return this;
  }

  /**
   * Add uninstall test
   */
  addUninstallTest(name, runtime) {
    this.tests.push(new Test(name, async () => {
      return await runUninstallTest({
        testName: name,
        runtime,
        timeout: this.timeout
      });
    }));
    return this;
  }

  /**
   * Add custom test
   */
  addTest(name, fn) {
    this.tests.push(new Test(name, fn));
    return this;
  }

  /**
   * Run single test
   */
  async runTest(test) {
    const startTime = Date.now();
    try {
      const result = await test.fn();
      test.duration = Date.now() - startTime;
      test.result = result.success ? 'pass' : 'fail';
      return result.success;
    } catch (err) {
      test.duration = Date.now() - startTime;
      test.result = 'fail';
      test.error = err.message;
      return false;
    }
  }

  /**
   * Run tests in batches (parallel execution)
   */
  async runBatch(batch) {
    const promises = batch.map(test => this.runTest(test));
    await Promise.all(promises);
  }

  /**
   * Run all tests
   */
  async run() {
    console.log(`\n${BOLD}${CYAN}╔════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║${RESET}  ${BOLD}FASE Tmux Test Suite${RESET}                              ${CYAN}║${RESET}`);
    console.log(`${BOLD}${CYAN}╚════════════════════════════════════════════════════════╝${RESET}\n`);

    // Check tmux availability
    if (!checkTmuxAvailable()) {
      console.error(`${RED}✗ tmux not found. Please install tmux to run these tests.${RESET}`);
      console.error(`${DIM}  macOS: brew install tmux${RESET}`);
      console.error(`${DIM}  Linux: apt install tmux / yum install tmux${RESET}\n`);
      process.exit(1);
    }

    console.log(`${GREEN}✓${RESET} tmux available`);
    console.log(`${DIM}  Running ${this.tests.length} test(s) with parallelism=${this.parallel}${RESET}\n`);

    // Run tests in batches
    const batches = [];
    for (let i = 0; i < this.tests.length; i += this.parallel) {
      batches.push(this.tests.slice(i, i + this.parallel));
    }

    for (const batch of batches) {
      await this.runBatch(batch);
    }

    // Report results
    this.report();

    // Return success if all tests passed
    return this.tests.every(t => t.result === 'pass');
  }

  /**
   * Print test report
   */
  report() {
    const passed = this.tests.filter(t => t.result === 'pass').length;
    const failed = this.tests.filter(t => t.result === 'fail').length;
    const total = this.tests.length;
    const totalTime = this.tests.reduce((sum, t) => sum + t.duration, 0);

    console.log(`\n${BOLD}Test Results:${RESET}`);
    console.log(`${DIM}─────────────────────────────────────────────────${RESET}\n`);

    for (const test of this.tests) {
      const icon = test.result === 'pass' ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
      const duration = `${DIM}(${test.duration}ms)${RESET}`;
      console.log(`  ${icon} ${test.name} ${duration}`);
      
      if (test.result === 'fail' && test.error) {
        console.log(`     ${RED}${test.error}${RESET}`);
      }
    }

    console.log(`\n${DIM}─────────────────────────────────────────────────${RESET}`);
    console.log(`${BOLD}Summary:${RESET}`);
    console.log(`  Total:  ${total} tests`);
    console.log(`  ${GREEN}Passed: ${passed}${RESET}`);
    console.log(`  ${RED}Failed: ${failed}${RESET}`);
    console.log(`  Time:   ${totalTime}ms\n`);

    if (failed === 0) {
      console.log(`${GREEN}${BOLD}✓ All tests passed!${RESET}\n`);
    } else {
      console.log(`${RED}${BOLD}✗ ${failed} test(s) failed${RESET}\n`);
    }
  }
}

/**
 * Create test runner instance
 */
function createRunner(options = {}) {
  return new TmuxTestRunner(options);
}

/**
 * Run quick smoke tests
 */
async function runSmokeTests() {
  const runner = createRunner({ parallel: 2, timeout: 30000 });
  
  runner
    .addInstallTest('Claude Code Installation', 'claude')
    .addInstallTest('OpenCode Installation', 'opencode');
  
  const success = await runner.run();
  process.exit(success ? 0 : 1);
}

/**
 * Run full test suite
 */
async function runAllTests() {
  const runner = createRunner({ parallel: 3, timeout: 60000 });
  
  runner
    // Individual provider tests
    .addInstallTest('Claude Code Installation', 'claude')
    .addInstallTest('OpenCode Installation', 'opencode')
    .addInstallTest('Gemini Installation', 'gemini')
    .addInstallTest('Codex Installation', 'codex')
    .addInstallTest('GitHub Copilot Installation', 'copilot')
    .addInstallTest('Qwen Code Installation', 'qwen')
    
    // Multi-provider test
    .addInstallTest('All Providers Installation', 'all')
    
    // Uninstall tests
    .addUninstallTest('Claude Code Uninstall', 'claude')
    .addUninstallTest('OpenCode Uninstall', 'opencode');
  
  const success = await runner.run();
  process.exit(success ? 0 : 1);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${BOLD}FASE Tmux Test Runner${RESET}

${CYAN}Usage:${RESET}
  node test/tmux-runner.cjs [options]

${CYAN}Options:${RESET}
  --smoke, -s    Run quick smoke tests (2 tests)
  --all, -a      Run full test suite (8 tests)
  --help, -h     Show this help

${CYAN}Examples:${RESET}
  node test/tmux-runner.cjs --smoke
  node test/tmux-runner.cjs --all
`);
    process.exit(0);
  }
  
  if (args.includes('--smoke') || args.includes('-s')) {
    runSmokeTests();
  } else if (args.includes('--all') || args.includes('-a')) {
    runAllTests();
  } else {
    // Default: run smoke tests
    runSmokeTests();
  }
}

module.exports = {
  TmuxTestRunner,
  createRunner,
  runSmokeTests,
  runAllTests
};
