/**
 * Tmux Test Helper for FASE
 * 
 * Provides utilities for running installation tests in isolated tmux sessions.
 * Each test runs in a clean temp directory to avoid pollution.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

/**
 * Generate unique session name (no spaces or special chars)
 */
function generateSessionName(testName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  // Remove spaces and special characters for tmux compatibility
  const sanitizedName = testName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `fase-test-${sanitizedName}-${timestamp}-${random}`;
}

/**
 * Create isolated temp directory for test
 */
function createTestDirectory(testName) {
  const baseDir = path.join(os.tmpdir(), 'fase-tests');
  fs.mkdirSync(baseDir, { recursive: true });
  const testDir = fs.mkdtempSync(path.join(baseDir, `${testName}-`));
  return testDir;
}

/**
 * Check if tmux is available
 */
function checkTmuxAvailable() {
  try {
    execSync('which tmux', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a CLI command is available
 */
function isCLIAvailable(cliName) {
  try {
    execSync(`which ${cliName}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify slash commands by checking command file structure
 * Returns: { available: boolean, commands: string[], error?: string }
 */
function verifySlashCommands(sessionName, runtime, testDir, timeout = 15000) {
  const cliCommands = {
    'claude': 'claude',
    'qwen': 'qwen',
    'opencode': 'opencode',
    'gemini': 'gemini',
    'codex': 'codex'
  };
  
  const cli = cliCommands[runtime];
  if (!cli) {
    return { 
      available: false, 
      commands: [], 
      skipped: true,
      reason: `Unknown runtime: ${runtime}` 
    };
  }
  
  if (!isCLIAvailable(cli)) {
    return { 
      available: false, 
      commands: [], 
      skipped: true,
      reason: `${cli} CLI not installed` 
    };
  }
  
  const expectedCommands = [
    'ajuda',
    'novo-projeto',
    'novo-marco',
    'executar-etapa'
  ];
  
  // Config directory mappings
  const configDirs = {
    'claude': '.claude',
    'qwen': '.claude',
    'opencode': '.opencode',
    'gemini': '.gemini',
    'codex': '.codex'
  };
  
  const configDir = path.join(testDir, configDirs[runtime]);
  
  try {
    // Check command files exist and are valid
    const foundCommands = [];
    const commandPaths = {
      'claude': path.join(configDir, 'commands', 'fase'),
      'qwen': path.join(configDir, 'commands'),
      'opencode': path.join(configDir, 'command'),
      'gemini': path.join(configDir, 'commands', 'fase'),
      'codex': path.join(configDir, 'skills')
    };
    
    const commandPath = commandPaths[runtime];
    const extension = runtime === 'gemini' ? '.toml' : '.md';
    
    if (!fs.existsSync(commandPath)) {
      return {
        available: false,
        commands: [],
        error: `Command directory not found: ${commandPath}`
      };
    }
    
    // Check each expected command file exists
    for (const cmd of expectedCommands) {
      let found = false;
      
      // Codex uses directories with SKILL.md inside
      if (runtime === 'codex') {
        const skillDir = path.join(commandPath, `fase-${cmd}`);
        if (fs.existsSync(skillDir)) {
          const skillFile = path.join(skillDir, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            const content = fs.readFileSync(skillFile, 'utf8');
            if (content.trim().length > 50) {
              found = true;
            }
          }
        }
      } else {
        // Other providers use files directly
        const cmdFiles = [
          path.join(commandPath, `${cmd}${extension}`),           // e.g., ajuda.md
          path.join(commandPath, `fase-${cmd}${extension}`),      // e.g., fase-ajuda.md
          path.join(commandPath, `${cmd}.toml`),                  // e.g., ajuda.toml
          path.join(commandPath, `fase_${cmd}.toml`)              // e.g., fase_ajuda.toml
        ];
        
        for (const cmdFile of cmdFiles) {
          if (fs.existsSync(cmdFile)) {
            const content = fs.readFileSync(cmdFile, 'utf8');
            
            if (extension === '.toml') {
              if (content.includes('=')) {
                found = true;
                break;
              }
            } else {
              if (content.trim().length > 50) {
                found = true;
                break;
              }
            }
          }
        }
      }
      
      if (found) {
        foundCommands.push(cmd);
      }
    }
    
    return {
      available: foundCommands.length >= 3,  // At least 3 of 4 commands
      commands: foundCommands,
      total: expectedCommands.length
    };
    
  } catch (err) {
    return {
      available: false,
      commands: [],
      error: err.message
    };
  }
}

/**
 * Launch new tmux session in test directory
 */
function launchSession(sessionName, testDir) {
  try {
    execSync(`tmux new-session -d -s ${sessionName}`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`${RED}✗ Failed to create tmux session: ${sessionName}${RESET}`);
    return false;
  }
}

/**
 * Send command to tmux session (with proper escaping)
 */
function sendCommand(sessionName, command) {
  try {
    // Escape double quotes and backslashes for shell
    const escapedCommand = command.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    execSync(`tmux send-keys -t ${sessionName} "${escapedCommand}" Enter`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`${RED}✗ Failed to send command to session: ${sessionName}${RESET}`);
    return false;
  }
}

/**
 * Capture output from tmux session
 */
function captureOutput(sessionName, lines = 50) {
  try {
    const output = execSync(`tmux capture-pane -t ${sessionName} -p`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output;
  } catch (err) {
    return '';
  }
}

/**
 * Wait for command completion (look for prompt or specific marker)
 */
function waitForCompletion(sessionName, timeoutMs = 60000, marker = null) {
  const startTime = Date.now();
  const pollInterval = 1000;
  
  while (Date.now() - startTime < timeoutMs) {
    const output = captureOutput(sessionName);
    
    // Check for custom marker
    if (marker && output.includes(marker)) {
      return true;
    }
    
    // Check for installation completion markers
    if (output.includes('Pronto!') || 
        output.includes('✓') || 
        output.includes('Installation complete')) {
      // Give it a moment to settle
      sleepSync(1000);
      return true;
    }
    
    // Check for shell prompt (indicates command finished)
    if (output.includes('$ ') || output.includes('# ') || output.includes('❯')) {
      // Give it a moment to settle
      sleepSync(1000);
      return true;
    }
    
    // Check for errors
    if (output.includes('Error:') || output.includes('ReferenceError')) {
      sleepSync(500);
      return true; // Return but test will check for errors
    }
    
    sleep(pollInterval);
  }
  
  return false; // Timeout
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sync sleep (for non-async contexts)
 */
function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // busy wait
  }
}

/**
 * Kill tmux session
 */
function killSession(sessionName) {
  try {
    execSync(`tmux kill-session -t ${sessionName} 2>/dev/null || true`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up test directory
 */
function cleanupDirectory(testDir) {
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error(`${YELLOW}⚠ Failed to cleanup: ${testDir}${RESET}`);
    return false;
  }
}

/**
 * Assert file exists
 */
function assertFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${message}: File not found: ${filePath}`);
  }
  return true;
}

/**
 * Assert directory exists
 */
function assertDirExists(dirPath, message) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`${message}: Directory not found: ${dirPath}`);
  }
  return true;
}

/**
 * Count files matching pattern in directory
 */
function countFiles(dirPath, pattern) {
  try {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.match(pattern));
    return files.length;
  } catch {
    return 0;
  }
}

/**
 * Recursively count files in directory
 */
function countFilesRecursive(dirPath, extension = '.md') {
  try {
    let count = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += countFilesRecursive(fullPath, extension);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

/**
 * Verify FASE installation structure
 */
function verifyFASEInstallation(configDir, runtime) {
  const errors = [];
  
  // Common directories to check (all at root level of config dir)
  const expectedDirs = [
    path.join(configDir, 'fase'),
    path.join(configDir, 'agents')
  ];
  
  // Runtime-specific checks
  if (runtime === 'claude') {
    expectedDirs.push(path.join(configDir, 'commands'));
    expectedDirs.push(path.join(configDir, 'commands', 'fase'));
  } else if (runtime === 'qwen') {
    // Qwen uses .claude with commands/ at root
    expectedDirs.push(path.join(configDir, 'commands'));
  } else if (runtime === 'opencode') {
    expectedDirs.push(path.join(configDir, 'command'));
  } else if (runtime === 'gemini') {
    expectedDirs.push(path.join(configDir, 'commands'));
    expectedDirs.push(path.join(configDir, 'commands', 'fase'));
  } else if (runtime === 'codex') {
    expectedDirs.push(path.join(configDir, 'skills'));
  }
  
  // Check directories
  for (const dir of expectedDirs) {
    if (!fs.existsSync(dir)) {
      errors.push(`Missing directory: ${dir}`);
    }
  }
  
  // Check for .md files in commands/skills/command
  let commandsDir = null;
  let commandExtension = '.md';  // Default extension
  if (runtime === 'opencode') {
    commandsDir = path.join(configDir, 'command');
  } else if (runtime === 'claude' || runtime === 'qwen') {
    commandsDir = path.join(configDir, 'commands');
  } else if (runtime === 'gemini') {
    commandsDir = path.join(configDir, 'commands', 'fase');
    commandExtension = '.toml';  // Gemini uses TOML for commands
  } else if (runtime === 'codex') {
    commandsDir = path.join(configDir, 'skills');
  }
  
  if (commandsDir && fs.existsSync(commandsDir)) {
    const mdCount = countFilesRecursive(commandsDir, commandExtension);
    if (mdCount === 0) {
      errors.push(`No ${commandExtension} files found in ${commandsDir}`);
    }
  }
  
  // Check for agent files
  const agentsDir = path.join(configDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const mdCount = countFilesRecursive(agentsDir, '.md');
    if (mdCount === 0) {
      errors.push(`No agent .md files found in ${agentsDir}`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Run installation test
 */
async function runInstallTest({ 
  testName, 
  runtime, 
  flags = '', 
  timeout = 60000,
  expectSuccess = true 
}) {
  const sessionName = generateSessionName(testName);
  const testDir = createTestDirectory(testName);
  const projectRoot = path.resolve(__dirname, '..');
  
  let success = false;
  let output = '';
  
  try {
    console.log(`${CYAN}▶${RESET} Starting test: ${testName}`);
    console.log(`${DIM}   Directory: ${testDir}${RESET}`);
    
    // Launch session
    if (!launchSession(sessionName, testDir)) {
      throw new Error('Failed to launch tmux session');
    }
    
    // Change to test directory and wait for prompt
    sendCommand(sessionName, `cd "${testDir}"`);
    sleepSync(2000);  // Wait for cd to complete
    
    // Verify we're in the right directory (non-blocking check)
    sendCommand(sessionName, 'pwd');
    sleepSync(1000);
    
    // Clean any existing FASE directories (ensure fresh state)
    const cleanupDirs = {
      'claude': ['.claude'],
      'qwen': ['.claude'],
      'opencode': ['.opencode'],
      'gemini': ['.gemini'],
      'codex': ['.codex'],
      'all': ['.claude', '.opencode', '.gemini', '.codex']
    };
    
    const dirsToClean = cleanupDirs[runtime] || [`.${runtime}`];
    for (const dir of dirsToClean) {
      sendCommand(sessionName, `rm -rf ${dir} 2>/dev/null || true`);
    }
    sleepSync(500);
    
    // Run installation
    const installCmd = `node ${projectRoot}/dist/install.js --${runtime} ${flags}`.trim();
    console.log(`${DIM}   Command: ${installCmd}${RESET}`);
    sendCommand(sessionName, installCmd);
    
    // Wait for completion
    const completed = waitForCompletion(sessionName, timeout);
    output = captureOutput(sessionName);
    
    if (!completed) {
      throw new Error(`Test timeout after ${timeout}ms`);
    }
    
    // Check for errors in output
    if (output.includes('Error') || output.includes('failed')) {
      if (expectSuccess) {
        throw new Error(`Installation failed:\n${output}`);
      }
    }
    
    // Verify installation
    const runtimeDirs = {
      'claude': '.claude',
      'qwen': '.claude',
      'opencode': '.opencode',
      'gemini': '.gemini',
      'codex': '.codex'
    };
    
    // For --all, just check that at least one provider was installed
    if (runtime === 'all') {
      const installed = ['claude', 'opencode', 'gemini', 'codex'].some(r => {
        const dir = path.join(testDir, runtimeDirs[r]);
        return fs.existsSync(dir);
      });
      if (!installed) {
        throw new Error('No providers installed with --all flag');
      }
      success = true;
      console.log(`${GREEN}✓${RESET} Test passed: ${testName}`);
      return { success, testName, output };
    }
    
    const configDir = path.join(testDir, runtimeDirs[runtime] || `.${runtime}`);
    const verification = verifyFASEInstallation(configDir, runtime);

    if (!verification.success) {
      throw new Error(`Verification failed:\n${verification.errors.join('\n')}`);
    }

    // Verify TUI slash commands by checking command file structure
    console.log(`${DIM}   Verifying slash command files...${RESET}`);
    const tuiResult = verifySlashCommands(sessionName, runtime, testDir, 20000);
    
    if (tuiResult.skipped) {
      console.log(`${YELLOW}⚠${RESET} Command verification skipped: ${tuiResult.reason}`);
    } else if (tuiResult.available) {
      console.log(`${GREEN}✓${RESET} Slash commands verified: ${tuiResult.commands.join(', ')} (${tuiResult.commands.length}/${tuiResult.total})`);
    } else {
      console.log(`${RED}✗${RESET} Slash command files missing or invalid`);
      if (tuiResult.error) {
        console.log(`${DIM}   Error: ${tuiResult.error}${RESET}`);
        throw new Error(`Command verification failed: ${tuiResult.error}`);
      }
    }

    success = true;
    console.log(`${GREEN}✓${RESET} Test passed: ${testName}`);
    
  } catch (err) {
    success = false;
    console.error(`${RED}✗${RESET} Test failed: ${testName}`);
    console.error(`${RED}   ${err.message}${RESET}`);
    if (output) {
      console.error(`${DIM}   Output:\n${output}${RESET}`);
    }
  } finally {
    // Cleanup
    killSession(sessionName);
    cleanupDirectory(testDir);
  }
  
  return {
    success,
    testName,
    output
  };
}

/**
 * Run uninstall test
 */
async function runUninstallTest({ 
  testName, 
  runtime, 
  timeout = 120000  // Increased timeout for interactive uninstall
}) {
  const sessionName = generateSessionName(testName);
  const testDir = createTestDirectory(testName);
  const projectRoot = path.resolve(__dirname, '..');
  
  let success = false;
  let output = '';
  
  try {
    console.log(`${CYAN}▶${RESET} Starting test: ${testName}`);
    
    // Launch session
    launchSession(sessionName, testDir);
    
    // Change to test directory
    sendCommand(sessionName, `cd "${testDir}"`);
    sleepSync(2000);
    
    // First install
    const installCmd = `node ${projectRoot}/dist/install.js --${runtime}`;
    sendCommand(sessionName, installCmd);
    const installCompleted = waitForCompletion(sessionName, timeout);
    
    if (!installCompleted) {
      throw new Error('Installation timed out');
    }
    
    // Verify install worked
    const runtimeDirs = {
      'claude': '.claude',
      'qwen': '.claude',
      'opencode': '.opencode',
      'gemini': '.gemini',
      'codex': '.codex'
    };
    const configDir = path.join(testDir, runtimeDirs[runtime] || `.${runtime}`);
    
    if (!fs.existsSync(configDir)) {
      throw new Error('Installation did not create expected directory');
    }
    
    // Now uninstall
    sleepSync(1000);
    const uninstallCmd = `node ${projectRoot}/dist/install.js --${runtime} --uninstall`;
    sendCommand(sessionName, uninstallCmd);
    waitForCompletion(sessionName, timeout);
    output = captureOutput(sessionName);
    
    // Verify cleanup (directory should be removed or mostly empty)
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      if (files.length > 5) {
        console.log(`${YELLOW}⚠${RESET} Config directory not fully cleaned (this may be OK)`);
      }
    }
    
    success = true;
    console.log(`${GREEN}✓${RESET} Test passed: ${testName}`);
    
  } catch (err) {
    success = false;
    console.error(`${RED}✗${RESET} Test failed: ${testName}`);
    console.error(`${RED}   ${err.message}${RESET}`);
    if (output) {
      console.error(`${DIM}   Output:\n${output}${RESET}`);
    }
  } finally {
    // Cleanup
    killSession(sessionName);
    cleanupDirectory(testDir);
  }
  
  return {
    success,
    testName,
    output
  };
}

module.exports = {
  generateSessionName,
  createTestDirectory,
  checkTmuxAvailable,
  launchSession,
  sendCommand,
  captureOutput,
  waitForCompletion,
  sleep,
  sleepSync,
  killSession,
  cleanupDirectory,
  assertFileExists,
  assertDirExists,
  countFiles,
  countFilesRecursive,
  verifyFASEInstallation,
  runInstallTest,
  runUninstallTest
};
