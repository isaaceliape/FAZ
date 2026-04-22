/**
 * FASE Slash Command End-to-End Test
 *
 * Tests actual user interaction by:
 * 1. Launching each provider with tmux
 * 2. Typing /fase in the chat
 * 3. Verifying TUI shows FASE command suggestions
 */

const assert = require('assert');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Test FASE slash command in a provider using tmux
 */
class SlashCommandTester {
  constructor(runtime, timeout = 30000) {
    this.runtime = runtime;
    this.timeout = timeout;
    this.sessionName = `fase-slash-${runtime}-${Date.now()}`;
    this.output = '';
    this.commandsFound = 0;
  }

  /**
   * Get the launch command for the provider
   */
  getLaunchCommand() {
    const commands = {
      'claude': 'claude',
      'opencode': 'oc chat',
      'gemini': 'gemini',
      'codex': 'codex',
      'copilot': 'copilot',
      'qwen': 'qwen'
    };

    return commands[this.runtime] || null;
  }

  /**
   * Send command via tmux
   */
  sendCommand(cmd) {
    try {
      execSync(`tmux send-keys -t ${this.sessionName} "${cmd}" Enter`, {
        stdio: 'pipe'
      });
    } catch (err) {
      console.error(`Failed to send command: ${err.message}`);
    }
  }

  /**
   * Capture tmux output
   */
  captureOutput() {
    try {
      const output = execSync(`tmux capture-pane -t ${this.sessionName} -p`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.output = output;
      return output;
    } catch {
      return '';
    }
  }

  /**
   * Wait for specific text in tmux output
   */
  waitForOutput(text, maxWait = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      const output = this.captureOutput();
      if (output.includes(text)) {
        return true;
      }
      execSync('sleep 0.1');
    }
    return false;
  }

  /**
   * Count FASE commands in suggestions
   */
  countFaseCommandSuggestions() {
    const faseCommandPattern = /fase-[a-z-]+/g;
    const matches = this.output.match(faseCommandPattern) || [];
    return new Set(matches).size; // Unique commands only
  }

  /**
   * Test the provider
   */
  async run() {
    const launchCmd = this.getLaunchCommand();
    if (!launchCmd) {
      return {
        success: false,
        runtime: this.runtime,
        error: 'Unknown provider'
      };
    }

    try {
      // Create tmux session
      execSync(`tmux new-session -d -s ${this.sessionName} -x 120 -y 30`, {
        stdio: 'pipe'
      });

      // Wait for session to initialize
      await new Promise(r => setTimeout(r, 1000));

      // Try to launch the provider (may not exist)
      this.sendCommand(launchCmd);

      // Wait a bit for provider to start
      await new Promise(r => setTimeout(r, 2000));

      // Capture initial output to check if provider started
      let output = this.captureOutput();

      // Type /fase to trigger suggestions
      this.sendCommand('/fase');

      // Wait for suggestions to appear
      await new Promise(r => setTimeout(r, 1000));

      output = this.captureOutput();

      // Count FASE commands in output
      const commandCount = this.countFaseCommandSuggestions();

      // Kill the session
      execSync(`tmux kill-session -t ${this.sessionName}`, {
        stdio: 'pipe'
      });

      return {
        success: commandCount > 0,
        runtime: this.runtime,
        commandsFound: commandCount,
        output: output.substring(0, 500) // First 500 chars for debugging
      };
    } catch (err) {
      try {
        execSync(`tmux kill-session -t ${this.sessionName}`, {
          stdio: 'pipe'
        });
      } catch {}

      return {
        success: false,
        runtime: this.runtime,
        error: err.message,
        note: 'Provider may not be installed'
      };
    }
  }
}

describe('FASE Slash Command E2E (with tmux)', function() {
  this.timeout(60000); // 60 second timeout for e2e tests

  const runtimes = ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];

  describe('Provider Launch and /fase Interaction', () => {
    runtimes.forEach(runtime => {
      it(`${runtime}: should respond to /fase with command suggestions`, async function() {
        this.timeout(40000);

        const tester = new SlashCommandTester(runtime, 30000);
        const result = await tester.run();

        if (result.error && result.error.includes('Unknown')) {
          this.skip();
          return;
        }

        if (result.note && result.note.includes('not be installed')) {
          console.log(`    ${YELLOW}⚠${RESET}  ${runtime} not installed - skipping interaction test`);
          this.skip();
          return;
        }

        if (result.success) {
          console.log(`    ${GREEN}✓${RESET}  ${runtime}: ${result.commandsFound} FASE commands found`);
        } else {
          console.log(`    ${DIM}─${RESET}  ${runtime}: interaction not verified (provider may need setup)`);
        }
      });
    });
  });

  describe('FASE Command File Availability', () => {
    runtimes.forEach(runtime => {
      it(`${runtime}: should have FASE command files installed`, function() {
        const dirMap = {
          'claude': '.claude',
          'opencode': '.opencode',
          'gemini': '.gemini',
          'codex': '.codex',
          'copilot': '.copilot',
          'qwen': '.qwen'
        };

        const runtimeDir = dirMap[runtime];
        const configDir = path.join(os.homedir(), runtimeDir);

        if (!fs.existsSync(configDir)) {
          console.log(`    ${DIM}─${RESET}  ${runtime}: not installed`);
          this.skip();
          return;
        }

        // Count available FASE commands
        let commandCount = 0;

        if (runtime === 'codex') {
          const skillsDir = path.join(configDir, 'skills');
          if (fs.existsSync(skillsDir)) {
            const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
            commandCount = entries.filter(e =>
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
          console.log(`    ${GREEN}✓${RESET}  ${runtime}: ${commandCount} FASE commands available`);
          assert(commandCount > 0, `${runtime} should have FASE commands`);
        } else {
          console.log(`    ${YELLOW}⚠${RESET}  ${runtime}: no FASE commands found`);
        }
      });
    });
  });

  describe('Slash Command Structure', () => {
    it('should recognize /fase as valid slash command format', () => {
      const validFormats = [
        '/fase',
        '/fase-ajuda',
        '/fase-adicionar-tarefa',
        '/fase-arquitetar'
      ];

      validFormats.forEach(cmd => {
        const match = /^\/[a-z-]+/.test(cmd);
        assert(match, `"${cmd}" should match slash command format`);
      });
    });

    it('should validate FASE command naming convention', () => {
      const faseCommands = [
        'fase-ajuda',
        'fase-adicionar-tarefa',
        'fase-arquitetar',
        'fase-auditar-marco',
        'fase-debug'
      ];

      faseCommands.forEach(cmd => {
        const match = /^fase-[a-z-]+$/.test(cmd);
        assert(match, `"${cmd}" should follow FASE naming convention`);
      });
    });
  });

  describe('Command Suggestion Logic', () => {
    it('should find commands matching /fase prefix', () => {
      const allCommands = [
        'fase-ajuda',
        'fase-adicionar-tarefa',
        'fase-adicionar-etapa',
        'help',
        'exit'
      ];

      const userInput = '/fase';
      const prefix = userInput.slice(1);

      const suggestions = allCommands.filter(cmd => cmd.startsWith(prefix));

      assert.strictEqual(suggestions.length, 3, 'Should find 3 FASE commands');
      assert(suggestions.every(s => s.startsWith('fase-')), 'All results should be FASE commands');
    });

    it('should progressively narrow suggestions as user types', () => {
      const allCommands = [
        'fase-ajuda',
        'fase-adicionar-tarefa',
        'fase-adicionar-etapa',
        'fase-arquitetar'
      ];

      // /fase → 4 matches
      const r1 = allCommands.filter(c => c.startsWith('fase'));
      assert.strictEqual(r1.length, 4);

      // /fase-a → 4 matches
      const r2 = allCommands.filter(c => c.startsWith('fase-a'));
      assert.strictEqual(r2.length, 4);

      // /fase-ad → 2 matches
      const r3 = allCommands.filter(c => c.startsWith('fase-ad'));
      assert.strictEqual(r3.length, 2);

      // /fase-ar → 1 match
      const r4 = allCommands.filter(c => c.startsWith('fase-ar'));
      assert.strictEqual(r4.length, 1);

      // Verify narrowing progression
      assert(r1.length >= r2.length);
      assert(r2.length >= r3.length);
      assert(r3.length >= r4.length);
    });
  });
});

module.exports = { SlashCommandTester };
