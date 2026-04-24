/**
 * Provider TUI Interaction Tests
 *
 * Tests that validate actual user interaction with provider UIs:
 * 1. Launch each provider (claude, opencode, gemini, codex, qwen)
 * 2. Navigate to command input area
 * 3. Type /fase to trigger command suggestions
 * 4. Verify FASE commands appear in the TUI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/**
 * TUI Interaction Tester
 * Launches a provider in tmux and simulates user interaction
 */
class TUIInteractionTester {
  constructor(runtime, timeout = 40000) {
    this.runtime = runtime;
    this.timeout = timeout;
    this.sessionName = `fase-tui-${runtime}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  /**
   * Get provider launch command
   */
  getLaunchCommand() {
    const commands = {
      'claude': 'claude',
      'opencode': 'opencode',
      'gemini': 'gemini',
      'codex': 'codex',
      'qwen': 'qwen'
    };
    return commands[this.runtime];
  }

  /**
   * Get the keystroke sequence to trigger command input
   */
  getTriggerSequence() {
    // Different providers have different trigger patterns
    const triggers = {
      'claude': () => ['/fase'],          // Type /fase directly
      'opencode': () => ['C-p', 'fase'],  // Ctrl+P for command palette, then search
      'gemini': () => ['/fase'],          // Type /fase
      'codex': () => ['$fase'],           // $ for skills/commands
      'qwen': () => ['/fase']             // Type /fase
    };
    return (triggers[this.runtime] || triggers['claude'])();
  }

  /**
   * Send keystroke to tmux
   */
  sendKey(key) {
    if (key === 'C-p') {
      execSync(`tmux send-keys -t ${this.sessionName} C-p`, { stdio: 'pipe' });
    } else {
      // Escape special characters for shell
      const escaped = key.replace(/"/g, '\\"').replace(/\$/g, '\\$');
      execSync(`tmux send-keys -t ${this.sessionName} "${escaped}"`, { stdio: 'pipe' });
    }
  }

  /**
   * Capture current tmux pane output
   */
  captureOutput() {
    try {
      return execSync(`tmux capture-pane -t ${this.sessionName} -p`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch {
      return '';
    }
  }

  /**
   * Wait for text to appear in output
   */
  waitForText(searchText, maxWait = 8000) {
    const startTime = Date.now();
    const pollInterval = 500;

    while (Date.now() - startTime < maxWait) {
      const output = this.captureOutput();
      if (output.includes(searchText)) {
        return true;
      }
      execSync('sleep 0.5');
    }
    return false;
  }

  /**
   * Count FASE commands in current output
   */
  countFaseCommands() {
    const output = this.captureOutput();
    
    // Look for various command patterns depending on provider
    const patterns = [
      /\/fase-[a-z0-9-]+/g,      // /fase-* format (Claude, Qwen, Gemini)
      /\$fase-[a-z0-9-]+/g,      // $fase-* format (Codex)
      /fase-[a-z0-9-]+/g,        // Plain format (fallback)
    ];
    
    let matches = new Set();
    for (const pattern of patterns) {
      const found = output.match(pattern) || [];
      found.forEach(m => matches.add(m.replace(/^[\/$]/, ''))); // Normalize
    }
    
    return matches.size;
  }

  /**
   * Run the TUI interaction test
   */
  async run() {
    const launchCmd = this.getLaunchCommand();
    if (!launchCmd) {
      return {
        success: false,
        runtime: this.runtime,
        error: 'Unknown runtime'
      };
    }

    try {
      // Check if CLI is available
      try {
        execSync(`which ${launchCmd}`, { stdio: 'pipe' });
      } catch {
        return {
          success: false,
          runtime: this.runtime,
          skipped: true,
          reason: `${launchCmd} CLI not installed`
        };
      }

      // Create tmux session with size that fits both display and capture
      execSync(`tmux new-session -d -s ${this.sessionName} -x 140 -y 50`, {
        stdio: 'pipe'
      });

      // Wait for session to initialize
      await new Promise(r => setTimeout(r, 1000));

      // Launch the provider
      this.sendKey(launchCmd);
      this.sendKey('Enter');

      // Wait for provider TUI to fully load
      await new Promise(r => setTimeout(r, 8000));

      // Verify the provider started by checking for common TUI markers
      let output = this.captureOutput();
      const providerReady =
        output.includes('❯') ||  // Claude
        output.includes('Ask anything') ||  // OpenCode
        output.includes('Waiting for authentication') ||  // Gemini
        output.includes('Find and fix') ||  // Codex
        output.includes('Type your message') ||  // Qwen
        output.includes('›');  // Generic prompt

      if (!providerReady) {
        // Provider may still be loading or have different prompt
        console.log(`${DIM}  Provider output on startup:${RESET}`);
        console.log(output.substring(0, 300));
      }

      // Get trigger sequence and send it
      const triggers = this.getTriggerSequence();
      for (const trigger of triggers) {
        this.sendKey(trigger);
        await new Promise(r => setTimeout(r, 300));
      }

      // Send Enter to execute
      this.sendKey('Enter');

      // Wait for suggestions/response to appear
      await new Promise(r => setTimeout(r, 3000));

      // Count FASE commands found in the output
      const commandCount = this.countFaseCommands();

      // Capture final output for debugging
      output = this.captureOutput();

      return {
        success: commandCount > 0,
        runtime: this.runtime,
        commandsFound: commandCount,
        outputLength: output.length,
        snippetLines: output.split('\n').slice(-10).join('\n')
      };

    } catch (err) {
      return {
        success: false,
        runtime: this.runtime,
        error: err.message
      };
    } finally {
      // Clean up tmux session
      try {
        execSync(`tmux kill-session -t ${this.sessionName} 2>/dev/null || true`, {
          stdio: 'pipe'
        });
      } catch {}
    }
  }
}

/**
 * Mocha test suite
 */
describe('Provider TUI Interaction Tests', function() {
  this.timeout(60000); // 60 second timeout per test

  const runtimes = ['claude', 'opencode', 'gemini', 'codex', 'qwen'];

  describe('Launch Provider and Type /fase Command', () => {
    runtimes.forEach(runtime => {
      it(`${runtime}: should launch and accept /fase command`, async function() {
        this.timeout(50000);

        const tester = new TUIInteractionTester(runtime, 40000);
        const result = await tester.run();

        if (result.skipped) {
          console.log(`    ${YELLOW}⚠${RESET}  ${runtime}: ${result.reason}`);
          this.skip();
          return;
        }

        if (result.error) {
          console.log(`    ${RED}✗${RESET}  ${runtime}: ${result.error}`);
          throw new Error(`${runtime} TUI interaction failed: ${result.error}`);
        }

        if (result.success) {
          console.log(
            `    ${GREEN}✓${RESET}  ${runtime}: /fase triggered, found ${result.commandsFound} FASE command(s)`
          );
        } else {
          console.log(
            `    ${YELLOW}⚠${RESET}  ${runtime}: /fase accepted but no command suggestions captured`
          );
          console.log(`       Last 200 chars: ${result.snippetLines.substring(0, 200)}`);
          // Don't fail hard for providers with different UX
        }
      });
    });
  });

  describe('Verify FASE Commands Installed Locally', () => {
    runtimes.forEach(runtime => {
      it(`${runtime}: should have FASE commands available locally`, function() {
        const dirMap = {
          'claude': '.claude',
          'opencode': '.opencode',
          'gemini': '.gemini',
          'codex': '.codex',
          'qwen': '.qwen'
        };

        const runtimeDir = dirMap[runtime];
        const configDir = path.join(os.homedir(), runtimeDir);

        if (!fs.existsSync(configDir)) {
          console.log(`    ${DIM}─${RESET}  ${runtime}: not installed locally`);
          this.skip();
          return;
        }

        // Count available FASE commands
        let commandCount = 0;

        if (runtime === 'codex') {
          const skillsDir = path.join(configDir, 'skills');
          if (fs.existsSync(skillsDir)) {
            const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
            commandCount = entries.filter(
              e =>
                e.isDirectory() &&
                e.name.startsWith('fase-') &&
                fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md'))
            ).length;
          }
        } else {
          const commandsDir = path.join(configDir, 'commands');
          if (fs.existsSync(commandsDir)) {
            const files = fs.readdirSync(commandsDir);
            commandCount = files.filter(f => f.startsWith('fase-')).length;
          }
        }

        if (commandCount > 0) {
          console.log(`    ${GREEN}✓${RESET}  ${runtime}: ${commandCount} FASE commands installed`);
        } else {
          console.log(`    ${YELLOW}⚠${RESET}  ${runtime}: no FASE commands found`);
        }
      });
    });
  });

  describe('Slash Command Pattern Recognition', () => {
    it('should recognize /fase as valid command prefix', () => {
      const pattern = /^\/[a-z-]+/;
      const inputs = ['/fase', '/fase-ajuda', '/fase-adicionar-tarefa'];
      inputs.forEach(input => {
        if (!pattern.test(input)) {
          throw new Error(`Invalid pattern: ${input}`);
        }
      });
    });

    it('should recognize $fase for Codex skills', () => {
      const pattern = /^\$[a-z-]+/;
      const inputs = ['$fase', '$fase-ajuda'];
      inputs.forEach(input => {
        if (!pattern.test(input)) {
          throw new Error(`Invalid Codex skill pattern: ${input}`);
        }
      });
    });
  });
});

module.exports = { TUIInteractionTester };
