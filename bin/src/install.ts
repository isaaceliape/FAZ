// @ts-nocheck

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import crypto from 'crypto';
import { execSync } from 'child_process';

import { fileURLToPath } from 'url';
import { saveAnalyticsConfig } from './lib/analytics.js';
import { checkAndPromptForUpdate } from './lib/version-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Codex config.toml constants
// Note: Agent TOML files are automatically fixed for escaping issues:
// - Backticks in code blocks: \` → \\` (escape backslashes for TOML)
// - Pipes in grep patterns: \| → | (pipes don't need escaping in grep -E)
// - Parentheses in grep: \( → \\( (escape backslashes for TOML)
const FASE_CODEX_MARKER = '# FASE Agent Configuration \u2014 managed by fase-ai installer';

const CODEX_AGENT_SANDBOX = {
  'fase-executor': 'workspace-write',
  'fase-planner': 'workspace-write',
  'fase-phase-researcher': 'workspace-write',
  'fase-project-researcher': 'workspace-write',
  'fase-research-synthesizer': 'workspace-write',
  'fase-verifier': 'workspace-write',
  'fase-codebase-mapper': 'workspace-write',
  'fase-roadmapper': 'workspace-write',
  'fase-debugger': 'workspace-write',
  'fase-plan-checker': 'read-only',
  'fase-integration-checker': 'read-only',
};

// Get version from package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version: string; [key: string]: unknown };

// Shared prompts directory (v3.2.0+)
const SHARED_DIR = path.join(os.homedir(), '.fase-ai');

// Parse args
const args = process.argv.slice(2);
const hasOpencode = args.includes('--opencode');
const hasClaude = args.includes('--claude');
const hasGemini = args.includes('--gemini');
const hasCodex = args.includes('--codex');
const hasBoth = args.includes('--both'); // Legacy flag, keeps working
const hasAll = args.includes('--all');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasVerificar = args.includes('--verificar-instalacao') || args.includes('--verificar') || args.includes('-v');
const hasAtualizar = args.includes('--atualizar') || args.includes('--update');

// Runtime selection - can be set by flags or interactive prompt
let selectedRuntimes = [];
if (hasAll) {
  selectedRuntimes = ['claude', 'opencode', 'gemini', 'codex'];
} else if (hasBoth) {
  selectedRuntimes = ['claude', 'opencode'];
} else {
  if (hasOpencode) selectedRuntimes.push('opencode');
  if (hasClaude) selectedRuntimes.push('claude');
  if (hasGemini) selectedRuntimes.push('gemini');
  if (hasCodex) selectedRuntimes.push('codex');
}

/**
 * Convert a pathPrefix (which uses absolute paths for global installs) to a
 * $HOME-relative form for replacing $HOME/.claude/ references in bash code blocks.
 * Preserves $HOME as a shell variable so paths remain portable across machines.
 */
function toHomePrefix(pathPrefix) {
  const home = os.homedir().replace(/\\/g, '/');
  const normalized = pathPrefix.replace(/\\/g, '/');
  if (normalized.startsWith(home)) {
    return '$HOME' + normalized.slice(home.length);
  }
  // For relative paths or paths not under $HOME, return as-is
  return normalized;
}

// Helper to get directory name for a runtime (used for local/project installs)
function getDirName(runtime) {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.gemini';
  if (runtime === 'codex') return '.codex';
  return '.claude';
}

/**
 * Get the config directory path relative to home directory for a runtime
 * Used for templating hooks that use path.join(homeDir, '<configDir>', ...)
 * @param {string} runtime - 'claude', 'opencode', 'gemini', or 'codex'
 * @param {boolean} isGlobal - Whether this is a global install
 */
function getConfigDirFromHome(runtime, isGlobal) {
  if (!isGlobal) {
    // Local installs use the same dir name pattern
    return `'${getDirName(runtime)}'`;
  }
  // Global installs - OpenCode uses XDG path structure
  if (runtime === 'opencode') {
    // OpenCode: ~/.config/opencode -> '.config', 'opencode'
    // Return as comma-separated for path.join() replacement
    return "'.config', 'opencode'";
  }
  if (runtime === 'gemini') return "'.gemini'";
  if (runtime === 'codex') return "'.codex'";
  return "'.claude'";
}

/**
 * Get the global config directory for OpenCode
 * OpenCode follows XDG Base Directory spec and uses ~/.config/opencode/
 * Priority: OPENCODE_CONFIG_DIR > dirname(OPENCODE_CONFIG) > XDG_CONFIG_HOME/opencode > ~/.config/opencode
 */
function getOpencodeGlobalDir() {
  // 1. Explicit OPENCODE_CONFIG_DIR env var
  if (process.env.OPENCODE_CONFIG_DIR) {
    return expandTilde(process.env.OPENCODE_CONFIG_DIR);
  }
  
  // 2. OPENCODE_CONFIG env var (use its directory)
  if (process.env.OPENCODE_CONFIG) {
    return path.dirname(expandTilde(process.env.OPENCODE_CONFIG));
  }
  
  // 3. XDG_CONFIG_HOME/opencode
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(expandTilde(process.env.XDG_CONFIG_HOME), 'opencode');
  }
  
  // 4. Default: ~/.config/opencode (XDG default)
  return path.join(os.homedir(), '.config', 'opencode');
}

/**
 * Get the global config directory for a runtime
 * @param {string} runtime - 'claude', 'opencode', 'gemini', or 'codex'
 * @param {string|null} explicitDir - Explicit directory from --config-dir flag
 */
function getGlobalDir(runtime, explicitDir = null) {
  if (runtime === 'opencode') {
    // For OpenCode, --config-dir overrides env vars
    if (explicitDir) {
      return expandTilde(explicitDir);
    }
    return getOpencodeGlobalDir();
  }
  
  if (runtime === 'gemini') {
    // Gemini: --config-dir > GEMINI_CONFIG_DIR > ~/.gemini
    if (explicitDir) {
      return expandTilde(explicitDir);
    }
    if (process.env.GEMINI_CONFIG_DIR) {
      return expandTilde(process.env.GEMINI_CONFIG_DIR);
    }
    return path.join(os.homedir(), '.gemini');
  }

  if (runtime === 'codex') {
    // Codex: --config-dir > CODEX_HOME > ~/.codex
    if (explicitDir) {
      return expandTilde(explicitDir);
    }
    if (process.env.CODEX_HOME) {
      return expandTilde(process.env.CODEX_HOME);
    }
    return path.join(os.homedir(), '.codex');
  }
  
  // Claude Code: --config-dir > CLAUDE_CONFIG_DIR > ~/.claude
  if (explicitDir) {
    return expandTilde(explicitDir);
  }
  if (process.env.CLAUDE_CONFIG_DIR) {
    return expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }
  return path.join(os.homedir(), '.claude');
}

const banner = '\n' +
  cyan + '  ███████╗  █████╗ ███████╗███████╗\n' +
  '  ██╔════╝ ██╔══██╗██╔════╝██╔════╝\n' +
  '  █████╗   ███████║███████╗█████╗  \n' +
  '  ██╔══╝   ██╔══██║╚════██║██╔══╝  \n' +
  '  ██║      ██║  ██║███████║███████╗\n' +
  '  ╚═╝      ╚═╝  ╚═╝╚══════╝╚══════╝' + reset + '\n' +
  '\n' +
  '  FASE ' + dim + 'v' + pkg.version + reset + '\n' +
  '  Framework de Automação Sem Enrolação\n' +
  '  Sistema de meta-prompting, context engineering e\n' +
  '  desenvolvimento spec-driven para Claude Code, OpenCode, Gemini e Codex.\n';

// Parse --config-dir argument
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    // Error if --config-dir is provided without a value or next arg is another flag
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir requer um argumento de caminho${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  // Also handle --config-dir=value format
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) {
    const value = configDirArg.split('=')[1];
    if (!value) {
      console.error(`  ${yellow}--config-dir requer um caminho não vazio${reset}`);
      process.exit(1);
    }
    return value;
  }
  return null;
}
const explicitConfigDir = parseConfigDirArg();
const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');

// Track temporary files for cleanup
const tempFiles: string[] = [];

/**
 * Clean up temporary files on process exit
 */
function cleanupTempFiles() {
  for (const file of tempFiles) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (e) {
      const err = e as { message?: string };
      console.error(`[install] Erro ao limpar arquivo temporário ${file}: ${err.message}`);
    }
  }
}

// Install process exit handlers
process.on('SIGINT', () => {
  console.log('\n  Limpando arquivos temporários...');
  cleanupTempFiles();
  process.exit(1);
});

process.on('SIGTERM', () => {
  cleanupTempFiles();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(`[install] Erro não tratado: ${error.message}`);
  cleanupTempFiles();
  process.exit(1);
});

console.log(banner);

// Run verification if --verificar-instalacao flag is provided
if (hasVerificar) {
  
  try {
    const scriptPath = path.join(__dirname, 'verificar-instalacao.js');
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  } catch (e: unknown) {
    const err = e as { status?: number };
    // Verification script already output errors, just exit with its code
    process.exit(err.status || 1);
  }
}

// Show help if requested
if (hasHelp) {
  console.log(`  ${yellow}Uso:${reset} npx fase-ai [opções]\n\n  ${yellow}Opções:${reset}\n    ${cyan}--claude${reset}                  Instalar apenas para Claude Code\n    ${cyan}--opencode${reset}                Instalar apenas para OpenCode\n    ${cyan}--gemini${reset}                  Instalar apenas para Gemini\n    ${cyan}--codex${reset}                   Instalar apenas para Codex\n    ${cyan}--all${reset}                     Instalar para todos os runtimes\n    ${cyan}-u, --uninstall${reset}           Desinstalar o FASE (remover todos os arquivos)\n    ${cyan}--atualizar${reset}               Atualizar FASE: detecta runtimes instalados e reinstala\n    ${cyan}-v, --verificar${reset}           Verificar instalação e gerar relatório\n    ${cyan}-c, --config-dir <caminho>${reset} Especificar diretório de configuração customizado\n    ${cyan}-h, --help${reset}                Exibir esta mensagem de ajuda\n    ${cyan}--force-statusline${reset}        Substituir configuração de statusline existente\n\n  ${yellow}Exemplos:${reset}\n    ${dim}# Instalação interativa (solicita runtime)${reset}\n    npx fase-ai\n\n    ${dim}# Instalar para Claude Code${reset}\n    npx fase-ai --claude\n\n    ${dim}# Instalar para OpenCode${reset}\n    npx fase-ai --opencode\n\n    ${dim}# Instalar para Gemini${reset}\n    npx fase-ai --gemini\n\n    ${dim}# Instalar para Codex${reset}\n    npx fase-ai --codex\n\n    ${dim}# Instalar para todos os runtimes${reset}\n    npx fase-ai --all\n\n    ${dim}# Atualizar todos os runtimes instalados${reset}\n    npx fase-ai --atualizar\n\n    ${dim}# Atualizar apenas Claude Code${reset}\n    npx fase-ai --claude --atualizar\n\n    ${dim}# Verificar instalação${reset}\n    npx fase-ai --verificar\n\n    ${dim}# Desinstalação interativa (solicita confirma)${reset}\n    npx fase-ai --uninstall\n\n    ${dim}# Desinstalar do Codex${reset}\n    npx fase-ai --codex --uninstall\n\n    ${dim}# Desinstalar do OpenCode${reset}\n    npx fase-ai --opencode --uninstall\n\n  ${yellow}Notas:${reset}\n    A opção --config-dir é útil quando você tem múltiplas configurações.\n    Tem prioridade sobre as variáveis de ambiente CLAUDE_CONFIG_DIR / GEMINI_CONFIG_DIR / CODEX_HOME.\n    Use ${cyan}--uninstall${reset} sem localização para um processo interativo seguro.\n    Use ${cyan}--atualizar${reset} para re-instalar mantendo configurações existentes.\n`);
  process.exit(0);
}

/**
 * Expand ~ to home directory (shell doesn't expand in env vars passed to node)
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Build a hook command path using forward slashes for cross-platform compatibility.
 * On Windows, $HOME is not expanded by cmd.exe/PowerShell, so we use the actual path.
 */
function buildHookCommand(configDir, hookName) {
  // Use forward slashes for Node.js compatibility on all platforms
  const hooksPath = configDir.replace(/\\/g, '/') + '/hooks/' + hookName;
  return `node "${hooksPath}"`;
}

/**
 * Read and parse settings.json, returning empty object if it doesn't exist
 */
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Write settings.json with proper formatting
 */
function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

// Cache for attribution settings (populated once per runtime during install)
const attributionCache = new Map();

/**
 * Get commit attribution setting for a runtime
 * @param {string} runtime - 'claude', 'opencode', 'gemini', or 'codex'
 * @returns {null|undefined|string} null = remove, undefined = keep default, string = custom
 */
function getCommitAttribution(runtime) {
  // Return cached value if available
  if (attributionCache.has(runtime)) {
    return attributionCache.get(runtime);
  }

  let result;

  if (runtime === 'opencode') {
    const config = readSettings(path.join(getGlobalDir('opencode', null), 'opencode.json'));
    result = config.disable_ai_attribution === true ? null : undefined;
  } else if (runtime === 'gemini') {
    // Gemini: check gemini settings.json for attribution config
    const settings = readSettings(path.join(getGlobalDir('gemini', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else if (runtime === 'claude') {
    // Claude Code
    const settings = readSettings(path.join(getGlobalDir('claude', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else {
    // Codex currently has no attribution setting equivalent
    result = undefined;
  }

  // Cache and return
  attributionCache.set(runtime, result);
  return result;
}

/**
 * Process Co-Authored-By lines based on attribution setting
 * @param {string} content - File content to process
 * @param {null|undefined|string} attribution - null=remove, undefined=keep, string=replace
 * @returns {string} Processed content
 */
function processAttribution(content, attribution) {
  if (attribution === null) {
    // Remove Co-Authored-By lines and the preceding blank line
    return content.replace(/(\r?\n){2}Co-Authored-By:.*$/gim, '');
  }
  if (attribution === undefined) {
    return content;
  }
  // Replace with custom attribution (escape $ to prevent backreference injection)
  const safeAttribution = attribution.replace(/\$/g, '$$$$');
  return content.replace(/Co-Authored-By:.*$/gim, `Co-Authored-By: ${safeAttribution}`);
}

/**
 * Convert Claude Code frontmatter to opencode format
 * - Converts 'allowed-tools:' array to 'permission:' object
 * @param {string} content - Markdown file content with YAML frontmatter
 * @returns {string} - Content with converted frontmatter
 */
// Color name to hex mapping for opencode compatibility
const colorNameToHex = {
  cyan: '#00FFFF',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  magenta: '#FF00FF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
};

// Tool name mapping from Claude Code to OpenCode
// OpenCode uses lowercase tool names; special mappings for renamed tools
const claudeToOpencodeTools = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',  // Plugin/MCP - keep for compatibility
};

// Tool name mapping from Claude Code to Gemini CLI
// Gemini CLI uses snake_case built-in tool names
const claudeToGeminiTools = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'replace',
  Bash: 'run_shell_command',
  Glob: 'glob',
  Grep: 'search_file_content',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
  TodoWrite: 'write_todos',
  AskUserQuestion: 'ask_user',
};

/**
 * Convert a Claude Code tool name to OpenCode format
 * - Applies special mappings (AskUserQuestion -> question, etc.)
 * - Converts to lowercase (except MCP tools which keep their format)
 */
function convertToolName(claudeTool) {
  // Check for special mapping first
  if (claudeToOpencodeTools[claudeTool]) {
    return claudeToOpencodeTools[claudeTool];
  }
  // MCP tools (mcp__*) keep their format
  if (claudeTool.startsWith('mcp__')) {
    return claudeTool;
  }
  // Default: convert to lowercase
  return claudeTool.toLowerCase();
}

/**
 * Convert a Claude Code tool name to Gemini CLI format
 * - Applies Claude→Gemini mapping (Read→read_file, Bash→run_shell_command, etc.)
 * - Filters out MCP tools (mcp__*) — they are auto-discovered at runtime in Gemini
 * - Filters out Task — agents are auto-registered as tools in Gemini
 * @returns {string|null} Gemini tool name, or null if tool should be excluded
 */
function convertGeminiToolName(claudeTool) {
  // MCP tools: exclude — auto-discovered from mcpServers config at runtime
  if (claudeTool.startsWith('mcp__')) {
    return null;
  }
  // Task: exclude — agents are auto-registered as callable tools
  if (claudeTool === 'Task') {
    return null;
  }
  // Check for explicit mapping
  if (claudeToGeminiTools[claudeTool]) {
    return claudeToGeminiTools[claudeTool];
  }
  // Default: lowercase
  return claudeTool.toLowerCase();
}

function toSingleLine(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function yamlQuote(value) {
  return JSON.stringify(value);
}

function extractFrontmatterAndBody(content) {
  if (!content.startsWith('---')) {
    return { frontmatter: null, body: content };
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontmatter: null, body: content };
  }

  return {
    frontmatter: content.substring(3, endIndex).trim(),
    body: content.substring(endIndex + 3),
  };
}

function extractFrontmatterField(frontmatter, fieldName) {
  const regex = new RegExp(`^${fieldName}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function convertSlashCommandsToCodexSkillMentions(content) {
  let converted = content.replace(/\/fase-([a-z0-9-]+)/gi, (_, commandName) => {
    return `$fase-${String(commandName).toLowerCase()}`;
  });
  converted = converted.replace(/\/fase-help\b/g, '$fase-help');
  return converted;
}

function convertClaudeToCodexMarkdown(content) {
  let converted = convertSlashCommandsToCodexSkillMentions(content);
  converted = converted.replace(/\$ARGUMENTS\b/g, '{{FASE_ARGS}}');
  return converted;
}

function getCodexSkillAdapterHeader(skillName) {
  const invocation = `$${skillName}`;
  return `<codex_skill_adapter>
## A. Skill Invocation
- This skill is invoked by mentioning \`${invocation}\`.
- Treat all user text after \`${invocation}\` as \`{{FASE_ARGS}}\`.
- If no arguments are present, treat \`{{FASE_ARGS}}\` as empty.

## B. AskUserQuestion → request_user_input Mapping
FASE workflows use \`AskUserQuestion\` (Claude Code syntax). Translate to Codex \`request_user_input\`:

Parameter mapping:
- \`header\` → \`header\`
- \`question\` → \`question\`
- Options formatted as \`"Label" — description\` → \`{label: "Label", description: "description"}\`
- Generate \`id\` from header: lowercase, replace spaces with underscores

Batched calls:
- \`AskUserQuestion([q1, q2])\` → single \`request_user_input\` with multiple entries in \`questions[]\`

Multi-select workaround:
- Codex has no \`multiSelect\`. Use sequential single-selects, or present a numbered freeform list asking the user to enter comma-separated numbers.

Execute mode fallback:
- When \`request_user_input\` is rejected (Execute mode), present a plain-text numbered list and pick a reasonable default.

## C. Task() → spawn_agent Mapping
FASE workflows use \`Task(...)\` (Claude Code syntax). Translate to Codex collaboration tools:

Direct mapping:
- \`Task(subagent_type="X", prompt="Y")\` → \`spawn_agent(agent_type="X", message="Y")\`
- \`Task(model="...")\` → omit (Codex uses per-role config, not inline model selection)
- \`fork_context: false\` by default — FASE agents load their own context via \`<files_to_read>\` blocks

Parallel fan-out:
- Spawn multiple agents → collect agent IDs → \`wait(ids)\` for all to complete

Result parsing:
- Look for structured markers in agent output: \`CHECKPOINT\`, \`PLAN COMPLETE\`, \`SUMMARY\`, etc.
- \`close_agent(id)\` after collecting results from each agent
</codex_skill_adapter>`;
}

function convertClaudeCommandToCodexSkill(content, skillName) {
  const converted = convertClaudeToCodexMarkdown(content);
  const { frontmatter, body } = extractFrontmatterAndBody(converted);
  let description = `Run FASE workflow ${skillName}.`;
  if (frontmatter) {
    const maybeDescription = extractFrontmatterField(frontmatter, 'description');
    if (maybeDescription) {
      description = maybeDescription;
    }
  }
  description = toSingleLine(description);
  const shortDescription = description.length > 180 ? `${description.slice(0, 177)}...` : description;
  const adapter = getCodexSkillAdapterHeader(skillName);

  return `---\nname: ${yamlQuote(skillName)}\ndescription: ${yamlQuote(description)}\nmetadata:\n  short-description: ${yamlQuote(shortDescription)}\n---\n\n${adapter}\n\n${body.trimStart()}`;
}

/**
 * Convert Claude Code agent markdown to Codex agent format.
 * Applies base markdown conversions, then adds a <codex_agent_role> header
 * and cleans up frontmatter (removes tools/color fields).
 */
function convertClaudeAgentToCodexAgent(content) {
  let converted = convertClaudeToCodexMarkdown(content);

  const { frontmatter, body } = extractFrontmatterAndBody(converted);
  if (!frontmatter) return converted;

  const name = extractFrontmatterField(frontmatter, 'name') || 'unknown';
  const description = extractFrontmatterField(frontmatter, 'description') || '';
  const tools = extractFrontmatterField(frontmatter, 'tools') || '';

  const roleHeader = `<codex_agent_role>
role: ${name}
tools: ${tools}
purpose: ${toSingleLine(description)}
</codex_agent_role>`;

  const cleanFrontmatter = `---\nname: ${yamlQuote(name)}\ndescription: ${yamlQuote(toSingleLine(description))}\n---`;

  return `${cleanFrontmatter}\n\n${roleHeader}\n${body}`;
}

/**
 * Fix TOML escaping issues in agent instructions.
 * Handles:
 * - Backticks: converts \` to \\` (escapes backslashes for TOML)
 * - Grep patterns: fixes invalid escape sequences like \| that are invalid in TOML
 */
function fixTomlEscaping(content) {
  let fixed = content;

  // Fix backtick escaping: \` becomes \\`
  fixed = fixed.replace(/\\`/g, '\\\\`');

  // Fix grep patterns: \| becomes | (pipes don't need escaping in grep -E)
  // This handles patterns like: grep -E "export\|interface" or grep -r "import.*stripe\|import.*supabase"
  fixed = fixed.replace(/\\|/g, '|');

  return fixed;
}

/**
 * Generate a per-agent .toml config file for Codex.
 * Sets sandbox_mode and developer_instructions from the agent markdown body.
 */
function generateCodexAgentToml(agentName, agentContent) {
  const sandboxMode = CODEX_AGENT_SANDBOX[agentName] || 'read-only';
  const { body } = extractFrontmatterAndBody(agentContent);
  let instructions = body.trim();

  // Fix TOML escaping issues in the instructions
  instructions = fixTomlEscaping(instructions);

  const lines = [
    `sandbox_mode = "${sandboxMode}"`,
    `developer_instructions = """`,
    instructions,
    `"""`,
  ];
  return lines.join('\n') + '\n';
}

/**
 * Generate FASE config block for Codex config.toml.
 * @param {Array<{name: string, description: string}>} agents
 */
function generateCodexConfigBlock(agents) {
  const lines = [
    FASE_CODEX_MARKER,
    '[features]',
    'multi_agent = true',
    'default_mode_request_user_input = true',
    '',
    '[agents]',
    'max_threads = 4',
    'max_depth = 2',
    '',
  ];

  for (const { name, description } of agents) {
    lines.push(`[agents.${name}]`);
    lines.push(`description = ${JSON.stringify(description)}`);
    lines.push(`config_file = "agents/${name}.toml"`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Strip FASE sections from Codex config.toml content.
 * Returns cleaned content, or null if file would be empty.
 */
function stripGsdFromCodexConfig(content) {
  const markerIndex = content.indexOf(FASE_CODEX_MARKER);

  if (markerIndex !== -1) {
    // Has FASE marker — remove everything from marker to EOF
    let before = content.substring(0, markerIndex).trimEnd();
    // Also strip FASE-injected feature keys above the marker (Case 3 inject)
    before = before.replace(/^multi_agent\s*=\s*true\s*\n?/m, '');
    before = before.replace(/^default_mode_request_user_input\s*=\s*true\s*\n?/m, '');
    before = before.replace(/^\[features\]\s*\n(?=\[|$)/m, '');
    before = before.replace(/\n{3,}/g, '\n\n').trim();
    if (!before) return null;
    return before + '\n';
  }

  // No marker but may have FASE-injected feature keys
  let cleaned = content;
  cleaned = cleaned.replace(/^multi_agent\s*=\s*true\s*\n?/m, '');
  cleaned = cleaned.replace(/^default_mode_request_user_input\s*=\s*true\s*\n?/m, '');

  // Remove [agents.fase-*] sections (from header to next section or EOF)
  cleaned = cleaned.replace(/^\[agents\.fase-[^\]]+\]\n(?:(?!\[)[^\n]*\n?)*/gm, '');

  // Remove [features] section if now empty (only header, no keys before next section)
  cleaned = cleaned.replace(/^\[features\]\s*\n(?=\[|$)/m, '');

  // Remove [agents] section if now empty
  cleaned = cleaned.replace(/^\[agents\]\s*\n(?=\[|$)/m, '');

  // Clean up excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  if (!cleaned) return null;
  return cleaned + '\n';
}

/**
 * Merge FASE config block into an existing or new config.toml.
 * Three cases: new file, existing with FASE marker, existing without marker.
 */
function mergeCodexConfig(configPath, faseBlock) {
  // Case 1: No config.toml — create fresh
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, faseBlock + '\n');
    return;
  }

  const existing = fs.readFileSync(configPath, 'utf8');
  const markerIndex = existing.indexOf(FASE_CODEX_MARKER);

  // Case 2: Has FASE marker — truncate and re-append
  if (markerIndex !== -1) {
    let before = existing.substring(0, markerIndex).trimEnd();
    if (before) {
      // Strip any FASE-managed sections that leaked above the marker from previous installs
      before = before.replace(/^\[agents\.fase-[^\]]+\]\n(?:(?!\[)[^\n]*\n?)*/gm, '');
      before = before.replace(/^\[agents\]\n(?:(?!\[)[^\n]*\n?)*/m, '');
      before = before.replace(/\n{3,}/g, '\n\n').trimEnd();

      // Re-inject feature keys if user has [features] above the marker
      const hasFeatures = /^\[features\]\s*$/m.test(before);
      if (hasFeatures) {
        if (!before.includes('multi_agent')) {
          before = before.replace(/^\[features\]\s*$/m, '[features]\nmulti_agent = true');
        }
        if (!before.includes('default_mode_request_user_input')) {
          before = before.replace(/^\[features\].*$/m, '$&\ndefault_mode_request_user_input = true');
        }
      }
      // Skip [features] from faseBlock if user already has it
      const block = hasFeatures
        ? FASE_CODEX_MARKER + '\n' + faseBlock.substring(faseBlock.indexOf('[agents]'))
        : faseBlock;
      fs.writeFileSync(configPath, before + '\n\n' + block + '\n');
    } else {
      fs.writeFileSync(configPath, faseBlock + '\n');
    }
    return;
  }

  // Case 3: No marker — inject features if needed, append agents
  let content = existing;
  const featuresRegex = /^\[features\]\s*$/m;
  const hasFeatures = featuresRegex.test(content);

  if (hasFeatures) {
    if (!content.includes('multi_agent')) {
      content = content.replace(featuresRegex, '[features]\nmulti_agent = true');
    }
    if (!content.includes('default_mode_request_user_input')) {
      content = content.replace(/^\[features\].*$/m, '$&\ndefault_mode_request_user_input = true');
    }
    // Append agents block (skip the [features] section from faseBlock)
    const agentsBlock = faseBlock.substring(faseBlock.indexOf('[agents]'));
    content = content.trimEnd() + '\n\n' + FASE_CODEX_MARKER + '\n' + agentsBlock + '\n';
  } else {
    content = content.trimEnd() + '\n\n' + faseBlock + '\n';
  }

  fs.writeFileSync(configPath, content);
}

/**
 * Generate config.toml and per-agent .toml files for Codex.
 * Reads agent .md files from source, extracts metadata, writes .toml configs.
 */
function installCodexConfig(targetDir, agentsSrc) {
  const configPath = path.join(targetDir, 'config.toml');
  const agentsTomlDir = path.join(targetDir, 'agents');
  fs.mkdirSync(agentsTomlDir, { recursive: true });

  const agentEntries = fs.readdirSync(agentsSrc).filter(f => f.startsWith('fase-') && f.endsWith('.md'));
  const agents = [];

  // Compute the Codex pathPrefix for replacing .claude paths
  const codexPathPrefix = `${targetDir.replace(/\\/g, '/')}/`;

  for (const file of agentEntries) {
    let content = fs.readFileSync(path.join(agentsSrc, file), 'utf8');
    // Replace .claude paths before generating TOML (source files use ~/.claude and $HOME/.claude)
    content = content.replace(/~\/\.claude\//g, codexPathPrefix);
    content = content.replace(/\$HOME\/\.claude\//g, toHomePrefix(codexPathPrefix));
    const { frontmatter } = extractFrontmatterAndBody(content);
    const name = extractFrontmatterField(frontmatter, 'name') || file.replace('.md', '');
    const description = extractFrontmatterField(frontmatter, 'description') || '';

    agents.push({ name, description: toSingleLine(description) });

    const tomlContent = generateCodexAgentToml(name, content);
    fs.writeFileSync(path.join(agentsTomlDir, `${name}.toml`), tomlContent);
  }

  const faseBlock = generateCodexConfigBlock(agents);
  mergeCodexConfig(configPath, faseBlock);

  return agents.length;
}

/**
 * Strip HTML <sub> tags for Gemini CLI output
 * Terminals don't support subscript — Gemini renders these as raw HTML.
 * Converts <sub>text</sub> to italic *(text)* for readable terminal output.
 */
function stripSubTags(content) {
  return content.replace(/<sub>(.*?)<\/sub>/g, '*($1)*');
}

/**
 * Convert Claude Code agent frontmatter to Gemini CLI format
 * Gemini agents use .md files with YAML frontmatter, same as Claude,
 * but with different field names and formats:
 * - tools: must be a YAML array (not comma-separated string)
 * - tool names: must use Gemini built-in names (read_file, not Read)
 * - color: must be removed (causes validation error)
 * - mcp__* tools: must be excluded (auto-discovered at runtime)
 */
function convertClaudeToGeminiAgent(content) {
  if (!content.startsWith('---')) return content;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return content;

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3);

  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  let inSkills = false;
  const tools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip skills section entirely (not supported by Gemini)
    if (trimmed.startsWith('skills:')) {
      inSkills = true;
      continue;
    }

    // Handle indented lines under skills
    if (inSkills) {
      if (trimmed.startsWith('- ') || (trimmed && line.startsWith('  '))) {
        continue;
      } else if (trimmed) {
        inSkills = false;
      }
    }

    // Normalize agent name to valid slug (lowercase, no accents)
    if (trimmed.startsWith('name:')) {
      const nameValue = trimmed.substring(5).trim();
      // Convert to lowercase and remove accents
      const normalized = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      newLines.push(`name: ${normalized}`);
      continue;
    }

    // Convert allowed-tools YAML array to tools list
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    // Handle inline tools: field (comma-separated string)
    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        const parsed = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        for (const t of parsed) {
          const mapped = convertGeminiToolName(t);
          if (mapped) tools.push(mapped);
        }
      } else {
        // tools: with no value means YAML array follows
        inAllowedTools = true;
      }
      continue;
    }

    // Strip color field (not supported by Gemini CLI, causes validation error)
    if (trimmed.startsWith('color:')) continue;

    // Collect allowed-tools/tools array items
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        const mapped = convertGeminiToolName(trimmed.substring(2).trim());
        if (mapped) tools.push(mapped);
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
      }
    }

    if (!inAllowedTools && !inSkills) {
      newLines.push(line);
    }
  }

  // Add tools as YAML array (Gemini requires array format)
  if (tools.length > 0) {
    newLines.push('tools:');
    for (const tool of tools) {
      newLines.push(`  - ${tool}`);
    }
  }

  const newFrontmatter = newLines.join('\n').trim();

  // Escape ${VAR} patterns in agent body for Gemini CLI compatibility.
  // Gemini's templateString() treats all ${word} patterns as template variables
  // and throws "Template validation failed: Missing required input parameters"
  // when they can't be resolved. FASE agents use ${PHASE}, ${PLAN}, etc. as
  // shell variables in bash code blocks — convert to $VAR (no braces) which
  // is equivalent bash and invisible to Gemini's /\$\{(\w+)\}/g regex.
  const escapedBody = body.replace(/\$\{(\w+)\}/g, '$$$1');

  return `---\n${newFrontmatter}\n---${stripSubTags(escapedBody)}`;
}

function convertClaudeToOpencodeFrontmatter(content) {
  // Replace tool name references in content (applies to all files)
  let convertedContent = content;
  convertedContent = convertedContent.replace(/\bAskUserQuestion\b/g, 'question');
  convertedContent = convertedContent.replace(/\bSlashCommand\b/g, 'skill');
  convertedContent = convertedContent.replace(/\bTodoWrite\b/g, 'todowrite');
  // Replace /fase:command with /fase-command for opencode (flat command structure)
  convertedContent = convertedContent.replace(/\/fase:/g, '/fase-');
  // Replace ~/.claude and $HOME/.claude with OpenCode's config location
  convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.config/opencode');
  convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '$HOME/.config/opencode');
  // Replace ~/.fase and $HOME/.fase with OpenCode's config location
  convertedContent = convertedContent.replace(/~\/\.fase\b/g, '~/.config/opencode/fase');
  convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '$HOME/.config/opencode/fase');
  // Replace general-purpose subagent type with OpenCode's equivalent "general"
  convertedContent = convertedContent.replace(/subagent_type="general-purpose"/g, 'subagent_type="general"');

  // Check if content has frontmatter
  if (!convertedContent.startsWith('---')) {
    return convertedContent;
  }

  // Find the end of frontmatter
  const endIndex = convertedContent.indexOf('---', 3);
  if (endIndex === -1) {
    return convertedContent;
  }

  const frontmatter = convertedContent.substring(3, endIndex).trim();
  const body = convertedContent.substring(endIndex + 3);

  // Parse frontmatter line by line (simple YAML parsing)
  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const allowedTools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect start of allowed-tools array
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    // Detect inline tools: field (comma-separated string)
    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        // Parse comma-separated tools
        const tools = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        allowedTools.push(...tools);
      }
      continue;
    }

    // Remove name: field - opencode uses filename for command name
    if (trimmed.startsWith('name:')) {
      continue;
    }

    // Convert color names to hex for opencode
    if (trimmed.startsWith('color:')) {
      const colorValue = trimmed.substring(6).trim().toLowerCase();
      const hexColor = colorNameToHex[colorValue];
      if (hexColor) {
        newLines.push(`color: "${hexColor}"`);
      } else if (colorValue.startsWith('#')) {
        // Validate hex color format (#RGB or #RRGGBB)
        if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(colorValue)) {
          // Already hex and valid, keep as is
          newLines.push(line);
        }
        // Skip invalid hex colors
      }
      // Skip unknown color names
      continue;
    }

    // Collect allowed-tools items
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        allowedTools.push(trimmed.substring(2).trim());
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        // End of array, new field started
        inAllowedTools = false;
      }
    }

    // Keep other fields (including name: which opencode ignores)
    if (!inAllowedTools) {
      newLines.push(line);
    }
  }

  // Add tools object if we had allowed-tools or tools
  if (allowedTools.length > 0) {
    newLines.push('tools:');
    for (const tool of allowedTools) {
      newLines.push(`  ${convertToolName(tool)}: true`);
    }
  }

  // Rebuild frontmatter (body already has tool names converted)
  const newFrontmatter = newLines.join('\n').trim();
  return `---\n${newFrontmatter}\n---${body}`;
}

/**
 * Convert Claude Code markdown command to Gemini TOML format
 * @param {string} content - Markdown file content with YAML frontmatter
 * @returns {string} - TOML content
 */
function convertClaudeToGeminiToml(content) {
  // Check if content has frontmatter
  if (!content.startsWith('---')) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();
  
  // Extract description from frontmatter
  let description = '';
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim();
      break;
    }
  }

  // Construct TOML
  let toml = '';
  if (description) {
    toml += `description = ${JSON.stringify(description)}\n`;
  }
  
  toml += `prompt = ${JSON.stringify(body)}\n`;
  
  return toml;
}

/**
 * Copy commands to a flat structure for OpenCode
 * OpenCode expects: command/fase-help.md (invoked as /fase-help)
 * Source structure: bin/comandos/help.md
 *
 * @param {string} srcDir - Source directory (e.g., bin/comandos/)
 * @param {string} destDir - Destination directory (e.g., command/)
 * @param {string} prefix - Prefix for filenames (e.g., 'fase')
 * @param {string} pathPrefix - Path prefix for file references
 * @param {string} runtime - Target runtime ('claude' or 'opencode')
 */
function copyFlattenedCommands(srcDir, destDir, prefix, pathPrefix, runtime) {
  if (!fs.existsSync(srcDir)) {
    return;
  }
  
  // Remove old fase-*.md files before copying new ones
  if (fs.existsSync(destDir)) {
    for (const file of fs.readdirSync(destDir)) {
      if (file.startsWith(`${prefix}-`) && file.endsWith('.md')) {
        fs.unlinkSync(path.join(destDir, file));
      }
    }
  } else {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse into subdirectories, adding to prefix
      // e.g., bin/comandos/debug/start.md -> command/fase-debug-start.md
      copyFlattenedCommands(srcPath, destDir, `${prefix}-${entry.name}`, pathPrefix, runtime);
    } else if (entry.name.endsWith('.md')) {
      // Flatten: help.md -> fase-help.md
      const baseName = entry.name.replace('.md', '');
      const destName = `${prefix}-${baseName}.md`;
      const destPath = path.join(destDir, destName);

      let content = fs.readFileSync(srcPath, 'utf8');
      const globalClaudeRegex = /~\/\.claude\//g;
      const globalClaudeHomeRegex = /\$HOME\/\.claude\//g;
      const localClaudeRegex = /\.\/\.claude\//g;
      const opencodeDirRegex = /~\/\.opencode\//g;
      const globalFaseRegex = /~\/\.fase\//g;
      const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
      const sharedPath = SHARED_DIR.replace(/\\/g, '/') + '/';
      const sharedHomePath = '$HOME/.fase-ai/';
      content = content.replace(globalClaudeRegex, pathPrefix);
      content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
      content = content.replace(localClaudeRegex, `./${getDirName(runtime)}/`);
      content = content.replace(opencodeDirRegex, pathPrefix);
      content = content.replace(globalFaseRegex, sharedPath);
      content = content.replace(globalFaseHomeRegex, sharedHomePath);
      content = processAttribution(content, getCommitAttribution(runtime));
      content = convertClaudeToOpencodeFrontmatter(content);

      fs.writeFileSync(destPath, content);
    }
  }
}

function listCodexSkillNames(skillsDir, prefix = 'fase-') {
  if (!fs.existsSync(skillsDir)) return [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith(prefix))
    .filter(entry => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map(entry => entry.name)
    .sort();
}

function copyCommandsAsCodexSkills(srcDir, skillsDir, prefix, pathPrefix, runtime) {
  if (!fs.existsSync(srcDir)) {
    return;
  }

  fs.mkdirSync(skillsDir, { recursive: true });

  // Remove previous FASE Codex skills to avoid stale command skills.
  const existing = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const entry of existing) {
    if (entry.isDirectory() && entry.name.startsWith(`${prefix}-`)) {
      fs.rmSync(path.join(skillsDir, entry.name), { recursive: true });
    }
  }

  function recurse(currentSrcDir, currentPrefix) {
    const entries = fs.readdirSync(currentSrcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(currentSrcDir, entry.name);
      if (entry.isDirectory()) {
        recurse(srcPath, `${currentPrefix}-${entry.name}`);
        continue;
      }

      if (!entry.name.endsWith('.md')) {
        continue;
      }

      const baseName = entry.name.replace('.md', '');
      const skillName = `${currentPrefix}-${baseName}`;
      const skillDir = path.join(skillsDir, skillName);
      fs.mkdirSync(skillDir, { recursive: true });

      let content = fs.readFileSync(srcPath, 'utf8');
      const globalClaudeRegex = /~\/\.claude\//g;
      const globalClaudeHomeRegex = /\$HOME\/\.claude\//g;
      const localClaudeRegex = /\.\/\.claude\//g;
      const codexDirRegex = /~\/\.codex\//g;
      const globalFaseRegex = /~\/\.fase\//g;
      const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
      const sharedPath = SHARED_DIR.replace(/\\/g, '/') + '/';
      const sharedHomePath = '$HOME/.fase-ai/';
      content = content.replace(globalClaudeRegex, pathPrefix);
      content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
      content = content.replace(localClaudeRegex, `./${getDirName(runtime)}/`);
      content = content.replace(codexDirRegex, pathPrefix);
      content = content.replace(globalFaseRegex, sharedPath);
      content = content.replace(globalFaseHomeRegex, sharedHomePath);
      content = processAttribution(content, getCommitAttribution(runtime));
      content = convertClaudeCommandToCodexSkill(content, skillName);

      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
    }
  }

  recurse(srcDir, prefix);
}

/**
 * Recursively copy directory, replacing paths in .md files
 * Deletes existing destDir first to remove orphaned files from previous versions
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string} pathPrefix - Path prefix for file references
 * @param {string} runtime - Target runtime ('claude', 'opencode', 'gemini', 'codex')
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix, runtime, isCommand = false) {
  const isOpencode = runtime === 'opencode';
  const isCodex = runtime === 'codex';
  const dirName = getDirName(runtime);

  // Clean install: remove existing destination to prevent orphaned files
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix, runtime, isCommand);
    } else if (entry.name.endsWith('.md')) {
      // Replace ~/.claude/ and $HOME/.claude/ and ./.claude/ with runtime-appropriate paths
      let content = fs.readFileSync(srcPath, 'utf8');
      const globalClaudeRegex = /~\/\.claude\//g;
      const globalClaudeHomeRegex = /\$HOME\/\.claude\//g;
      const localClaudeRegex = /\.\/\.claude\//g;
      const globalFaseRegex = /~\/\.fase\//g;
      const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
      const sharedPath = SHARED_DIR.replace(/\\/g, '/') + '/';
      const sharedHomePath = '$HOME/.fase-ai/';
      content = content.replace(globalClaudeRegex, pathPrefix);
      content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
      content = content.replace(localClaudeRegex, `./${dirName}/`);
      content = content.replace(globalFaseRegex, sharedPath);
      content = content.replace(globalFaseHomeRegex, sharedHomePath);
      content = processAttribution(content, getCommitAttribution(runtime));

      // Convert frontmatter for opencode compatibility
      if (isOpencode) {
        content = convertClaudeToOpencodeFrontmatter(content);
        fs.writeFileSync(destPath, content);
      } else if (runtime === 'gemini') {
        if (isCommand) {
          // Convert to TOML for Gemini (strip <sub> tags — terminals can't render subscript)
          content = stripSubTags(content);
          const tomlContent = convertClaudeToGeminiToml(content);
          // Replace extension with .toml
          const tomlPath = destPath.replace(/\.md$/, '.toml');
          fs.writeFileSync(tomlPath, tomlContent);
        } else {
          fs.writeFileSync(destPath, content);
        }
      } else if (isCodex) {
        content = convertClaudeToCodexMarkdown(content);
        fs.writeFileSync(destPath, content);
      } else {
        fs.writeFileSync(destPath, content);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Clean up orphaned files from previous FASE versions
 */
function cleanupOrphanedFiles(configDir) {
  const orphanedFiles = [
    'hooks/fase-notify.sh',  // Removed in v1.6.x
    'hooks/statusline.js',  // Renamed to fase-statusline.js in v1.9.0
  ];

  for (const relPath of orphanedFiles) {
    const fullPath = path.join(configDir, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`  ${green}✓${reset} Removido arquivo obsoleto ${relPath}`);
    }
  }

  // Migration v3.2.0: remove per-provider template/reference copies
  // These now live in shared ~/.fase-ai/ (installed once by installSharedContent)
  const faseDir = path.join(configDir, 'fase');
  if (fs.existsSync(faseDir)) {
    const migratedDirs = ['templates', 'references'];
    for (const dirName of migratedDirs) {
      const dirPath = path.join(faseDir, dirName);
      if (fs.existsSync(dirPath)) {
        try {
          fs.rmSync(dirPath, { recursive: true });
          console.log(`  ${green}✓${reset} Removido ${dirName} obsoleto de fase/ (agora em ~/.fase-ai/)`);
        } catch (e) {
          // Silently ignore if already deleted or permission issues
        }
      }
    }
  }
}

/**
 * Clean up orphaned hook registrations from settings.json
 */
function cleanupOrphanedHooks(settings) {
  const orphanedHookPatterns = [
    'fase-notify.sh',  // Removed in v1.6.x
    'hooks/statusline.js',  // Renamed to fase-statusline.js in v1.9.0
    'fase-intel-index.js',  // Removed in v1.9.2
    'fase-intel-session.js',  // Removed in v1.9.2
    'fase-intel-prune.js',  // Removed in v1.9.2
    'fase-check-update.js',  // Gemini hooks that may not exist in local installs
    'fase-context-monitor.js',  // Gemini hooks that may not exist in local installs
    'fase-statusline.js',  // May reference hooks/ dir that doesn't exist
  ];

  let cleanedHooks = false;

  // Check all hook event types (Stop, SessionStart, etc.)
  if (settings.hooks) {
    for (const eventType of Object.keys(settings.hooks)) {
      const hookEntries = settings.hooks[eventType];
      if (Array.isArray(hookEntries)) {
        // Filter out entries that contain orphaned hooks
        const filtered = hookEntries.filter(entry => {
          if (entry.hooks && Array.isArray(entry.hooks)) {
            // Check if any hook in this entry matches orphaned patterns
            const hasOrphaned = entry.hooks.some(h =>
              h.command && orphanedHookPatterns.some(pattern => h.command.includes(pattern))
            );
            if (hasOrphaned) {
              cleanedHooks = true;
              return false;  // Remove this entry
            }
          }
          return true;  // Keep this entry
        });
        settings.hooks[eventType] = filtered;
      }
    }
  }

  if (cleanedHooks) {
    console.log(`  ${green}✓${reset} Removidos registros de hooks obsoletos`);
  }

  // Fix #330: Update statusLine if it points to old FASE statusline.js path
  // Only match the specific old FASE path pattern (hooks/statusline.js),
  // not third-party statusline scripts that happen to contain 'statusline.js'
  if (settings.statusLine && settings.statusLine.command &&
      /hooks[\/\\]statusline\.js/.test(settings.statusLine.command)) {
    settings.statusLine.command = settings.statusLine.command.replace(
      /hooks([\/\\])statusline\.js/,
      'hooks$1fase-statusline.js'
    );
    console.log(`  ${green}✓${reset} Atualizado caminho da statusline (hooks/statusline.js → hooks/fase-statusline.js)`);
  }

  return settings;
}

/**
 * Uninstall FASE from the specified directory for a specific runtime
 * Removes only FASE-specific files/directories, preserves user content
 * @param {boolean} isGlobal - Whether to uninstall from global or local
 * @param {string} runtime - Target runtime ('claude', 'opencode', 'gemini', 'codex')
 */
function uninstall(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const isCodex = runtime === 'codex';
  const dirName = getDirName(runtime);

  // Get the target directory based on runtime and install type
  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  let runtimeLabel = 'Claude Code';
  if (runtime === 'opencode') runtimeLabel = 'OpenCode';
  if (runtime === 'gemini') runtimeLabel = 'Gemini';
  if (runtime === 'codex') runtimeLabel = 'Codex';

  console.log(`  Desinstalando FASE de ${cyan}${runtimeLabel}${reset} em ${cyan}${locationLabel}${reset}\n`);

  // Check if target directory exists
  if (!fs.existsSync(targetDir)) {
    console.log(`  ${yellow}⚠${reset} Diretório não existe: ${locationLabel}`);
    console.log(`  Nada a desinstalar.\n`);
    return;
  }

  let removedCount = 0;

  // 1. Remove FASE commands/skills
  if (isOpencode) {
    // OpenCode: remove command/fase-*.md files
    const commandDir = path.join(targetDir, 'command');
    if (fs.existsSync(commandDir)) {
      const files = fs.readdirSync(commandDir);
      for (const file of files) {
        if (file.startsWith('fase-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(commandDir, file));
          removedCount++;
        }
      }
      console.log(`  ${green}✓${reset} Removidos comandos FASE de command/`);
    }
  } else if (isCodex) {
    // Codex: remove skills/fase-*/SKILL.md skill directories
    const skillsDir = path.join(targetDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      let skillCount = 0;
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('fase-')) {
          fs.rmSync(path.join(skillsDir, entry.name), { recursive: true });
          skillCount++;
        }
      }
      if (skillCount > 0) {
        removedCount++;
        console.log(`  ${green}✓${reset} Removidas ${skillCount} skills do Codex`);
      }
    }

    // Codex: remove FASE agent .toml config files
    const codexAgentsDir = path.join(targetDir, 'agents');
    if (fs.existsSync(codexAgentsDir)) {
      const tomlFiles = fs.readdirSync(codexAgentsDir);
      let tomlCount = 0;
      for (const file of tomlFiles) {
        if (file.startsWith('fase-') && file.endsWith('.toml')) {
          fs.unlinkSync(path.join(codexAgentsDir, file));
          tomlCount++;
        }
      }
      if (tomlCount > 0) {
        removedCount++;
        console.log(`  ${green}✓${reset} Removidos ${tomlCount} configs .toml de agentes`);
      }
    }

    // Codex: clean FASE sections from config.toml
    const configPath = path.join(targetDir, 'config.toml');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const cleaned = stripGsdFromCodexConfig(content);
      if (cleaned === null) {
        // File is empty after stripping — delete it
        fs.unlinkSync(configPath);
        removedCount++;
        console.log(`  ${green}✓${reset} Removido config.toml (era exclusivo do FASE)`);
      } else if (cleaned !== content) {
        fs.writeFileSync(configPath, cleaned);
        removedCount++;
        console.log(`  ${green}✓${reset} Removidas seções do FASE do config.toml`);
      }
    }
  } else {
    // Claude Code & Gemini: remove commands/fase/ directory
    const faseCommandsDir = path.join(targetDir, 'commands', 'fase');
    if (fs.existsSync(faseCommandsDir)) {
      fs.rmSync(faseCommandsDir, { recursive: true });
      removedCount++;
      console.log(`  ${green}✓${reset} Removido bin/comandos/`);
    }
  }

  // 2. Remove fase-ai directory
  const faseDir = path.join(targetDir, 'fase-ai');
  if (fs.existsSync(faseDir)) {
    fs.rmSync(faseDir, { recursive: true });
    removedCount++;
    console.log(`  ${green}✓${reset} Removido fase-ai/`);
  }

  // 3. Remove FASE agents (fase-*.md files only)
  const agentsDir = path.join(targetDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const files = fs.readdirSync(agentsDir);
    let agentCount = 0;
    for (const file of files) {
      if (file.startsWith('fase-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(agentsDir, file));
        agentCount++;
      }
    }
    if (agentCount > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} Removidos agentes FASE`);
    }
  }

  // 4. Remove FASE hooks
  const hooksDir = path.join(targetDir, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const faseHooks = ['fase-statusline.js', 'fase-check-update.js', 'fase-check-update.sh', 'fase-context-monitor.js'];
    let hookCount = 0;
    for (const hook of faseHooks) {
      const hookPath = path.join(hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
        hookCount++;
      }
    }
    if (hookCount > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} Removidos ${hookCount} hooks FASE`);
    }
  }

  // 5. Remove FASE package.json (CommonJS mode marker)
  const pkgJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const content = fs.readFileSync(pkgJsonPath, 'utf8').trim();
      // Only remove if it's our minimal CommonJS marker
      if (content === '{"type":"commonjs"}') {
        fs.unlinkSync(pkgJsonPath);
        removedCount++;
        console.log(`  ${green}✓${reset} Removido package.json do FASE`);
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  // 6. Clean up settings.json (remove FASE hooks and statusline)
  const settingsPath = path.join(targetDir, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    let settings = readSettings(settingsPath);
    let settingsModified = false;

    // Remove FASE statusline if it references our hook
    if (settings.statusLine && settings.statusLine.command &&
        settings.statusLine.command.includes('fase-statusline')) {
      delete settings.statusLine;
      settingsModified = true;
      console.log(`  ${green}✓${reset} Removida statusline do FASE das configurações`);
    }

    // Remove FASE hooks from SessionStart
    if (settings.hooks && settings.hooks.SessionStart) {
      const before = settings.hooks.SessionStart.length;
      settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry => {
        if (entry.hooks && Array.isArray(entry.hooks)) {
          // Filter out FASE hooks
          const hasGsdHook = entry.hooks.some(h =>
            h.command && (h.command.includes('fase-check-update') || h.command.includes('fase-statusline'))
          );
          return !hasGsdHook;
        }
        return true;
      });
      if (settings.hooks.SessionStart.length < before) {
        settingsModified = true;
        console.log(`  ${green}✓${reset} Removidos hooks FASE das configurações`);
      }
      // Clean up empty array
      if (settings.hooks.SessionStart.length === 0) {
        delete settings.hooks.SessionStart;
      }
    }

    // Remove FASE hooks from PostToolUse and AfterTool (Gemini uses AfterTool)
    for (const eventName of ['PostToolUse', 'AfterTool']) {
      if (settings.hooks && settings.hooks[eventName]) {
        const before = settings.hooks[eventName].length;
        settings.hooks[eventName] = settings.hooks[eventName].filter(entry => {
          if (entry.hooks && Array.isArray(entry.hooks)) {
            const hasGsdHook = entry.hooks.some(h =>
              h.command && h.command.includes('fase-context-monitor')
            );
            return !hasGsdHook;
          }
          return true;
        });
        if (settings.hooks[eventName].length < before) {
          settingsModified = true;
          console.log(`  ${green}✓${reset} Removido hook do monitor de contexto das configurações`);
        }
        if (settings.hooks[eventName].length === 0) {
          delete settings.hooks[eventName];
        }
      }
    }

    // Clean up empty hooks object
    if (settings.hooks && Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }

    if (settingsModified) {
      writeSettings(settingsPath, settings);
      removedCount++;
    }
  }

  // 7. Remove fase-file-manifest.json
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  if (fs.existsSync(manifestPath)) {
    try {
      fs.unlinkSync(manifestPath);
      removedCount++;
      console.log(`  ${green}✓${reset} Removido fase-file-manifest.json`);
    } catch (e) {
      // Ignore deletion errors
    }
  }

  // 8. For OpenCode, clean up permissions from opencode.json
  if (isOpencode) {
    // For local uninstalls, clean up ./.opencode/opencode.json
    // For global uninstalls, clean up ~/.config/opencode/opencode.json
    const opencodeConfigDir = isGlobal
      ? getOpencodeGlobalDir()
      : path.join(process.cwd(), '.opencode');
    const configPath = path.join(opencodeConfigDir, 'opencode.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let modified = false;

        // Remove FASE permission entries
        if (config.permission) {
          for (const permType of ['read', 'external_directory']) {
            if (config.permission[permType]) {
              const keys = Object.keys(config.permission[permType]);
              for (const key of keys) {
                if (key.includes('fase-ai')) {
                  delete config.permission[permType][key];
                  modified = true;
                }
              }
              // Clean up empty objects
              if (Object.keys(config.permission[permType]).length === 0) {
                delete config.permission[permType];
              }
            }
          }
          if (Object.keys(config.permission).length === 0) {
            delete config.permission;
          }
        }

        if (modified) {
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
          removedCount++;
          console.log(`  ${green}✓${reset} Removidas permissões FASE do opencode.json`);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }

  if (removedCount === 0) {
    console.log(`  ${yellow}⚠${reset} Nenhum arquivo FASE encontrado para remover.`);
  }

  // Check if shared ~/.fase-ai/ should be removed (v3.2.0+)
  // Only offer removal if this is the last installed runtime
  const remaining = detectInstalledRuntimes();
  if (remaining.length === 0) {
    console.log();
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let answered = false;
    rl.on('close', () => {
      if (!answered) {
        answered = true;
        console.log(`\n  ${dim}~/.fase-ai/ preservado${reset}\n`);
      }
    });

    rl.question(`  ${yellow}Remover ~/.fase-ai/ (compartilhado)?${reset} [s/N]: `, (answer) => {
      answered = true;
      rl.close();

      if (answer.trim().toLowerCase() === 's') {
        try {
          if (fs.existsSync(SHARED_DIR)) {
            fs.rmSync(SHARED_DIR, { recursive: true });
            console.log(`  ${green}✓${reset} ~/.fase-ai/ removido\n`);
          }
        } catch (e) {
          console.log(`  ${yellow}⚠${reset} Erro ao remover ~/.fase-ai/: ${e.message}\n`);
        }
      } else {
        console.log(`  ${dim}~/.fase-ai/ preservado${reset}\n`);
      }
    });
  } else {
    console.log(`\n  ${dim}~/.fase-ai/ preservado (usado por: ${remaining.join(', ')})${reset}\n`);
  }

  console.log(`  ${green}Pronto!${reset} FASE foi desinstalado de ${runtimeLabel}.
  Seus outros arquivos e configurações foram preservados.\n`);
}

/**
 * Parse JSONC (JSON with Comments) by stripping comments and trailing commas.
 * OpenCode supports JSONC format via jsonc-parser, so users may have comments.
 * This is a lightweight inline parser to avoid adding dependencies.
 */
function parseJsonc(content) {
  // Strip BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // Remove single-line and block comments while preserving strings
  let result = '';
  let inString = false;
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    const next = content[i + 1];

    if (inString) {
      result += char;
      // Handle escape sequences
      if (char === '\\' && i + 1 < content.length) {
        result += next;
        i += 2;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      i++;
    } else {
      if (char === '"') {
        inString = true;
        result += char;
        i++;
      } else if (char === '/' && next === '/') {
        // Skip single-line comment until end of line
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
      } else if (char === '/' && next === '*') {
        // Skip block comment
        i += 2;
        while (i < content.length - 1 && !(content[i] === '*' && content[i + 1] === '/')) {
          i++;
        }
        i += 2; // Skip closing */
      } else {
        result += char;
        i++;
      }
    }
  }

  // Remove trailing commas before } or ]
  result = result.replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(result);
}

/**
 * Configure OpenCode permissions to allow reading FASE reference docs
 * This prevents permission prompts when FASE accesses the fase-ai directory
 * @param {boolean} isGlobal - Whether this is a global or local install
 */
function configureOpencodePermissions(isGlobal = true) {
  // For local installs, use ./.opencode/opencode.json
  // For global installs, use ~/.config/opencode/opencode.json
  const opencodeConfigDir = isGlobal
    ? getOpencodeGlobalDir()
    : path.join(process.cwd(), '.opencode');
  const configPath = path.join(opencodeConfigDir, 'opencode.json');

  // Ensure config directory exists
  fs.mkdirSync(opencodeConfigDir, { recursive: true });

  // Read existing config or create empty object
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      config = parseJsonc(content);
    } catch (e) {
      // Cannot parse - DO NOT overwrite user's config
      console.log(`  ${yellow}⚠${reset} Não foi possível analisar opencode.json - ignorando configuração de permissões`);
      console.log(`    ${dim}Motivo: ${e.message}${reset}`);
      console.log(`    ${dim}Sua configuração NÃO foi modificada. Corrija a sintaxe manualmente se necessário.${reset}`);
      return;
    }
  }

  // Ensure permission structure exists
  if (!config.permission) {
    config.permission = {};
  }

  // Build the FASE path using the actual config directory
  // Use ~ shorthand if it's in the default location, otherwise use full path
  const defaultConfigDir = path.join(os.homedir(), '.config', 'opencode');
  const fasePath = opencodeConfigDir === defaultConfigDir
    ? '~/.config/opencode/fase-ai/*'
    : `${opencodeConfigDir.replace(/\\/g, '/')}/fase-ai/*`;
  
  let modified = false;

  // Configure read permission
  if (!config.permission.read || typeof config.permission.read !== 'object') {
    config.permission.read = {};
  }
  if (config.permission.read[fasePath] !== 'allow') {
    config.permission.read[fasePath] = 'allow';
    modified = true;
  }

  // Configure external_directory permission (the safety guard for paths outside project)
  if (!config.permission.external_directory || typeof config.permission.external_directory !== 'object') {
    config.permission.external_directory = {};
  }

  // For local installs, also configure permissions for the command/ directory so OpenCode can discover commands
  if (!isGlobal) {
    const commandPath = `${opencodeConfigDir.replace(/\\/g, '/')}/command/*`;
    if (config.permission.read[commandPath] !== 'allow') {
      config.permission.read[commandPath] = 'allow';
      modified = true;
    }
    if (config.permission.external_directory[commandPath] !== 'allow') {
      config.permission.external_directory[commandPath] = 'allow';
      modified = true;
    }
  }
  if (!config.permission.external_directory[fasePath]) {
    config.permission.external_directory[fasePath] = 'allow';
    modified = true;
  }

  if (!modified) {
    return; // Already configured
  }

  // Write config back
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`  ${green}✓${reset} Configurada permissão de leitura para docs do FASE`);
}

/**
 * Verify a directory exists and contains files
 */
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ${yellow}✗${reset} Falha ao instalar ${description}: diretório não foi criado`);
    return false;
  }
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      console.error(`  ${yellow}✗${reset} Falha ao instalar ${description}: diretório está vazio`);
      return false;
    }
  } catch (e) {
    console.error(`  ${yellow}✗${reset} Falha ao instalar ${description}: ${e.message}`);
    return false;
  }
  return true;
}

/**
 * Verify a file exists
 */
function verifyFileInstalled(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ${yellow}✗${reset} Falha ao instalar ${description}: arquivo não foi criado`);
    return false;
  }
  return true;
}

/**
 * Install to the specified directory for a specific runtime
 * @param {boolean} isGlobal - Whether to install globally or locally
 * @param {string} runtime - Target runtime ('claude', 'opencode', 'gemini', 'codex')
 */

// ──────────────────────────────────────────────────────
// Local Patch Persistence
// ──────────────────────────────────────────────────────

const PATCHES_DIR_NAME = 'fase-local-patches';
const MANIFEST_NAME = 'fase-file-manifest.json';

/**
 * Compute SHA256 hash of file contents
 */
function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Recursively collect all files in dir with their hashes
 */
function generateManifest(dir, baseDir) {
  if (!baseDir) baseDir = dir;
  const manifest = {};
  if (!fs.existsSync(dir)) return manifest;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      Object.assign(manifest, generateManifest(fullPath, baseDir));
    } else {
      manifest[relPath] = fileHash(fullPath);
    }
  }
  return manifest;
}

/**
 * Write file manifest after installation for future modification detection
 */
function writeManifest(configDir, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const isCodex = runtime === 'codex';
  const faseDir = path.join(configDir, 'fase-ai');
  const commandsDir = path.join(configDir, 'commands', 'fase');
  const opencodeCommandDir = path.join(configDir, 'command');
  const codexSkillsDir = path.join(configDir, 'skills');
  const agentsDir = path.join(configDir, 'agents');
  const manifest = { version: pkg.version, timestamp: new Date().toISOString(), files: {} };

  const faseHashes = generateManifest(faseDir);
  for (const [rel, hash] of Object.entries(faseHashes)) {
    manifest.files['fase-ai/' + rel] = hash;
  }
  if (!isOpencode && !isCodex && fs.existsSync(commandsDir)) {
    const cmdHashes = generateManifest(commandsDir);
    for (const [rel, hash] of Object.entries(cmdHashes)) {
      manifest.files['commands/fase/' + rel] = hash;
    }
  }
  if (isOpencode && fs.existsSync(opencodeCommandDir)) {
    for (const file of fs.readdirSync(opencodeCommandDir)) {
      if (file.startsWith('fase-') && file.endsWith('.md')) {
        manifest.files['command/' + file] = fileHash(path.join(opencodeCommandDir, file));
      }
    }
  }
  if (isCodex && fs.existsSync(codexSkillsDir)) {
    for (const skillName of listCodexSkillNames(codexSkillsDir)) {
      const skillRoot = path.join(codexSkillsDir, skillName);
      const skillHashes = generateManifest(skillRoot);
      for (const [rel, hash] of Object.entries(skillHashes)) {
        manifest.files[`skills/${skillName}/${rel}`] = hash;
      }
    }
  }
  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir)) {
      if (file.startsWith('fase-') && file.endsWith('.md')) {
        manifest.files['agents/' + file] = fileHash(path.join(agentsDir, file));
      }
    }
  }

  fs.writeFileSync(path.join(configDir, MANIFEST_NAME), JSON.stringify(manifest, null, 2));
  return manifest;
}

/**
 * Detect user-modified FASE files by comparing against install manifest.
 * Backs up modified files to fase-local-patches/ for reapply after update.
 */
function saveLocalPatches(configDir) {
  const manifestPath = path.join(configDir, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) return [];

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { return []; }

  const patchesDir = path.join(configDir, PATCHES_DIR_NAME);
  const modified = [];

  for (const [relPath, originalHash] of Object.entries(manifest.files || {})) {
    const fullPath = path.join(configDir, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const currentHash = fileHash(fullPath);
    if (currentHash !== originalHash) {
      const backupPath = path.join(patchesDir, relPath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(fullPath, backupPath);
      modified.push(relPath);
    }
  }

  if (modified.length > 0) {
    const meta = {
      backed_up_at: new Date().toISOString(),
      from_version: manifest.version,
      files: modified
    };
    fs.writeFileSync(path.join(patchesDir, 'backup-meta.json'), JSON.stringify(meta, null, 2));
    console.log('  ' + yellow + 'i' + reset + '  Encontrado(s) ' + modified.length + ' arquivo(s) FASE modificado(s) localmente — salvo(s) em ' + PATCHES_DIR_NAME + '/');
    for (const f of modified) {
      console.log('     ' + dim + f + reset);
    }
  }
  return modified;
}

/**
 * After install, report backed-up patches for user to reapply.
 */
function reportLocalPatches(configDir, runtime = 'claude') {
  const patchesDir = path.join(configDir, PATCHES_DIR_NAME);
  const metaPath = path.join(patchesDir, 'backup-meta.json');
  if (!fs.existsSync(metaPath)) return [];

  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { return []; }

  if (meta.files && meta.files.length > 0) {
    const reapplyCommand = runtime === 'opencode'
      ? '/fase-reaplicar-patches'
      : runtime === 'codex'
        ? '$fase-reaplicar-patches'
        : '/fase:reaplicar-patches';
    console.log('');
    console.log('  ' + yellow + 'Patches locais detectados' + reset + ' (da v' + meta.from_version + '):');
    for (const f of meta.files) {
      console.log('     ' + cyan + f + reset);
    }
    console.log('');
    console.log('  Suas modificações estão salvas em ' + cyan + PATCHES_DIR_NAME + '/' + reset);
    console.log('  Execute ' + cyan + reapplyCommand + reset + ' para mesclá-las na nova versão.');
    console.log('  Ou compare e mescle os arquivos manualmente.');
    console.log('');
  }
  return meta.files || [];
}

/**
 * Recursively copy directory (helper for shared content)
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Install shared FASE content to ~/.fase-ai/ (v3.2.0+)
 * Templates, references, and VERSION/CHANGELOG shared across all runtimes
 */
function installSharedContent() {
  const src = path.join(__dirname, 'fase-shared');
  if (!fs.existsSync(src)) {
    return; // source dir not present, gracefully skip
  }

  // Copy templates/ and references/ to ~/.fase-ai/
  copyDir(src, SHARED_DIR);

  // Write VERSION to shared dir
  const versionDest = path.join(SHARED_DIR, 'VERSION');
  try {
    fs.writeFileSync(versionDest, pkg.version);
  } catch (e) {
    console.error(`  ${red}✗${reset} Erro ao gravar VERSION em ${versionDest}`);
  }

  // Copy CHANGELOG to shared dir
  const changelogSrc = path.join(__dirname, 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    try {
      fs.copyFileSync(changelogSrc, path.join(SHARED_DIR, 'CHANGELOG.md'));
    } catch (e) {
      // CHANGELOG copy is optional
    }
  }

  console.log(`  ${green}✓${reset} Instalado ~/.fase-ai/ (compartilhado)`);
}

function install(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const isGemini = runtime === 'gemini';
  const isCodex = runtime === 'codex';
  const dirName = getDirName(runtime);
  const src = __dirname;

  // Get the target directory based on runtime and install type
  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  // Path prefix for file references in markdown content
  // For global installs: use full path
  // For local installs: use relative
  const pathPrefix = isGlobal
    ? `${targetDir.replace(/\\/g, '/')}/`
    : `./${dirName}/`;

  let runtimeLabel = 'Claude Code';
  if (isOpencode) runtimeLabel = 'OpenCode';
  if (isGemini) runtimeLabel = 'Gemini';
  if (isCodex) runtimeLabel = 'Codex';

  console.log(`  Instalando para ${cyan}${runtimeLabel}${reset} em ${cyan}${locationLabel}${reset}\n`);

  // Track installation failures
  const failures = [];

  // Save any locally modified FASE files before they get wiped
  saveLocalPatches(targetDir);

  // Clean up orphaned files from previous versions
  cleanupOrphanedFiles(targetDir);

  // OpenCode uses command/ (flat), Codex uses skills/, Claude/Gemini use commands/fase/
  if (isOpencode) {
    // OpenCode: flat structure in command/ directory
    const commandDir = path.join(targetDir, 'command');
    fs.mkdirSync(commandDir, { recursive: true });
    
    // Copy bin/comandos/*.md as command/fase-*.md (flatten structure)
    const faseSrc = path.join(src, 'comandos');
    copyFlattenedCommands(faseSrc, commandDir, 'fase', pathPrefix, runtime);
    if (verifyInstalled(commandDir, 'command/fase-*')) {
      const count = fs.readdirSync(commandDir).filter(f => f.startsWith('fase-')).length;
      console.log(`  ${green}✓${reset} Instalados ${count} comandos em command/`);
    } else {
      failures.push('command/fase-*');
    }
  } else if (isCodex) {
    const skillsDir = path.join(targetDir, 'skills');
    const faseSrc = path.join(src, 'comandos');
    copyCommandsAsCodexSkills(faseSrc, skillsDir, 'fase', pathPrefix, runtime);
    const installedSkillNames = listCodexSkillNames(skillsDir);
    if (installedSkillNames.length > 0) {
      console.log(`  ${green}✓${reset} Instaladas ${installedSkillNames.length} skills em skills/`);
    } else {
      failures.push('skills/fase-*');
    }
  } else {
    // Claude Code & Gemini: nested structure in commands/ directory
    const commandsDir = path.join(targetDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });
    
    const faseSrc = path.join(src, 'comandos');
    const faseDest = path.join(commandsDir, 'fase');
    copyWithPathReplacement(faseSrc, faseDest, pathPrefix, runtime, true);
    if (verifyInstalled(faseDest, 'commands/fase')) {
      console.log(`  ${green}✓${reset} Instalado commands/fase/`);
    } else {
      failures.push('commands/fase');
    }
  }

  // Copy FASE docs with path replacement
  const skillSrc = path.join(src, 'docs');
  const skillDest = path.join(targetDir, 'fase');
  if (fs.existsSync(skillSrc)) {
    copyWithPathReplacement(skillSrc, skillDest, pathPrefix, runtime);
    if (verifyInstalled(skillDest, 'fase')) {
      console.log(`  ${green}✓${reset} Instalado fase/`);
    } else {
      failures.push('fase');
    }
  }

  // Copy agents to agents directory
  const agentsSrc = path.join(src, 'agentes');
  if (fs.existsSync(agentsSrc)) {
    const agentsDest = path.join(targetDir, 'agents');
    fs.mkdirSync(agentsDest, { recursive: true });

    // Remove old FASE agents (fase-*.md) before copying new ones
    if (fs.existsSync(agentsDest)) {
      for (const file of fs.readdirSync(agentsDest)) {
        if (file.startsWith('fase-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(agentsDest, file));
        }
      }
    }

    // Copy new agents
    const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
    for (const entry of agentEntries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
        // Replace ~/.claude/ and $HOME/.claude/ as they are the source of truth in the repo
        const dirRegex = /~\/\.claude\//g;
        const homeDirRegex = /\$HOME\/\.claude\//g;
        const globalFaseRegex = /~\/\.fase\//g;
        const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
        const sharedPath = SHARED_DIR.replace(/\\/g, '/') + '/';
        const sharedHomePath = '$HOME/.fase-ai/';
        content = content.replace(dirRegex, pathPrefix);
        content = content.replace(homeDirRegex, toHomePrefix(pathPrefix));
        content = content.replace(globalFaseRegex, sharedPath);
        content = content.replace(globalFaseHomeRegex, sharedHomePath);
        content = processAttribution(content, getCommitAttribution(runtime));
        // Convert frontmatter for runtime compatibility
        if (isOpencode) {
          content = convertClaudeToOpencodeFrontmatter(content);
        } else if (isGemini) {
          content = convertClaudeToGeminiAgent(content);
        } else if (isCodex) {
          content = convertClaudeAgentToCodexAgent(content);
        }
        fs.writeFileSync(path.join(agentsDest, entry.name), content);
      }
    }
    if (verifyInstalled(agentsDest, 'agents')) {
      console.log(`  ${green}✓${reset} Instalados agentes`);
    } else {
      failures.push('agents');
    }
  }

  // VERSION and CHANGELOG now live in shared ~/.fase-ai/ (installed once via installSharedContent)
  // Per-provider copies removed in v3.2.0 for reduced duplication

  if (!isCodex) {
    // Write package.json to force CommonJS mode for FASE scripts
    // Prevents "require is not defined" errors when project has "type": "module"
    // Node.js walks up looking for package.json - this stops inheritance from project
    const pkgJsonDest = path.join(targetDir, 'package.json');
    try {
      // Ensure target directory exists before writing
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
      }
      fs.accessSync(targetDir, fs.constants.W_OK);
      fs.writeFileSync(pkgJsonDest, '{"type":"commonjs"}\n');
      console.log(`  ${green}✓${reset} Gravado package.json (modo CommonJS)`);
    } catch (err) {
      console.error(`  ${red}✗${reset} Erro ao gravar package.json em ${pkgJsonDest}`);
      console.error(`    ${dim}Verifique permissões de escrita: ${targetDir}${reset}`);
      failures.push('package.json');
    }

    // Copy hooks from hooks/ (compiled alongside install.js)
    // Template paths for the target runtime (replaces '.claude' with correct config dir)
    const hooksSrc = path.join(src, 'hooks');
    if (fs.existsSync(hooksSrc)) {
      try {
        const hooksDest = path.join(targetDir, 'hooks');
        if (!fs.existsSync(hooksDest)) {
          fs.mkdirSync(hooksDest, { recursive: true, mode: 0o755 });
        }
        fs.accessSync(hooksDest, fs.constants.W_OK);
        const hookEntries = fs.readdirSync(hooksSrc);
        const configDirReplacement = getConfigDirFromHome(runtime, isGlobal);
        for (const entry of hookEntries) {
          const srcFile = path.join(hooksSrc, entry);
          if (fs.statSync(srcFile).isFile()) {
            const destFile = path.join(hooksDest, entry);
            // Template .js files to replace '.claude' with runtime-specific config dir
            if (entry.endsWith('.js')) {
              let content = fs.readFileSync(srcFile, 'utf8');
              content = content.replace(/'\.claude'/g, configDirReplacement);
              fs.writeFileSync(destFile, content);
            } else {
              fs.copyFileSync(srcFile, destFile);
            }
          }
        }
        if (verifyInstalled(hooksDest, 'hooks')) {
          console.log(`  ${green}✓${reset} Instalados hooks (empacotados)`);
        } else {
          failures.push('hooks');
        }
      } catch (err) {
        console.error(`  ${red}✗${reset} Erro ao instalar hooks`);
        console.error(`    ${dim}Verifique permissões de escrita: ${targetDir}/hooks${reset}`);
        failures.push('hooks');
      }
    }
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}Instalação incompleta!${reset} Falhou: ${failures.join(', ')}`);
    process.exit(1);
  }

  // Write file manifest for future modification detection
  writeManifest(targetDir, runtime);
  console.log(`  ${green}✓${reset} Gravado manifesto de arquivos (${MANIFEST_NAME})`);

  // Report any backed-up local patches
  reportLocalPatches(targetDir, runtime);

  // Verify no leaked .claude paths in non-Claude runtimes
  if (runtime !== 'claude') {
    const leakedPaths = [];
    function scanForLeakedPaths(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanForLeakedPaths(fullPath);
        } else if ((entry.name.endsWith('.md') || entry.name.endsWith('.toml')) && entry.name !== 'CHANGELOG.md') {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(/(?:~|\$HOME)\/\.claude\b/g);
          if (matches) {
            leakedPaths.push({ file: fullPath.replace(targetDir + '/', ''), count: matches.length });
          }
        }
      }
    }
    scanForLeakedPaths(targetDir);
    if (leakedPaths.length > 0) {
      const totalLeaks = leakedPaths.reduce((sum, l) => sum + l.count, 0);
      console.warn(`\n  ${yellow}⚠${reset}  Encontrada(s) ${totalLeaks} referência(s) de caminho .claude não substituída(s) em ${leakedPaths.length} arquivo(s):`);
      for (const leak of leakedPaths.slice(0, 5)) {
        console.warn(`     ${dim}${leak.file}${reset} (${leak.count})`);
      }
      if (leakedPaths.length > 5) {
        console.warn(`     ${dim}... e mais ${leakedPaths.length - 5} arquivo(s)${reset}`);
      }
      console.warn(`  ${dim}Esses caminhos podem não ser resolvidos corretamente para ${runtimeLabel}.${reset}`);
    }
  }

  if (isCodex) {
    // Generate Codex config.toml and per-agent .toml files
    const agentCount = installCodexConfig(targetDir, agentsSrc);
    console.log(`  ${green}✓${reset} Gerado config.toml com ${agentCount} papéis de agentes`);
    console.log(`  ${green}✓${reset} Gerados ${agentCount} arquivos de config .toml de agentes`);
    return { settingsPath: null, settings: null, statuslineCommand: null, runtime };
  }

  // Configure statusline and hooks in settings.json
  // Gemini uses AfterTool instead of PostToolUse for post-tool hooks
  const postToolEvent = runtime === 'gemini' ? 'AfterTool' : 'PostToolUse';
  const settingsPath = path.join(targetDir, 'settings.json');
  const settings = cleanupOrphanedHooks(readSettings(settingsPath));

  // Check if hooks directory actually exists before building hook commands
  const hooksDest = path.join(targetDir, 'hooks');
  const hooksExist = fs.existsSync(hooksDest);

  const statuslineCommand = hooksExist ? (
    isGlobal
      ? buildHookCommand(targetDir, 'fase-statusline.js')
      : 'node ' + dirName + '/hooks/fase-statusline.js'
  ) : null;

  const updateCheckCommand = hooksExist ? (
    isGlobal
      ? buildHookCommand(targetDir, 'fase-check-update.js')
      : 'node ' + dirName + '/hooks/fase-check-update.js'
  ) : null;

  const contextMonitorCommand = hooksExist ? (
    isGlobal
      ? buildHookCommand(targetDir, 'fase-context-monitor.js')
      : 'node ' + dirName + '/hooks/fase-context-monitor.js'
  ) : null;

  // Enable experimental agents for Gemini CLI (required for custom sub-agents)
  if (isGemini) {
    if (!settings.experimental) {
      settings.experimental = {};
    }
    if (!settings.experimental.enableAgents) {
      settings.experimental.enableAgents = true;
      console.log(`  ${green}✓${reset} Agentes experimentais habilitados`);
    }
  }

  // Configure SessionStart hook for update checking (skip for opencode and if hooks don't exist)
  if (!isOpencode && hooksExist && updateCheckCommand) {
    if (!settings.hooks) {
      settings.hooks = {};
    }
    if (!settings.hooks.SessionStart) {
      settings.hooks.SessionStart = [];
    }

    const hasGsdUpdateHook = settings.hooks.SessionStart.some(entry =>
      entry.hooks && entry.hooks.some(h => h.command && h.command.includes('fase-check-update'))
    );

    if (!hasGsdUpdateHook) {
      settings.hooks.SessionStart.push({
        hooks: [
          {
            type: 'command',
            command: updateCheckCommand
          }
        ]
      });
      console.log(`  ${green}✓${reset} Hook de verificação de atualização configurado`);
    }

    // Configure post-tool hook for context window monitoring
    if (!settings.hooks[postToolEvent]) {
      settings.hooks[postToolEvent] = [];
    }

    const hasContextMonitorHook = settings.hooks[postToolEvent].some(entry =>
      entry.hooks && entry.hooks.some(h => h.command && h.command.includes('fase-context-monitor'))
    );

    if (!hasContextMonitorHook && contextMonitorCommand) {
      settings.hooks[postToolEvent].push({
        hooks: [
          {
            type: 'command',
            command: contextMonitorCommand
          }
        ]
      });
      console.log(`  ${green}✓${reset} Hook de monitor de janela de contexto configurado`);
    }
  }

  return { settingsPath, settings, statuslineCommand, runtime };
}

/**
 * Apply statusline config, then print completion message
 */
function finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline, runtime = 'claude', isGlobal = true) {
  const isOpencode = runtime === 'opencode';
  const isCodex = runtime === 'codex';

  if (shouldInstallStatusline && !isOpencode && !isCodex && statuslineCommand) {
    settings.statusLine = {
      type: 'command',
      command: statuslineCommand
    };
    console.log(`  ${green}✓${reset} Statusline configurada`);
  }

  // Write settings when runtime supports settings.json
  if (!isCodex) {
    writeSettings(settingsPath, settings);
  }

  // Configure OpenCode permissions
  if (isOpencode) {
    configureOpencodePermissions(isGlobal);
  }

  let program = 'Claude Code';
  if (runtime === 'opencode') program = 'OpenCode';
  if (runtime === 'gemini') program = 'Gemini';
  if (runtime === 'codex') program = 'Codex';

  let command = '/fase-novo-projeto';
  if (runtime === 'codex') command = '$fase-novo-projeto';
  console.log(`
  ${green}Pronto!${reset} Abra um diretório em branco no ${program} e execute ${cyan}${command}${reset}.

`);
}

/**
 * Handle statusline configuration with optional prompt
 */
function handleStatusline(settings, isInteractive, callback) {
  const hasExisting = settings.statusLine != null;

  if (!hasExisting) {
    callback(true);
    return;
  }

  if (forceStatusline) {
    callback(true);
    return;
  }

  if (!isInteractive) {
    console.log(`  ${yellow}⚠${reset} Ignorando statusline (já configurada)`);
    console.log(`    Use ${cyan}--force-statusline${reset} para substituir\n`);
    callback(false);
    return;
  }

  const existingCmd = settings.statusLine.command || settings.statusLine.url || '(custom)';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
  ${yellow}⚠${reset} Statusline existente detectada\n
  Sua statusline atual:
    ${dim}command: ${existingCmd}${reset}

  O FASE inclui uma statusline mostrando:
    • Nome do modelo
    • Tarefa atual (da lista de todos)
    • Uso da janela de contexto (com cores)

  ${cyan}1${reset}) Manter existente
  ${cyan}2${reset}) Substituir pela statusline do FASE
`);

  rl.question(`  Escolha ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    callback(choice === '2');
  });
}

/**
 * Prompt for runtime selection
 */
function promptRuntime(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Instalação cancelada${reset}\n`);
      process.exit(0);
    }
  });

  console.log(`  ${yellow}Para qual(is) runtime(s) deseja instalar?${reset}\n\n  ${cyan}1${reset}) Claude Code
  ${cyan}2${reset}) OpenCode ${dim}- código aberto, modelos gratuitos${reset}
  ${cyan}3${reset}) Gemini
  ${cyan}4${reset}) Codex
  ${cyan}5${reset}) Todos
  ${cyan}6${reset}) Desinstalar ${dim}(remover FASE)${reset}
`);

  rl.question(`  Escolha ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    if (choice === '6') {
      // Special callback for uninstall
      callback('uninstall');
    } else if (choice === '5') {
      callback(['claude', 'opencode', 'gemini', 'codex']);
    } else if (choice === '4') {
      callback(['codex']);
    } else if (choice === '3') {
      callback(['gemini']);
    } else if (choice === '2') {
      callback(['opencode']);
    } else {
      callback(['claude']);
    }
  });
}

/**
 * Prompt user for analytics opt-in
 */
function promptAnalyticsOptIn(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
  ${yellow}📊 Análise de Uso Anônima${reset}

  FASE pode rastrear quais comandos você usa (sem código ou conteúdo do projeto).
  Isso ajuda a melhorar o framework.

  ${dim}O que é rastreado:${reset}
    • Nome do comando (/fase-novo-projeto, /fase-planejar-fase, etc)
    • Qual runtime você usa (Claude Code, OpenCode, etc)
    • Um ID anônimo da instalação

  ${dim}O que NÃO é rastreado:${reset}
    ❌ Código ou conteúdo do projeto
    ❌ Prompts ou conversas
    ❌ Informações pessoais

  ${dim}Quando é enviado:${reset}
    • Uma vez a cada 7 dias
    • Você pode desabilitar a qualquer momento editando ~/.fase-ai/config.json
`);

  rl.question(`  Habilitar análise anônima? ${dim}[n]${reset}: `, (answer) => {
    rl.close();
    const choice = (answer.trim() || 'n').toLowerCase();
    callback(choice === 'y' || choice === 's' || choice === 'sim');
  });
}

/**
 * Prompt for install location
 */
function promptLocation(runtimes) {
  // Always install locally now
  installAllRuntimes(runtimes, false, true);
}

/**
 * Prompt for uninstall location (global or local)
 */
function promptUninstallLocation(runtimes) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
      process.exit(0);
    }
  });

  const pathExamples = runtimes.map(r => {
    const globalDir = getGlobalDir(r, null);
    return globalDir.replace(os.homedir(), '~');
  }).join(', ');

  const localExamples = runtimes.map(r => `./${getDirName(r)}`).join(', ');

   console.log(`  ${yellow}Onde deseja desinstalar o FASE?${reset}\n\n  ${cyan}1${reset}) Local  ${dim}(${localExamples})${reset} - remove deste projeto
   ${cyan}2${reset}) Cancelar
`);

   rl.question(`  Escolha ${dim}[1]${reset}: `, (answer) => {
     answered = true;
     rl.close();
     const choice = answer.trim() || '1';
     if (choice === '2') {
       console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
       process.exit(0);
     }
     promptUninstallConfirmation(runtimes, false);
   });
}

/**
 * Prompt for confirmation before uninstalling
 */
function promptUninstallConfirmation(runtimes, isGlobal) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
      process.exit(0);
    }
  });

  const locationLabel = isGlobal ? 'globalmente' : 'localmente';
  const runtimeList = runtimes.map(r => {
    if (r === 'claude') return 'Claude Code';
    if (r === 'opencode') return 'OpenCode';
    if (r === 'gemini') return 'Gemini';
    if (r === 'codex') return 'Codex';
    return r;
  }).join(', ');

  console.log(`\n  ${yellow}Atenção!${reset} Isto irá remover o FASE ${locationLabel} de: ${cyan}${runtimeList}${reset}

  ${dim}Você pode reinstalar a qualquer momento executando ${cyan}npx fase-ai${reset}${dim}.${reset}
`);

  rl.question(`  Tem certeza que deseja continuar? (s/N): `, (answer) => {
    answered = true;
    rl.close();
    const confirm = answer.trim().toLowerCase();

    if (confirm === 's' || confirm === 'sim' || confirm === 'y' || confirm === 'yes') {
      console.log();
      for (const runtime of runtimes) {
        uninstall(isGlobal, runtime);
      }
      console.log(`\n  ${green}✓${reset} FASE foi desinstalado com sucesso\n`);
    } else {
      console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
    }
  });
}

/**
 * Detect which runtimes have FASE installed in the current directory.
 * Looks for fase-* agent files in each runtime's agents/ directory.
 */
function detectInstalledRuntimes() {
  const runtimes = ['claude', 'opencode', 'gemini', 'codex'];
  const detected = [];

  for (const runtime of runtimes) {
    const dirName = getDirName(runtime);
    const dir = path.join(process.cwd(), dirName);

    // Primary: check for FASE agent files
    const agentsDir = path.join(dir, 'agents');
    if (fs.existsSync(agentsDir)) {
      const hasFaseAgent = fs.readdirSync(agentsDir).some(
        f => f.startsWith('fase-') && (f.endsWith('.md') || f.endsWith('.toml'))
      );
      if (hasFaseAgent) {
        detected.push(runtime);
        continue;
      }
    }

    // Fallback: check for Codex skills/fase-* directory
    if (runtime === 'codex') {
      const skillsDir = path.join(dir, 'skills');
      if (fs.existsSync(skillsDir)) {
        const hasFaseSkill = fs.readdirSync(skillsDir).some(f => f.startsWith('fase-'));
        if (hasFaseSkill) { detected.push(runtime); continue; }
      }
    }

    // Fallback: check for OpenCode flat commands
    if (runtime === 'opencode') {
      const commandDir = path.join(dir, 'command');
      if (fs.existsSync(commandDir)) {
        const hasFaseCmd = fs.readdirSync(commandDir).some(f => f.startsWith('fase-') && f.endsWith('.md'));
        if (hasFaseCmd) { detected.push(runtime); continue; }
      }
    }
  }

  return detected;
}

/**
 * Update FASE for the given (or auto-detected) runtimes.
 * Checks npm for the latest version, shows a diff summary, then reinstalls.
 * @param {string[]} runtimesArg - runtimes to update (empty = auto-detect)
 */
function atualizar(runtimesArg) {
  const { execSync } = require('child_process');

  // --- 1. Version check ---
  let latestVersion = null;
  try {
    latestVersion = execSync('npm view fase-ai version', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (_) {
    // offline or npm unavailable — continue anyway
  }

  const currentVersion = pkg.version;

  if (latestVersion && latestVersion !== currentVersion) {
    console.log(`  ${yellow}Atualização disponível!${reset}`);
    console.log(`  Versão atual:      ${dim}v${currentVersion}${reset}`);
    console.log(`  Versão disponível: ${cyan}v${latestVersion}${reset}\n`);
    console.log(`  ${dim}Execute ${cyan}npm install -g fase-ai@latest${reset}${dim} ou ${cyan}npx fase-ai@latest${reset}${dim} para obter a nova versão.${reset}`);
    console.log(`  Continuando com reinstalação da versão atual (v${currentVersion})...\n`);
  } else if (latestVersion) {
    console.log(`  ${green}✓${reset} Versão atual ${cyan}v${currentVersion}${reset} é a mais recente.\n`);
    console.log(`  Reinstalando para garantir integridade dos arquivos...\n`);
  } else {
    console.log(`  ${yellow}⚠${reset} Não foi possível verificar versão no npm (sem conectividade?).\n`);
    console.log(`  Reinstalando versão ${cyan}v${currentVersion}${reset}...\n`);
  }

  // --- 2. Detect runtimes ---
  const runtimes = runtimesArg.length > 0 ? runtimesArg : detectInstalledRuntimes();

  if (runtimes.length === 0) {
    console.log(`  ${yellow}⚠${reset} Nenhuma instalação do FASE detectada neste diretório.\n`);
    console.log(`  Execute ${cyan}npx fase-ai${reset} para instalar.\n`);
    process.exit(0);
  }

  const runtimeLabels = { claude: 'Claude Code', opencode: 'OpenCode', gemini: 'Gemini', codex: 'Codex' };
  const labels = runtimes.map(r => runtimeLabels[r] || r).join(', ');
  console.log(`  Atualizando: ${cyan}${labels}${reset}\n`);

  // --- 3. Reinstall ---
  installAllRuntimes(runtimes, false, false);

  // --- 4. Post-update verification ---
  console.log(`\n  ${cyan}Verificando instalação pós-atualização...${reset}\n`);
  try {
    const scriptPath = path.join(__dirname, 'verificar-instalacao.js');
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  } catch (_) {
    // verificar-instalacao already printed its own errors
  }

  console.log(`\n  ${yellow}Lembrete:${reset} Reinicie o runtime (${labels}) para carregar os novos comandos e agentes.\n`);
}

/**
 * Install FASE for all selected runtimes
 */
function installAllRuntimes(runtimes, isGlobal, isInteractive) {
  // Install shared content once before per-runtime installations
  installSharedContent();

  const results = [];

  for (const runtime of runtimes) {
    const result = install(isGlobal, runtime);
    results.push(result);
  }

  const statuslineRuntimes = ['claude', 'gemini'];
  const primaryStatuslineResult = results.find(r => statuslineRuntimes.includes(r.runtime));

  const finalize = (shouldInstallStatusline) => {
    for (const result of results) {
      const useStatusline = statuslineRuntimes.includes(result.runtime) && shouldInstallStatusline;
      finishInstall(
        result.settingsPath,
        result.settings,
        result.statuslineCommand,
        useStatusline,
        result.runtime,
        isGlobal
      );
    }

    // Prompt for analytics opt-in after installation completes
    if (isInteractive) {
      promptAnalyticsOptIn((analyticsEnabled) => {
        const installId = crypto.randomUUID();
        saveAnalyticsConfig(analyticsEnabled, installId);

        if (analyticsEnabled) {
          console.log(`\n  ${green}✓${reset} Análise anônima habilitada (ID: ${installId.slice(0, 8)}...)\n`);
        } else {
          console.log(`\n  ${dim}Análise desabilitada. Você pode habilitar depois editando ~/.fase-ai/config.json\n${reset}`);
        }
      });
    }
  };

  if (primaryStatuslineResult) {
    handleStatusline(primaryStatuslineResult.settings, isInteractive, finalize);
  } else {
    finalize(false);
  }
}

// Test-only exports — skip main logic when loaded as a module for testing
if (process.env.FASE_TEST_MODE) {
  module.exports = {
    getCodexSkillAdapterHeader,
    convertClaudeAgentToCodexAgent,
    generateCodexAgentToml,
    generateCodexConfigBlock,
    stripGsdFromCodexConfig,
    mergeCodexConfig,
    installCodexConfig,
    convertClaudeCommandToCodexSkill,
    FASE_CODEX_MARKER,
    CODEX_AGENT_SANDBOX,
  };
} else {

// Main logic
(async () => {
  // Check for updates at session start (unless we're already updating)
  if (!hasAtualizar && !hasUninstall && !hasVerificar) {
    await checkAndPromptForUpdate(pkg.version);
  }

  if (explicitConfigDir) {
    console.error(`  ${yellow}Não é possível usar --config-dir. Instalação agora é sempre local.${reset}`);
    process.exit(1);
  } else if (hasAtualizar) {
    atualizar(selectedRuntimes);
  } else if (hasUninstall) {
    if (selectedRuntimes.length > 0) {
      const runtimes = selectedRuntimes;
      promptUninstallConfirmation(runtimes, false);
    } else {
      promptUninstallLocation(['claude', 'opencode', 'gemini', 'codex']);
    }
  } else if (selectedRuntimes.length > 0) {
    installAllRuntimes(selectedRuntimes, false, false);
  } else {
    // Interactive - always local now
    if (!process.stdin.isTTY) {
      console.log(`  ${yellow}Terminal não interativo detectado, usando instalação local do Claude Code por padrão${reset}\n`);
      installAllRuntimes(['claude'], false, false);
    } else {
      promptRuntime((runtimes) => {
        if (runtimes === 'uninstall') {
          promptUninstallLocation(['claude', 'opencode', 'gemini', 'codex']);
        } else {
          promptLocation(runtimes);
        }
      });
    }
  }
})();

} // end of else block for FASE_TEST_MODE
