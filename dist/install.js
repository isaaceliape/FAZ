#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { checkAndPromptForUpdate } from './lib/version-check.js';
import { safeJsonParse as helperSafeJsonParse } from './install/helpers.js';
import { convertClaudeToQwenCommand, convertClaudeToCopilotCommand, } from './install/frontmatter-convert.js';
import { ValidationError, InstallationError, isFaseError } from './lib/errors.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Wrapper to handle JSON parsing with optional error recovery
function safeJsonParse(jsonStr, context = 'JSON', options = { exitOnError: true }) {
    try {
        return helperSafeJsonParse(jsonStr, context);
    }
    catch (err) {
        if (options.exitOnError) {
            throw err;
        }
        return null;
    }
}
// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
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
const pkg = safeJsonParse(fs.readFileSync(pkgPath, 'utf-8'), 'package.json');
// FASE is now project-local only - no global shared directories
// Parse args
const args = process.argv.slice(2);
const hasOpencode = args.includes('--opencode');
const hasClaude = args.includes('--claude');
const hasGemini = args.includes('--gemini');
const hasCodex = args.includes('--codex');
const hasCopilot = args.includes('--copilot');
const hasQwen = args.includes('--qwen');
const hasBoth = args.includes('--both'); // Legacy flag, keeps working
const hasAll = args.includes('--all');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasVerificar = args.includes('--verificar-instalacao') || args.includes('--verificar') || args.includes('-v');
const hasAtualizar = args.includes('--atualizar') || args.includes('--update');
const hasAutoDetect = args.includes('--auto-detect');
// Runtime selection - can be set by flags or interactive prompt
let selectedRuntimes = [];
if (hasAll) {
    selectedRuntimes = ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'];
}
else if (hasBoth) {
    selectedRuntimes = ['claude', 'opencode'];
}
else {
    if (hasOpencode)
        selectedRuntimes.push('opencode');
    if (hasClaude)
        selectedRuntimes.push('claude');
    if (hasGemini)
        selectedRuntimes.push('gemini');
    if (hasCodex)
        selectedRuntimes.push('codex');
    if (hasCopilot)
        selectedRuntimes.push('copilot');
    if (hasQwen)
        selectedRuntimes.push('qwen');
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
    if (runtime === 'opencode')
        return '.opencode';
    if (runtime === 'gemini')
        return '.gemini';
    if (runtime === 'codex')
        return '.codex';
    if (runtime === 'copilot')
        return '.copilot';
    if (runtime === 'qwen')
        return '.qwen';
    return '.claude';
}
/**
 * Get the config directory path relative to home directory for a runtime
 * Local project-based installs only.
 *
 * @param runtime - Provider runtime name
 * @returns String representation for path.join() replacement
 */
function getConfigDirFromHome(runtime) {
    if (runtime === 'opencode')
        return "'.opencode'";
    if (runtime === 'gemini')
        return "'.gemini'";
    if (runtime === 'codex')
        return "'.codex'";
    if (runtime === 'copilot')
        return "'.copilot'";
    if (runtime === 'qwen')
        return "'.qwen'";
    return "'.claude'";
}
const banner = '\n' +
    cyan +
    '  ███████╗  █████╗ ███████╗███████╗\n' +
    '  ██╔════╝ ██╔══██╗██╔════╝██╔════╝\n' +
    '  █████╗   ███████║███████╗█████╗  \n' +
    '  ██╔══╝   ██╔══██║╚════██║██╔══╝  \n' +
    '  ██║      ██║  ██║███████║███████╗\n' +
    '  ╚═╝      ╚═╝  ╚═╝╚══════╝╚══════╝' +
    reset +
    '\n' +
    '\n' +
    '  FASE ' +
    dim +
    'v' +
    pkg.version +
    reset +
    '\n' +
    '  Framework de Automação Sem Enrolação\n' +
    '  Sistema de meta-prompting, context engineering e\n' +
    '  desenvolvimento spec-driven para Claude Code, OpenCode, Gemini, Codex e GitHub Copilot.\n';
// Parse --config-dir argument
function parseConfigDirArg() {
    const configDirIndex = args.findIndex((arg) => arg === '--config-dir' || arg === '-c');
    if (configDirIndex !== -1) {
        const nextArg = args[configDirIndex + 1];
        // Error if --config-dir is provided without a value or next arg is another flag
        if (!nextArg || nextArg.startsWith('-')) {
            throw new ValidationError(`${yellow}--config-dir requer um argumento de caminho${reset}`, 'CONFIG_DIR_NO_ARGUMENT');
        }
        return nextArg;
    }
    // Also handle --config-dir=value format
    const configDirArg = args.find((arg) => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
    if (configDirArg) {
        const value = configDirArg.split('=')[1];
        if (!value) {
            throw new ValidationError(`${yellow}--config-dir requer um caminho não vazio${reset}`, 'CONFIG_DIR_EMPTY_VALUE');
        }
        return value;
    }
    return null;
}
let explicitConfigDir = null;
try {
    explicitConfigDir = parseConfigDirArg();
}
catch (err) {
    if (isFaseError(err)) {
        console.error(`  ${err.message}`);
    }
    else {
        console.error('Erro ao processar argumentos:', err);
    }
    process.exit(1);
}
const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');
console.log(banner);
// Run verification if --verificar-instalacao flag is provided
if (hasVerificar) {
    try {
        const scriptPath = path.join(__dirname, 'verificar-instalacao.js');
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    }
    catch (e) {
        const err = e;
        // Verification script already output errors, just exit with its code
        process.exit(err.status || 1);
    }
}
// Show help if requested
if (hasHelp) {
    console.log(`  ${yellow}Uso:${reset} npx fase-ai [opções]\n\n  ${yellow}Opções:${reset}\n    ${cyan}--claude${reset}                  Instalar apenas para Claude Code\n    ${cyan}--opencode${reset}                Instalar apenas para OpenCode\n    ${cyan}--gemini${reset}                  Instalar apenas para Gemini\n    ${cyan}--codex${reset}                   Instalar apenas para Codex\n    ${cyan}--copilot${reset}          Instalar apenas para GitHub Copilot\n    ${cyan}--qwen${reset}                    Instalar apenas para Qwen Code\n    ${cyan}--all${reset}                     Instalar para todos os runtimes\n    ${cyan}-u, --uninstall${reset}           Desinstalar o FASE (remover todos os arquivos)\n    ${cyan}--atualizar${reset}               Atualizar FASE: detecta runtimes instalados e reinstala\n    ${cyan}-v, --verificar${reset}           Verificar instalação e gerar relatório\n    ${cyan}-c, --config-dir <caminho>${reset} Especificar diretório de configuração customizado\n    ${cyan}-h, --help${reset}                Exibir esta mensagem de ajuda\n    ${cyan}--force-statusline${reset}        Substituir configuração de statusline existente
    ${cyan}--auto-detect${reset}             Modo automático: detecta runtimes e usa configuração do projeto\n\n  ${yellow}Exemplos:${reset}\n    ${dim}# Instalação interativa (solicita runtime)${reset}\n    npx fase-ai\n\n    ${dim}# Instalar para Claude Code${reset}\n    npx fase-ai --claude\n\n    ${dim}# Instalar para OpenCode${reset}\n    npx fase-ai --opencode\n\n    ${dim}# Instalar para Gemini${reset}\n    npx fase-ai --gemini\n\n    ${dim}# Instalar para Codex${reset}\n    npx fase-ai --codex\n\n    ${dim}# Instalar para GitHub Copilot${reset}\n    npx fase-ai --copilot\n\n    ${dim}# Instalar para Qwen Code${reset}\n    npx fase-ai --qwen\n\n    ${dim}# Instalar para todos os runtimes${reset}
    npx fase-ai --all

    ${dim}# Instalação automática (para package.json postinstall)${reset}\n    npx fase-ai --auto-detect\n\n    ${dim}# Atualizar runtimes instalados${reset}\n    npx fase-ai --atualizar\n\n    ${dim}# Atualizar um runtime específico${reset}\n    npx fase-ai --claude --atualizar\n\n    ${dim}# Verificar instalação${reset}\n    npx fase-ai --verificar\n\n    ${dim}# Desinstalação interativa (solicita confirma)${reset}\n    npx fase-ai --uninstall\n\n    ${dim}# Desinstalar do GitHub Copilot${reset}\n    npx fase-ai --copilot --uninstall\n\n    ${dim}# Desinstalar do Codex${reset}\n    npx fase-ai --codex --uninstall\n\n    ${dim}# Desinstalar do OpenCode${reset}\n    npx fase-ai --opencode --uninstall\n\n    ${dim}# Desinstalar do Qwen Code${reset}\n    npx fase-ai --qwen --uninstall\n\n  ${yellow}Notas:${reset}\n    A opção --config-dir é útil quando você tem múltiplas configurações.\n    Tem prioridade sobre as variáveis de ambiente CLAUDE_CONFIG_DIR / GEMINI_CONFIG_DIR / CODEX_HOME / COPILOT_CONFIG_DIR / QWEN_CONFIG_DIR.\n    Use ${cyan}--uninstall${reset} sem localização para um processo interativo seguro.\n    Use ${cyan}--atualizar${reset} para re-instalar mantendo configurações existentes.
    Use ${cyan}--auto-detect${reset} para instalação via npm postinstall (package.json).\n`);
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
 * Read and parse settings.json, returning empty object if it doesn't exist
 */
function readSettings(settingsPath) {
    if (fs.existsSync(settingsPath)) {
        try {
            return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }
        catch {
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
/**
 * Detect if running as npm postinstall script
 * Checks npm lifecycle environment variables
 */
function isRunningAsPostinstall() {
    return process.env.npm_lifecycle_event === 'postinstall' || process.env.INIT_CWD !== undefined;
}
/**
 * Read project-level FASE configuration from .fase-ai/config.json
 * @returns {Object} Configuration object with defaults
 */
function readProjectConfig() {
    const configPath = path.join(process.cwd(), '.fase-ai', 'config.json');
    const defaults = {
        runtimes: ['claude'],
        auto_install: true,
        skip_confirmation: true,
    };
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { ...defaults, ...config };
        }
        catch {
            // Ignore parsing errors, use defaults
        }
    }
    return defaults;
}
/**
 * Detect available AI runtimes in the system
 * @returns {string[]} Array of detected runtime names
 */
function detectAvailableRuntimes() {
    const detected = [];
    const checks = [
        { runtime: 'claude', command: 'claude' },
        { runtime: 'opencode', command: 'opencode' },
        { runtime: 'gemini', command: 'gemini' },
        { runtime: 'codex', command: 'codex' },
        { runtime: 'copilot', command: 'gh' },
        { runtime: 'qwen', command: 'qwen' },
    ];
    for (const check of checks) {
        try {
            execSync(`which ${check.command}`, { stdio: 'ignore' });
            detected.push(check.runtime);
        }
        catch {
            // Command not found, skip
        }
    }
    // Default to claude if none detected
    return detected.length > 0 ? detected : ['claude'];
}
// Cache for attribution settings (populated once per runtime during install)
const attributionCache = new Map();
/**
 * Get the local (project-level) config directory path for a runtime
 * @param runtime - 'claude', 'opencode', 'gemini', 'codex', 'copilot', or 'qwen'
 * @returns Path to local config directory
 */
function getLocalDir(runtime) {
    if (runtime === 'opencode')
        return path.join(process.cwd(), '.opencode');
    if (runtime === 'gemini')
        return path.join(process.cwd(), '.gemini');
    if (runtime === 'codex')
        return path.join(process.cwd(), '.codex');
    if (runtime === 'copilot')
        return path.join(process.cwd(), '.copilot');
    if (runtime === 'qwen')
        return path.join(process.cwd(), '.qwen');
    return path.join(process.cwd(), '.claude');
}
/**
 * Get commit attribution setting for a runtime
 * Checks project-local config only
 * @param runtime - 'claude', 'opencode', 'gemini', 'codex', 'copilot', or 'qwen'
 * @returns null = remove, undefined = keep default, string = custom
 */
function getCommitAttribution(runtime) {
    // Return cached value if available
    if (attributionCache.has(runtime)) {
        return attributionCache.get(runtime);
    }
    let result;
    if (runtime === 'opencode') {
        // Check local config
        const localConfig = readSettings(path.join(getLocalDir('opencode'), 'opencode.json'));
        result = localConfig.disable_ai_attribution === true ? null : undefined;
    }
    else if (runtime === 'gemini') {
        // Gemini: check gemini settings.json for attribution config
        const localSettings = readSettings(path.join(getLocalDir('gemini'), 'settings.json'));
        const localAttribution = localSettings.attribution;
        if (localAttribution && localAttribution.commit !== undefined) {
            result = localAttribution.commit === '' ? null : localAttribution.commit;
        }
        else {
            result = undefined;
        }
    }
    else if (runtime === 'claude') {
        // Claude Code
        const localSettings = readSettings(path.join(getLocalDir('claude'), 'settings.json'));
        const localAttribution = localSettings.attribution;
        if (localAttribution && localAttribution.commit !== undefined) {
            result = localAttribution.commit === '' ? null : localAttribution.commit;
        }
        else {
            result = undefined;
        }
    }
    else if (runtime === 'copilot') {
        // GitHub Copilot: check .copilot-settings.json for attribution config
        const localSettings = readSettings(path.join(getLocalDir('copilot'), '.copilot-settings.json'));
        const localAttribution = localSettings.attribution;
        if (localAttribution && localAttribution.commit !== undefined) {
            result = localAttribution.commit === '' ? null : localAttribution.commit;
        }
        else {
            result = undefined;
        }
    }
    else if (runtime === 'qwen') {
        // Qwen Code: check settings.json for gitCoAuthor config
        const localSettings = readSettings(path.join(getLocalDir('qwen'), 'settings.json'));
        if (localSettings.gitCoAuthor !== undefined) {
            result =
                localSettings.gitCoAuthor === '' || localSettings.gitCoAuthor === null
                    ? null
                    : localSettings.gitCoAuthor;
        }
        else {
            result = undefined;
        }
    }
    else {
        // Codex currently has no attribution setting equivalent
        result = undefined;
    }
    // Cache and return
    attributionCache.set(runtime, result);
    return result;
}
/**
 * Process Co-Authored-By lines based on attribution setting
 * @param content - File content to process
 * @param attribution - null=remove, undefined=keep, string=replace
 * @returns Processed content
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
    WebSearch: 'websearch', // Plugin/MCP - keep for compatibility
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
 * @returns Gemini tool name, or null if tool should be excluded
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
    if (!match)
        return null;
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
    const converted = convertClaudeToCodexMarkdown(content);
    const { frontmatter, body } = extractFrontmatterAndBody(converted);
    if (!frontmatter)
        return converted;
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
        if (!before)
            return null;
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
    if (!cleaned)
        return null;
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
        }
        else {
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
    }
    else {
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
    const agentEntries = fs
        .readdirSync(agentsSrc)
        .filter((f) => f.startsWith('fase-') && f.endsWith('.md'));
    const agents = [];
    // Compute the Codex pathPrefix for replacing .claude paths
    const codexPathPrefix = `${targetDir.replace(/\\/g, '/')}/`;
    for (const file of agentEntries) {
        let content = fs.readFileSync(path.join(agentsSrc, file), 'utf8');
        // Replace .claude paths (source files may reference .claude for project-local installs)
        content = content.replace(/~\/\.claude\//g, codexPathPrefix);
        content = content.replace(/\$HOME\/\.claude\//g, toHomePrefix(codexPathPrefix));
        const { frontmatter } = extractFrontmatterAndBody(content);
        const name = (extractFrontmatterField(frontmatter || '', 'name') ||
            file.replace('.md', ''));
        const description = (extractFrontmatterField(frontmatter || '', 'description') || '');
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
    if (!content.startsWith('---'))
        return content;
    const endIndex = content.indexOf('---', 3);
    if (endIndex === -1)
        return content;
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
            }
            else if (trimmed) {
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
                const parsed = toolsValue
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t);
                for (const t of parsed) {
                    const mapped = convertGeminiToolName(t);
                    if (mapped)
                        tools.push(mapped);
                }
            }
            else {
                // tools: with no value means YAML array follows
                inAllowedTools = true;
            }
            continue;
        }
        // Strip color field (not supported by Gemini CLI, causes validation error)
        if (trimmed.startsWith('color:'))
            continue;
        // Collect allowed-tools/tools array items
        if (inAllowedTools) {
            if (trimmed.startsWith('- ')) {
                const mapped = convertGeminiToolName(trimmed.substring(2).trim());
                if (mapped)
                    tools.push(mapped);
                continue;
            }
            else if (trimmed && !trimmed.startsWith('-')) {
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
    // Replace .claude and .fase references with OpenCode's project-local location
    convertedContent = convertedContent.replace(/~\/\.claude\b/g, '.opencode');
    convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '.opencode');
    // Replace ~/.fase and $HOME/.fase with OpenCode's project-local location
    convertedContent = convertedContent.replace(/~\/\.fase\b/g, '.opencode/fase');
    convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '.opencode/fase');
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
                const tools = toolsValue
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t);
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
            }
            else if (colorValue.startsWith('#')) {
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
            }
            else if (trimmed && !trimmed.startsWith('-')) {
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
    }
    else {
        fs.mkdirSync(destDir, { recursive: true });
    }
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        if (entry.isDirectory()) {
            // Recurse into subdirectories, adding to prefix
            // e.g., bin/comandos/debug/start.md -> command/fase-debug-start.md
            copyFlattenedCommands(srcPath, destDir, `${prefix}-${entry.name}`, pathPrefix, runtime);
        }
        else if (entry.name.endsWith('.md')) {
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
            const sharedHomePath = '$HOME/.fase-ai/';
            content = content.replace(globalClaudeRegex, pathPrefix);
            content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
            content = content.replace(localClaudeRegex, `./${getDirName(runtime)}/`);
            content = content.replace(opencodeDirRegex, pathPrefix);
            content = content.replace(globalFaseRegex, pathPrefix);
            content = content.replace(globalFaseHomeRegex, sharedHomePath);
            content = processAttribution(content, getCommitAttribution(runtime));
            // Convert frontmatter based on runtime
            if (runtime === 'qwen') {
                content = convertClaudeToQwenCommand(content);
            }
            else if (runtime === 'copilot') {
                content = convertClaudeToCopilotCommand(content);
            }
            else {
                content = convertClaudeToOpencodeFrontmatter(content);
            }
            fs.writeFileSync(destPath, content);
        }
    }
}
function listCodexSkillNames(skillsDir, prefix = 'fase-') {
    if (!fs.existsSync(skillsDir))
        return [];
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
        .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
        .map((entry) => entry.name)
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
            const sharedHomePath = '$HOME/.fase-ai/';
            content = content.replace(globalClaudeRegex, pathPrefix);
            content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
            content = content.replace(localClaudeRegex, `./${getDirName(runtime)}/`);
            content = content.replace(codexDirRegex, pathPrefix);
            content = content.replace(globalFaseRegex, pathPrefix);
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
        }
        else if (entry.name.endsWith('.md')) {
            // Replace .claude/ references with runtime-appropriate paths
            let content = fs.readFileSync(srcPath, 'utf8');
            const globalClaudeRegex = /~\/\.claude\//g;
            const globalClaudeHomeRegex = /\$HOME\/\.claude\//g;
            const localClaudeRegex = /\.\/\.claude\//g;
            const globalFaseRegex = /~\/\.fase\//g;
            const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
            const sharedHomePath = '$HOME/.fase-ai/';
            content = content.replace(globalClaudeRegex, pathPrefix);
            content = content.replace(globalClaudeHomeRegex, toHomePrefix(pathPrefix));
            content = content.replace(localClaudeRegex, `./${dirName}/`);
            content = content.replace(globalFaseRegex, pathPrefix);
            content = content.replace(globalFaseHomeRegex, sharedHomePath);
            content = processAttribution(content, getCommitAttribution(runtime));
            // Convert frontmatter for runtime compatibility
            if (isOpencode) {
                content = convertClaudeToOpencodeFrontmatter(content);
                fs.writeFileSync(destPath, content);
            }
            else if (runtime === 'copilot') {
                content = convertClaudeToCopilotCommand(content);
                fs.writeFileSync(destPath, content);
            }
            else if (runtime === 'gemini') {
                if (isCommand) {
                    // Convert to TOML for Gemini (strip <sub> tags — terminals can't render subscript)
                    content = stripSubTags(content);
                    const tomlContent = convertClaudeToGeminiToml(content);
                    // Replace extension with .toml
                    const tomlPath = destPath.replace(/\.md$/, '.toml');
                    fs.writeFileSync(tomlPath, tomlContent);
                }
                else {
                    fs.writeFileSync(destPath, content);
                }
            }
            else if (isCodex) {
                content = convertClaudeToCodexMarkdown(content);
                fs.writeFileSync(destPath, content);
            }
            else {
                fs.writeFileSync(destPath, content);
            }
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
/**
 * Clean up orphaned files from previous FASE versions
 */
function cleanupOrphanedFiles(configDir) {
    const orphanedFiles = [
        'hooks/fase-notify.sh', // Removed in v1.6.x
        'hooks/statusline.js', // Renamed to fase-statusline.js in v1.9.0
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
                }
                catch {
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
        'fase-notify.sh', // Removed in v1.6.x
        'hooks/statusline.js', // Renamed to fase-statusline.js in v1.9.0
        'fase-intel-index.js', // Removed in v1.9.2
        'fase-intel-session.js', // Removed in v1.9.2
        'fase-intel-prune.js', // Removed in v1.9.2
        'fase-check-update.js', // Gemini hooks that may not exist in local installs
        'fase-context-monitor.js', // Gemini hooks that may not exist in local installs
        'fase-statusline.js', // May reference hooks/ dir that doesn't exist
    ];
    let cleanedHooks = false;
    // Check all hook event types (Stop, SessionStart, etc.)
    if (settings.hooks) {
        const hooks = settings.hooks;
        for (const eventType of Object.keys(hooks)) {
            const hookEntries = hooks[eventType];
            if (Array.isArray(hookEntries)) {
                // Filter out entries that contain orphaned hooks
                const filtered = hookEntries.filter((entry) => {
                    const entryObj = entry;
                    if (entryObj.hooks && Array.isArray(entryObj.hooks)) {
                        // Check if any hook in this entry matches orphaned patterns
                        const hasOrphaned = entryObj.hooks.some((h) => {
                            const hObj = h;
                            const cmd = hObj.command;
                            return (cmd &&
                                typeof cmd === 'string' &&
                                orphanedHookPatterns.some((pattern) => cmd.includes(pattern)));
                        });
                        if (hasOrphaned) {
                            cleanedHooks = true;
                            return false; // Remove this entry
                        }
                    }
                    return true; // Keep this entry
                });
                hooks[eventType] = filtered;
            }
        }
    }
    if (cleanedHooks) {
        console.log(`  ${green}✓${reset} Removidos registros de hooks obsoletos`);
    }
    // Fix #330: Update statusLine if it points to old FASE statusline.js path
    // Only match the specific old FASE path pattern (hooks/statusline.js),
    // not third-party statusline scripts that happen to contain 'statusline.js'
    const statusLine = settings.statusLine;
    if (statusLine &&
        statusLine.command &&
        typeof statusLine.command === 'string' &&
        /hooks[\/\\]statusline\.js/.test(statusLine.command)) {
        statusLine.command = statusLine.command.replace(/hooks([\/\\])statusline\.js/, 'hooks$1fase-statusline.js');
        console.log(`  ${green}✓${reset} Atualizado caminho da statusline (hooks/statusline.js → hooks/fase-statusline.js)`);
    }
    return settings;
}
/**
 * Uninstall FASE from the local project directory for a specific runtime
 * Removes only FASE-specific files/directories, preserves user content
 * @param {string} runtime - Target runtime ('claude', 'opencode', 'gemini', 'codex')
 */
function uninstall(runtime = 'claude') {
    const isOpencode = runtime === 'opencode';
    const isCodex = runtime === 'codex';
    const dirName = getDirName(runtime);
    // Get the target directory (always local)
    const targetDir = path.join(process.cwd(), dirName);
    const locationLabel = targetDir.replace(process.cwd(), '.');
    let runtimeLabel = 'Claude Code';
    if (runtime === 'opencode')
        runtimeLabel = 'OpenCode';
    if (runtime === 'gemini')
        runtimeLabel = 'Gemini';
    if (runtime === 'codex')
        runtimeLabel = 'Codex';
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
    }
    else if (isCodex) {
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
            }
            else if (cleaned !== content) {
                fs.writeFileSync(configPath, cleaned);
                removedCount++;
                console.log(`  ${green}✓${reset} Removidas seções do FASE do config.toml`);
            }
        }
    }
    else {
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
        const faseHooks = [
            'fase-statusline.js',
            'fase-check-update.js',
            'fase-check-update.sh',
            'fase-context-monitor.js',
        ];
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
        }
        catch {
            // Ignore read errors
        }
    }
    // 6. Clean up settings.json (remove FASE hooks and statusline)
    const settingsPath = path.join(targetDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
        const settings = readSettings(settingsPath);
        let settingsModified = false;
        // Remove FASE statusline if it references our hook
        const statusLine = settings.statusLine;
        if (statusLine &&
            statusLine.command &&
            typeof statusLine.command === 'string' &&
            statusLine.command.includes('fase-statusline')) {
            delete settings.statusLine;
            settingsModified = true;
            console.log(`  ${green}✓${reset} Removida statusline do FASE das configurações`);
        }
        // Remove FASE hooks from SessionStart
        const hooks = settings.hooks;
        if (hooks && hooks.SessionStart) {
            const sessionStartHooks = hooks.SessionStart;
            const before = sessionStartHooks.length;
            hooks.SessionStart = sessionStartHooks.filter((entry) => {
                const entryObj = entry;
                if (entryObj.hooks && Array.isArray(entryObj.hooks)) {
                    // Filter out FASE hooks
                    const hasGsdHook = entryObj.hooks.some((h) => {
                        const hObj = h;
                        return (hObj.command &&
                            typeof hObj.command === 'string' &&
                            (hObj.command.includes('fase-check-update') ||
                                hObj.command.includes('fase-statusline')));
                    });
                    return !hasGsdHook;
                }
                return true;
            });
            if (hooks.SessionStart.length < before) {
                settingsModified = true;
                console.log(`  ${green}✓${reset} Removidos hooks FASE das configurações`);
            }
            // Clean up empty array
            if (hooks.SessionStart.length === 0) {
                delete hooks.SessionStart;
            }
        }
        // Remove FASE hooks from PostToolUse and AfterTool (Gemini uses AfterTool)
        for (const eventName of ['PostToolUse', 'AfterTool']) {
            if (hooks && hooks[eventName]) {
                const eventHooks = hooks[eventName];
                const before = eventHooks.length;
                hooks[eventName] = eventHooks.filter((entry) => {
                    const entryObj = entry;
                    if (entryObj.hooks && Array.isArray(entryObj.hooks)) {
                        const hasGsdHook = entryObj.hooks.some((h) => {
                            const hObj = h;
                            return (hObj.command &&
                                typeof hObj.command === 'string' &&
                                hObj.command.includes('fase-context-monitor'));
                        });
                        return !hasGsdHook;
                    }
                    return true;
                });
                if (hooks[eventName].length < before) {
                    settingsModified = true;
                    console.log(`  ${green}✓${reset} Removido hook do monitor de contexto das configurações`);
                }
                if (hooks[eventName].length === 0) {
                    delete hooks[eventName];
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
        }
        catch {
            // Ignore deletion errors
        }
    }
    // 8. For OpenCode, clean up permissions from opencode.json
    if (isOpencode) {
        // For local uninstalls, clean up ./.opencode/opencode.json
        const opencodeConfigDir = path.join(process.cwd(), '.opencode');
        const configPath = path.join(opencodeConfigDir, 'opencode.json');
        if (fs.existsSync(configPath)) {
            try {
                const config = safeJsonParse(fs.readFileSync(configPath, 'utf8'), 'opencode.json', {
                    exitOnError: false,
                });
                if (!config)
                    return; // Skip if JSON is invalid
                let modified = false;
                // Remove FASE permission entries
                const permission = config.permission;
                if (permission) {
                    for (const permType of ['read', 'external_directory']) {
                        const permObj = permission[permType];
                        if (permObj) {
                            const keys = Object.keys(permObj);
                            for (const key of keys) {
                                if (key.includes('fase-ai')) {
                                    delete permObj[key];
                                    modified = true;
                                }
                            }
                            // Clean up empty objects
                            if (Object.keys(permObj).length === 0) {
                                delete permission[permType];
                            }
                        }
                    }
                    if (Object.keys(permission).length === 0) {
                        delete config.permission;
                    }
                }
                if (modified) {
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
                    removedCount++;
                    console.log(`  ${green}✓${reset} Removidas permissões FASE do opencode.json`);
                }
            }
            catch {
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
            output: process.stdout,
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
                console.log(`  ${green}✓${reset} ~/.fase-ai/ removido\n`);
            }
            else {
                console.log(`  ${dim}~/.fase-ai/ preservado${reset}\n`);
            }
        });
    }
    else {
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
    if (content.charCodeAt(0) === 0xfeff) {
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
        }
        else {
            if (char === '"') {
                inString = true;
                result += char;
                i++;
            }
            else if (char === '/' && next === '/') {
                // Skip single-line comment until end of line
                while (i < content.length && content[i] !== '\n') {
                    i++;
                }
            }
            else if (char === '/' && next === '*') {
                // Skip block comment
                i += 2;
                while (i < content.length - 1 && !(content[i] === '*' && content[i + 1] === '/')) {
                    i++;
                }
                i += 2; // Skip closing */
            }
            else {
                result += char;
                i++;
            }
        }
    }
    // Remove trailing commas before } or ]
    result = result.replace(/,(\s*[}\]])/g, '$1');
    try {
        return JSON.parse(result);
    }
    catch (err) {
        const error = err;
        console.error(`Invalid JSON after stripping comments: ${error.message}`);
        return {};
    }
}
/**
 * Configure OpenCode permissions to allow reading FASE reference docs
 * This prevents permission prompts when FASE accesses the fase-ai directory
 * Project-local installations only.
 */
function configureOpencodePermissions() {
    // Local installs use ./.opencode/opencode.json
    const opencodeConfigDir = path.join(process.cwd(), '.opencode');
    const configPath = path.join(opencodeConfigDir, 'opencode.json');
    // Ensure config directory exists
    fs.mkdirSync(opencodeConfigDir, { recursive: true });
    // Read existing config or create empty object
    let config = {};
    if (fs.existsSync(configPath)) {
        try {
            const content = fs.readFileSync(configPath, 'utf8');
            config = parseJsonc(content);
        }
        catch (e) {
            const error = e;
            // Cannot parse - DO NOT overwrite user's config
            console.log(`  ${yellow}⚠${reset} Não foi possível analisar opencode.json - ignorando configuração de permissões`);
            console.log(`    ${dim}Motivo: ${error.message}${reset}`);
            console.log(`    ${dim}Sua configuração NÃO foi modificada. Corrija a sintaxe manualmente se necessário.${reset}`);
            return;
        }
    }
    // Ensure permission structure exists
    const permission = config.permission;
    if (!permission) {
        config.permission = {};
    }
    const permObj = config.permission || {};
    // Build the FASE path using the actual config directory
    const fasePath = `${opencodeConfigDir.replace(/\\/g, '/')}/fase-ai/*`;
    let modified = false;
    // Configure read permission
    if (!permObj.read || typeof permObj.read !== 'object') {
        permObj.read = {};
    }
    const readPerm = permObj.read;
    if (readPerm[fasePath] !== 'allow') {
        readPerm[fasePath] = 'allow';
        modified = true;
    }
    // Configure external_directory permission (the safety guard for paths outside project)
    if (!permObj.external_directory || typeof permObj.external_directory !== 'object') {
        permObj.external_directory = {};
    }
    const externalPerm = permObj.external_directory;
    // Configure permissions for the command/ directory so OpenCode can discover commands
    const commandPath = `${opencodeConfigDir.replace(/\\/g, '/')}/command/*`;
    if (readPerm[commandPath] !== 'allow') {
        readPerm[commandPath] = 'allow';
        modified = true;
    }
    if (externalPerm[commandPath] !== 'allow') {
        externalPerm[commandPath] = 'allow';
        modified = true;
    }
    if (!externalPerm[fasePath]) {
        externalPerm[fasePath] = 'allow';
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
    }
    catch (e) {
        const error = e;
        console.error(`  ${yellow}✗${reset} Falha ao instalar ${description}: ${error.message}`);
        return false;
    }
    return true;
}
/**
 * Install to the local project directory for a specific runtime
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
    if (!baseDir)
        baseDir = dir;
    const manifest = {};
    if (!fs.existsSync(dir))
        return manifest;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        if (entry.isDirectory()) {
            Object.assign(manifest, generateManifest(fullPath, baseDir));
        }
        else {
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
    const manifest = {
        version: pkg.version,
        timestamp: new Date().toISOString(),
        files: {},
    };
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
    if (!fs.existsSync(manifestPath))
        return [];
    let manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    catch {
        return [];
    }
    const patchesDir = path.join(configDir, PATCHES_DIR_NAME);
    const modified = [];
    for (const [relPath, originalHash] of Object.entries(manifest.files || {})) {
        const fullPath = path.join(configDir, relPath);
        if (!fs.existsSync(fullPath))
            continue;
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
            files: modified,
        };
        fs.writeFileSync(path.join(patchesDir, 'backup-meta.json'), JSON.stringify(meta, null, 2));
        console.log('  ' +
            yellow +
            'i' +
            reset +
            '  Encontrado(s) ' +
            modified.length +
            ' arquivo(s) FASE modificado(s) localmente — salvo(s) em ' +
            PATCHES_DIR_NAME +
            '/');
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
    if (!fs.existsSync(metaPath))
        return [];
    let meta;
    try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    }
    catch {
        return [];
    }
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
 * Install FASE to the local project directory (v3.2.0+)
 * Agents, commands, docs, and shared FASE content
 */
function install(runtime = 'claude') {
    const isOpencode = runtime === 'opencode';
    const isGemini = runtime === 'gemini';
    const isCodex = runtime === 'codex';
    const isCopilot = runtime === 'copilot';
    const isQwen = runtime === 'qwen';
    const dirName = getDirName(runtime);
    const src = __dirname;
    // Get the target directory (always local, project-based)
    const targetDir = path.join(process.cwd(), dirName);
    const locationLabel = targetDir.replace(process.cwd(), '.');
    // Path prefix for file references in markdown content (local paths)
    const pathPrefix = `./${dirName}/`;
    let runtimeLabel = 'Claude Code';
    if (isOpencode)
        runtimeLabel = 'OpenCode';
    if (isGemini)
        runtimeLabel = 'Gemini';
    if (isCodex)
        runtimeLabel = 'Codex';
    if (isCopilot)
        runtimeLabel = 'GitHub Copilot';
    if (isQwen)
        runtimeLabel = 'Qwen Code';
    console.log(`  Instalando para ${cyan}${runtimeLabel}${reset} em ${cyan}${locationLabel}${reset}\n`);
    // Track installation failures
    const failures = [];
    // Save any locally modified FASE files before they get wiped
    saveLocalPatches(targetDir);
    // Clean up orphaned files from previous versions
    cleanupOrphanedFiles(targetDir);
    // OpenCode uses command/ (flat), Codex uses skills/, Qwen/Copilot use commands/, Claude/Gemini use commands/fase/
    if (isOpencode) {
        // OpenCode: flat structure in command/ directory
        const commandDir = path.join(targetDir, 'command');
        fs.mkdirSync(commandDir, { recursive: true });
        // Copy bin/comandos/*.md as command/fase-*.md (flatten structure)
        const faseSrc = path.join(src, 'comandos');
        copyFlattenedCommands(faseSrc, commandDir, 'fase', pathPrefix, runtime);
        if (verifyInstalled(commandDir, 'command/fase-*')) {
            const count = fs.readdirSync(commandDir).filter((f) => f.startsWith('fase-')).length;
            console.log(`  ${green}✓${reset} Instalados ${count} comandos em command/`);
        }
        else {
            failures.push('command/fase-*');
        }
    }
    else if (isCodex) {
        const skillsDir = path.join(targetDir, 'skills');
        const faseSrc = path.join(src, 'comandos');
        copyCommandsAsCodexSkills(faseSrc, skillsDir, 'fase', pathPrefix, runtime);
        const installedSkillNames = listCodexSkillNames(skillsDir);
        if (installedSkillNames.length > 0) {
            console.log(`  ${green}✓${reset} Instaladas ${installedSkillNames.length} skills em skills/`);
        }
        else {
            failures.push('skills/fase-*');
        }
    }
    else if (isQwen) {
        // Qwen Code: flat structure in commands/ directory (no fase/ subdirectory)
        const commandsDir = path.join(targetDir, 'commands');
        fs.mkdirSync(commandsDir, { recursive: true });
        const faseSrc = path.join(src, 'comandos');
        copyFlattenedCommands(faseSrc, commandsDir, 'fase', pathPrefix, runtime);
        if (verifyInstalled(commandsDir, 'commands/fase-*')) {
            const count = fs.readdirSync(commandsDir).filter((f) => f.startsWith('fase-')).length;
            console.log(`  ${green}✓${reset} Instalados ${count} comandos em commands/`);
        }
        else {
            failures.push('commands/fase-*');
        }
    }
    else if (isCopilot) {
        // GitHub Copilot: flat structure in commands/ directory
        const commandsDir = path.join(targetDir, 'commands');
        fs.mkdirSync(commandsDir, { recursive: true });
        const faseSrc = path.join(src, 'comandos');
        copyFlattenedCommands(faseSrc, commandsDir, 'fase', pathPrefix, runtime);
        if (verifyInstalled(commandsDir, 'commands/fase-*')) {
            const count = fs.readdirSync(commandsDir).filter((f) => f.startsWith('fase-')).length;
            console.log(`  ${green}✓${reset} Instalados ${count} comandos em commands/`);
        }
        else {
            failures.push('commands/fase-*');
        }
    }
    else {
        // Claude Code & Gemini: nested structure in commands/ directory
        const commandsDir = path.join(targetDir, 'commands');
        fs.mkdirSync(commandsDir, { recursive: true });
        const faseSrc = path.join(src, 'comandos');
        const faseDest = path.join(commandsDir, 'fase');
        copyWithPathReplacement(faseSrc, faseDest, pathPrefix, runtime, true);
        if (verifyInstalled(faseDest, 'commands/fase')) {
            console.log(`  ${green}✓${reset} Instalado commands/fase/`);
        }
        else {
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
        }
        else {
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
                // Replace .claude/ and .fase/ references with project-local paths
                const dirRegex = /~\/\.claude\//g;
                const homeDirRegex = /\$HOME\/\.claude\//g;
                const globalFaseRegex = /~\/\.fase\//g;
                const globalFaseHomeRegex = /\$HOME\/\.fase\//g;
                const sharedHomePath = '$HOME/.fase-ai/';
                content = content.replace(dirRegex, pathPrefix);
                content = content.replace(homeDirRegex, toHomePrefix(pathPrefix));
                content = content.replace(globalFaseRegex, pathPrefix);
                content = content.replace(globalFaseHomeRegex, sharedHomePath);
                content = processAttribution(content, getCommitAttribution(runtime));
                // Convert frontmatter for runtime compatibility
                if (isOpencode) {
                    content = convertClaudeToOpencodeFrontmatter(content);
                }
                else if (isCopilot) {
                    content = convertClaudeToCopilotCommand(content);
                }
                else if (isGemini) {
                    content = convertClaudeToGeminiAgent(content);
                }
                else if (isCodex) {
                    content = convertClaudeAgentToCodexAgent(content);
                }
                else if (isQwen) {
                    content = convertClaudeToQwenCommand(content);
                }
                fs.writeFileSync(path.join(agentsDest, entry.name), content);
            }
        }
        if (verifyInstalled(agentsDest, 'agents')) {
            console.log(`  ${green}✓${reset} Instalados agentes`);
        }
        else {
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
        }
        catch {
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
                const configDirReplacement = getConfigDirFromHome(runtime);
                for (const entry of hookEntries) {
                    const srcFile = path.join(hooksSrc, entry);
                    if (fs.statSync(srcFile).isFile()) {
                        const destFile = path.join(hooksDest, entry);
                        // Template .js files to replace '.claude' with runtime-specific config dir
                        if (entry.endsWith('.js')) {
                            let content = fs.readFileSync(srcFile, 'utf8');
                            content = content.replace(/'\.claude'/g, configDirReplacement);
                            fs.writeFileSync(destFile, content);
                        }
                        else {
                            fs.copyFileSync(srcFile, destFile);
                        }
                    }
                }
                if (verifyInstalled(hooksDest, 'hooks')) {
                    console.log(`  ${green}✓${reset} Instalados hooks (empacotados)`);
                }
                else {
                    failures.push('hooks');
                }
            }
            catch {
                console.error(`  ${red}✗${reset} Erro ao instalar hooks`);
                console.error(`    ${dim}Verifique permissões de escrita: ${targetDir}/hooks${reset}`);
                failures.push('hooks');
            }
        }
    }
    if (failures.length > 0) {
        throw new InstallationError(`Instalação incompleta! Falhou: ${failures.join(', ')}`, 'INSTALL_INCOMPLETE', { failures });
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
            if (!fs.existsSync(dir))
                return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    scanForLeakedPaths(fullPath);
                }
                else if ((entry.name.endsWith('.md') || entry.name.endsWith('.toml')) &&
                    entry.name !== 'CHANGELOG.md') {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const matches = content.match(/(?:~|\$HOME)\/\.claude\b/g);
                    if (matches) {
                        leakedPaths.push({
                            file: fullPath.replace(targetDir + '/', ''),
                            count: matches.length,
                        });
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
    const statuslineCommand = hooksExist ? 'node ' + dirName + '/hooks/fase-statusline.js' : null;
    const updateCheckCommand = hooksExist ? 'node ' + dirName + '/hooks/fase-check-update.js' : null;
    const contextMonitorCommand = hooksExist
        ? 'node ' + dirName + '/hooks/fase-context-monitor.js'
        : null;
    // Enable experimental agents for Gemini CLI (required for custom sub-agents)
    if (isGemini) {
        const experimental = settings.experimental;
        if (!experimental) {
            settings.experimental = {};
        }
        const expObj = settings.experimental;
        if (!expObj.enableAgents) {
            expObj.enableAgents = true;
            console.log(`  ${green}✓${reset} Agentes experimentais habilitados`);
        }
    }
    // Configure SessionStart hook for update checking (skip for opencode and if hooks don't exist)
    if (!isOpencode && hooksExist && updateCheckCommand) {
        const hooks = settings.hooks;
        if (!hooks) {
            settings.hooks = {};
        }
        const hooksObj = settings.hooks;
        if (!hooksObj.SessionStart) {
            hooksObj.SessionStart = [];
        }
        const sessionStartHooks = hooksObj.SessionStart;
        const hasGsdUpdateHook = sessionStartHooks.some((entry) => {
            const entryObj = entry;
            const entryHooks = entryObj.hooks;
            return (entryHooks &&
                entryHooks.some((h) => {
                    const hObj = h;
                    return (hObj.command &&
                        typeof hObj.command === 'string' &&
                        hObj.command.includes('fase-check-update'));
                }));
        });
        if (!hasGsdUpdateHook) {
            sessionStartHooks.push({
                hooks: [
                    {
                        type: 'command',
                        command: updateCheckCommand,
                    },
                ],
            });
            console.log(`  ${green}✓${reset} Hook de verificação de atualização configurado`);
        }
        // Configure post-tool hook for context window monitoring
        if (!hooksObj[postToolEvent]) {
            hooksObj[postToolEvent] = [];
        }
        const postToolHooks = hooksObj[postToolEvent];
        const hasContextMonitorHook = postToolHooks.some((entry) => {
            const entryObj = entry;
            const entryHooks = entryObj.hooks;
            return (entryHooks &&
                entryHooks.some((h) => {
                    const hObj = h;
                    return (hObj.command &&
                        typeof hObj.command === 'string' &&
                        hObj.command.includes('fase-context-monitor'));
                }));
        });
        if (!hasContextMonitorHook && contextMonitorCommand) {
            postToolHooks.push({
                hooks: [
                    {
                        type: 'command',
                        command: contextMonitorCommand,
                    },
                ],
            });
            console.log(`  ${green}✓${reset} Hook de monitor de janela de contexto configurado`);
        }
    }
    return { settingsPath, settings, statuslineCommand, runtime };
}
/**
 * Apply statusline config, then print completion message
 */
function finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline, runtime = 'claude') {
    const isOpencode = runtime === 'opencode';
    const isCodex = runtime === 'codex';
    if (shouldInstallStatusline && !isOpencode && !isCodex && statuslineCommand && settings) {
        settings.statusLine = {
            type: 'command',
            command: statuslineCommand,
        };
        console.log(`  ${green}✓${reset} Statusline configurada`);
    }
    // Write settings when runtime supports settings.json
    if (!isCodex && settingsPath && settings) {
        writeSettings(settingsPath, settings);
    }
    // Configure OpenCode permissions
    if (isOpencode) {
        configureOpencodePermissions();
    }
    let program = 'Claude Code';
    if (runtime === 'opencode')
        program = 'OpenCode';
    if (runtime === 'gemini')
        program = 'Gemini';
    if (runtime === 'codex')
        program = 'Codex';
    if (runtime === 'copilot')
        program = 'GitHub Copilot';
    if (runtime === 'qwen')
        program = 'Qwen Code';
    let command = '/fase-novo-projeto';
    if (runtime === 'codex')
        command = '$fase-novo-projeto';
    if (runtime === 'copilot')
        command = '/fase-novo-projeto';
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
    const statusLine = settings.statusLine;
    const existingCmd = (statusLine?.command || statusLine?.url || '(custom)');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
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
 * Interactive menu selection with arrow key navigation
 * Displays menu options and allows user to select with arrows and Enter
 */
function promptInteractiveMenu(options, callback) {
    let selectedIndex = 0;
    let answered = false;
    // Enable raw mode to capture arrow keys
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const renderMenu = () => {
        // Clear previous menu (move cursor up)
        const lines = options.length + 2;
        for (let i = 0; i < lines; i++) {
            process.stdout.write('\x1B[1A\x1B[2K');
        }
        console.log(`  ${yellow}Para qual(is) runtime(s) deseja instalar?${reset}\n`);
        options.forEach((option, index) => {
            const isSelected = index === selectedIndex;
            const prefix = isSelected ? `${cyan}▶${reset}` : ' ';
            const color = isSelected ? cyan : '';
            const label = `${prefix} ${color}${index + 1}${reset}) ${option.label}`;
            console.log(`  ${label}${option.description ? ` ${dim}${option.description}${reset}` : ''}`);
        });
    };
    // Initial render
    console.log(`  ${yellow}Para qual(is) runtime(s) deseja instalar?${reset}\n`);
    options.forEach((option, index) => {
        const isSelected = index === selectedIndex;
        const prefix = isSelected ? `${cyan}▶${reset}` : ' ';
        const color = isSelected ? cyan : '';
        const label = `${prefix} ${color}${index + 1}${reset}) ${option.label}`;
        console.log(`  ${label}${option.description ? ` ${dim}${option.description}${reset}` : ''}`);
    });
    const cleanup = () => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handleKeypress);
    };
    const handleKeypress = (chunk) => {
        if (answered)
            return;
        const key = chunk.toString();
        // Check for arrow keys (ESC sequences)
        if (key === '\x1B') {
            // This is the start of an escape sequence
            return;
        }
        // Arrow Up
        if (key === '\x1B[A' || key === '\x1B\x4F\x41') {
            selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            renderMenu();
        }
        // Arrow Down
        else if (key === '\x1B[B' || key === '\x1B\x4F\x42') {
            selectedIndex = (selectedIndex + 1) % options.length;
            renderMenu();
        }
        // Enter
        else if (key === '\r' || key === '\n') {
            answered = true;
            cleanup();
            console.log('');
            callback(selectedIndex);
        }
        // Ctrl+C
        else if (key === '\x03') {
            answered = true;
            cleanup();
            console.log(`\n  ${yellow}Instalação cancelada${reset}\n`);
            process.exit(0);
        }
        // Number keys 1-9
        else if (key >= '1' && key <= '9') {
            const idx = parseInt(key) - 1;
            if (idx < options.length) {
                answered = true;
                cleanup();
                console.log('');
                callback(idx);
            }
        }
    };
    process.stdin.on('data', handleKeypress);
}
/**
 * Prompt for runtime selection
 */
function promptRuntime(callback) {
    const options = [
        { label: 'Claude Code', description: `${dim}- IA avançada da Anthropic${reset}` },
        { label: 'OpenCode', description: `${dim}- código aberto, modelos gratuitos${reset}` },
        { label: 'Gemini', description: `${dim}- IA multimodal do Google${reset}` },
        { label: 'Codex', description: `${dim}- modelo de codificação da OpenAI${reset}` },
        { label: 'GitHub Copilot', description: `${dim}- copiloto de IA por GitHub${reset}` },
        { label: 'Qwen Code', description: `${dim}- IA da Alibaba Cloud${reset}` },
        { label: 'Todos', description: `${dim}- instalar todos os runtimes${reset}` },
        { label: 'Desinstalar', description: `${dim}- remover FASE${reset}` },
        { label: 'Sair', description: `${dim}- sair sem instalar${reset}` },
    ];
    promptInteractiveMenu(options, (selectedIndex) => {
        const runtimeMap = [
            ['claude'],
            ['opencode'],
            ['gemini'],
            ['codex'],
            ['copilot'],
            ['qwen'],
            ['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen'],
            'uninstall',
            'exit',
        ];
        const action = runtimeMap[selectedIndex];
        if (action === 'exit') {
            console.log(`  ${yellow}Saindo da instalação${reset}\n`);
            process.exit(0);
        }
        callback(action);
    });
}
/**
 * Prompt for install location
 */
function promptLocation(runtimes) {
    // Always install locally
    installAllRuntimes(runtimes, true);
}
/**
 * Prompt for uninstall location (global or local)
 */
function promptUninstallLocation(runtimes) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let answered = false;
    rl.on('close', () => {
        if (!answered) {
            answered = true;
            console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
            process.exit(0);
        }
    });
    const localExamples = runtimes.map((r) => `./${getDirName(r)}`).join(', ');
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
        promptUninstallConfirmation(runtimes);
    });
}
/**
 * Prompt for confirmation before uninstalling
 */
function promptUninstallConfirmation(runtimes) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    let answered = false;
    rl.on('close', () => {
        if (!answered) {
            answered = true;
            console.log(`\n  ${yellow}Desinstalação cancelada${reset}\n`);
            process.exit(0);
        }
    });
    const locationLabel = 'localmente';
    const runtimeList = runtimes
        .map((r) => {
        if (r === 'claude')
            return 'Claude Code';
        if (r === 'opencode')
            return 'OpenCode';
        if (r === 'gemini')
            return 'Gemini';
        if (r === 'codex')
            return 'Codex';
        return r;
    })
        .join(', ');
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
                uninstall(runtime);
            }
            console.log(`\n  ${green}✓${reset} FASE foi desinstalado com sucesso\n`);
        }
        else {
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
            const hasFaseAgent = fs
                .readdirSync(agentsDir)
                .some((f) => f.startsWith('fase-') && (f.endsWith('.md') || f.endsWith('.toml')));
            if (hasFaseAgent) {
                detected.push(runtime);
                continue;
            }
        }
        // Fallback: check for Codex skills/fase-* directory
        if (runtime === 'codex') {
            const skillsDir = path.join(dir, 'skills');
            if (fs.existsSync(skillsDir)) {
                const hasFaseSkill = fs.readdirSync(skillsDir).some((f) => f.startsWith('fase-'));
                if (hasFaseSkill) {
                    detected.push(runtime);
                    continue;
                }
            }
        }
        // Fallback: check for OpenCode flat commands
        if (runtime === 'opencode') {
            const commandDir = path.join(dir, 'command');
            if (fs.existsSync(commandDir)) {
                const hasFaseCmd = fs
                    .readdirSync(commandDir)
                    .some((f) => f.startsWith('fase-') && f.endsWith('.md'));
                if (hasFaseCmd) {
                    detected.push(runtime);
                    continue;
                }
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
    // execSync already imported at top of file
    // --- 1. Version check ---
    let latestVersion = null;
    try {
        latestVersion = execSync('npm view fase-ai version', {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    }
    catch {
        // offline or npm unavailable — continue anyway
    }
    const currentVersion = pkg.version;
    if (latestVersion && latestVersion !== currentVersion) {
        console.log(`  ${yellow}Atualização disponível!${reset}`);
        console.log(`  Versão atual:      ${dim}v${currentVersion}${reset}`);
        console.log(`  Versão disponível: ${cyan}v${latestVersion}${reset}\n`);
        console.log(`  ${dim}Execute ${cyan}npm install -g fase-ai@latest${reset}${dim} ou ${cyan}npx fase-ai@latest${reset}${dim} para obter a nova versão.${reset}`);
        console.log(`  Continuando com reinstalação da versão atual (v${currentVersion})...\n`);
    }
    else if (latestVersion) {
        console.log(`  ${green}✓${reset} Versão atual ${cyan}v${currentVersion}${reset} é a mais recente.\n`);
        console.log(`  Reinstalando para garantir integridade dos arquivos...\n`);
    }
    else {
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
    const runtimeLabels = {
        claude: 'Claude Code',
        opencode: 'OpenCode',
        gemini: 'Gemini',
        codex: 'Codex',
    };
    const labels = runtimes.map((r) => runtimeLabels[r] || r).join(', ');
    console.log(`  Atualizando: ${cyan}${labels}${reset}\n`);
    // --- 3. Reinstall ---
    installAllRuntimes(runtimes, false);
    // --- 4. Post-update verification ---
    console.log(`\n  ${cyan}Verificando instalação pós-atualização...${reset}\n`);
    try {
        const scriptPath = path.join(__dirname, 'verificar-instalacao.js');
        execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    }
    catch {
        // verificar-instalacao already printed its own errors
    }
    console.log(`\n  ${yellow}Lembrete:${reset} Reinicie o runtime (${labels}) para carregar os novos comandos e agentes.\n`);
}
/**
 * Install FASE for all selected runtimes (local projects only)
 */
function installAllRuntimes(runtimes, isInteractive) {
    const results = [];
    for (const runtime of runtimes) {
        try {
            const result = install(runtime);
            results.push(result);
        }
        catch (err) {
            if (isFaseError(err)) {
                console.error(`\n  ${yellow}${err.message}${reset}`);
            }
            else if (err instanceof Error) {
                console.error(`\n  ${yellow}Erro ao instalar ${runtime}:${reset} ${err.message}`);
            }
            else {
                console.error(`\n  ${yellow}Erro ao instalar ${runtime}${reset}`);
            }
            process.exit(1);
        }
    }
    const statuslineRuntimes = ['claude', 'gemini'];
    const primaryStatuslineResult = results.find((r) => statuslineRuntimes.includes(r.runtime));
    const finalize = (shouldInstallStatusline) => {
        for (const result of results) {
            const useStatusline = statuslineRuntimes.includes(result.runtime) && shouldInstallStatusline;
            finishInstall(result.settingsPath, result.settings, result.statuslineCommand, useStatusline, result.runtime);
        }
    };
    if (primaryStatuslineResult && primaryStatuslineResult.settings) {
        handleStatusline(primaryStatuslineResult.settings, isInteractive, finalize);
    }
    else {
        finalize(false);
    }
}
// Test-only exports — skip main logic when loaded as a module for testing
if (process.env.FASE_TEST_MODE) {
    // Export for both CommonJS and ES modules
    const testExports = {
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
        // Auto-detect mode exports
        isRunningAsPostinstall,
        readProjectConfig,
        detectAvailableRuntimes,
        // Project-local config exports
        getLocalDir,
        getCommitAttribution,
    };
    // Try CommonJS first, fallback to ES module export
    try {
        // @ts-ignore
        module.exports = testExports;
    }
    catch {
        // ES module context - export individually
        Object.assign(globalThis, testExports);
    }
}
else {
    // Main logic
    (async () => {
        // Handle auto-detect mode (postinstall or --auto-detect flag)
        if (hasAutoDetect || isRunningAsPostinstall()) {
            const projectConfig = readProjectConfig();
            if (!projectConfig.auto_install) {
                console.log(`  ${dim}FASE auto-install disabled in .fase-ai/config.json${reset}\n`);
                process.exit(0);
            }
            // Determine runtimes to install
            let runtimesToInstall = selectedRuntimes.length > 0 ? selectedRuntimes : projectConfig.runtimes;
            // If no runtimes specified, try to detect available ones
            if (runtimesToInstall.length === 0) {
                runtimesToInstall = detectAvailableRuntimes();
            }
            console.log(`  ${cyan}FASE${reset} ${dim}v${pkg.version}${reset} — Instalação automática detectada\n`);
            console.log(`  Runtimes: ${runtimesToInstall.join(', ')}\n`);
            installAllRuntimes(runtimesToInstall, false);
            return;
        }
        // Check for updates at session start (unless we're already updating)
        if (!hasAtualizar && !hasUninstall && !hasVerificar) {
            await checkAndPromptForUpdate(pkg.version);
        }
        if (explicitConfigDir) {
            console.error(`  ${yellow}Não é possível usar --config-dir. Instalação agora é sempre local.${reset}`);
            process.exit(1);
        }
        else if (hasAtualizar) {
            atualizar(selectedRuntimes);
        }
        else if (hasUninstall) {
            if (selectedRuntimes.length > 0) {
                const runtimes = selectedRuntimes;
                promptUninstallConfirmation(runtimes);
            }
            else {
                promptUninstallLocation(['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen']);
            }
        }
        else if (selectedRuntimes.length > 0) {
            installAllRuntimes(selectedRuntimes, false);
        }
        else {
            // Interactive - always local now
            if (!process.stdin.isTTY) {
                console.log(`  ${yellow}Terminal não interativo detectado, usando instalação local do Claude Code por padrão${reset}\n`);
                installAllRuntimes(['claude'], false);
            }
            else {
                promptRuntime((runtimes) => {
                    if (runtimes === 'uninstall') {
                        promptUninstallLocation(['claude', 'opencode', 'gemini', 'codex', 'copilot', 'qwen']);
                    }
                    else {
                        promptLocation(Array.isArray(runtimes) ? runtimes : [runtimes]);
                    }
                });
            }
        }
    })();
} // end of else block for FASE_TEST_MODE
//# sourceMappingURL=install.js.map