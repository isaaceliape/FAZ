import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

// Get version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

interface Suggestion {
  priority: number;
  issue: string;
  command: string;
  description: string;
}

interface Runtime {
  name: string;
  configDir: string;
  settingsFile?: string;
  commandsDir?: string;
  hooksDir?: string;
  commandPattern?: RegExp;
  hookPattern?: RegExp;
  configFile?: string;
  skillsDir?: string;
  skillPattern?: RegExp;
  installFlag: string;
}

/**
 * Run a shell command and return output
 */
function run(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e: unknown) {
    const err = e as { stdout?: unknown };
    const stdout = err.stdout;
    if (typeof stdout === 'string') return stdout.trim();
    if (stdout instanceof Buffer) return stdout.toString().trim();
    return '';
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if directory exists
 */
function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Count files matching pattern in directory
 */
function countFiles(dirPath: string, pattern: RegExp): number {
  if (!dirExists(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath).filter((f: string) => pattern.test(f));
    return files.length;
  } catch (e) {
    const err = e as { message?: string };
    console.error(`[verificar-instalacao] Erro ao contar arquivos em ${dirPath}: ${err.message}`);
    return 0;
  }
}

/**
 * Count files matching pattern in directory (recursive for skills)
 */
function countFilesRecursive(dirPath: string, pattern: RegExp): number {
  if (!dirExists(dirPath)) return 0;
  try {
    let count = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('fase-')) {
        if (pattern.test('SKILL.md') && fileExists(path.join(dirPath, entry.name, 'SKILL.md'))) {
          count++;
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        count++;
      }
    }
    return count;
  } catch (e) {
    const err = e as { message?: string };
    console.error(`[verificar-instalacao] Erro ao contar arquivos recursivos em ${dirPath}: ${err.message}`);
    return 0;
  }
}

/**
 * Get global npm prefix
 */
function getNpmPrefix(): string {
  try {
    return execSync('npm prefix -g', { encoding: 'utf8' }).trim();
  } catch (e) {
    const err = e as { message?: string };
    console.error(`[verificar-instalacao] Erro ao obter prefixo npm global: ${err.message}`);
    return '';
  }
}

// Main verification logic
console.log('\n' + cyan + '  ═══════════════════════════════════════════════════════════' + reset);
console.log(cyan + '  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v' + pkg.version + reset);
console.log(cyan + '  ═══════════════════════════════════════════════════════════' + reset + '\n');

const issues: string[] = [];
const suggestions: Suggestion[] = [];

// 1. Check global package installation
console.log(bold + '📦 INSTALAÇÃO DO PACOTE' + reset);
const npmPrefix = getNpmPrefix();
const globalPkgPath = npmPrefix ? path.join(npmPrefix, 'node_modules', 'fase-ai') : '';
const isInstalled = globalPkgPath && fileExists(globalPkgPath);

if (isInstalled) {
  console.log(`  ${green}✓${reset} Status: ${green}INSTALADO${reset}`);
  try {
    const version = run('npx fase-ai --version 2>/dev/null') || pkg.version;
    console.log(`  ${green}✓${reset} Versão: ${version}`);
    console.log(`  ${green}✓${reset} Localização: ${globalPkgPath}`);
  } catch (e) {
    const err = e as { message?: string };
    console.error(`[verificar-instalacao] Erro ao obter versão do pacote: ${err.message}`);
    console.log(`  ${yellow}⚠${reset} Versão: ${pkg.version} (package.json)`);
    console.log(`  ${yellow}⚠${reset} Localização: ${globalPkgPath}`);
  }
} else {
  console.log(`  ${red}✗${reset} Status: ${red}NÃO INSTALADO${reset}`);
  issues.push('Pacote fase-ai não instalado globalmente');
  suggestions.push({
    priority: 1,
    issue: 'Pacote não instalado',
    command: 'npm install -g fase-ai@latest',
    description: 'Instalar FASE globalmente'
  });
}

console.log();

// 2. Check runtimes
console.log(bold + '🔧 RUNTIMES CONFIGURADOS' + reset);

const runtimes: Runtime[] = [
  {
    name: 'Claude Code',
    configDir: path.join(os.homedir(), '.claude'),
    settingsFile: path.join(os.homedir(), '.claude', 'settings.json'),
    commandsDir: path.join(os.homedir(), '.claude', 'commands'),
    hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
    commandPattern: /^fase-.*\.md$/,
    hookPattern: /^fase-.*\.js$/,
    installFlag: '--claude'
  },
  {
    name: 'OpenCode',
    configDir: path.join(os.homedir(), '.config', 'opencode'),
    settingsFile: path.join(os.homedir(), '.config', 'opencode', 'opencode.json'),
    commandsDir: path.join(os.homedir(), '.config', 'opencode', 'command'),
    commandPattern: /^fase-.*\.md$/,
    installFlag: '--opencode'
  },
  {
    name: 'Gemini',
    configDir: path.join(os.homedir(), '.gemini'),
    settingsFile: path.join(os.homedir(), '.gemini', 'settings.json'),
    commandsDir: path.join(os.homedir(), '.gemini', 'commands'),
    commandPattern: /^fase-.*\.toml$/,
    installFlag: '--gemini'
  },
  {
    name: 'Codex',
    configDir: path.join(os.homedir(), '.codex'),
    configFile: path.join(os.homedir(), '.codex', 'config.toml'),
    skillsDir: path.join(os.homedir(), '.codex', 'skills'),
    skillPattern: /^fase-/,
    installFlag: '--codex'
  }
];

for (const runtime of runtimes) {
  const isConfigured = dirExists(runtime.configDir);
  const statusColor = isConfigured ? green : yellow;
  const statusText = isConfigured ? 'CONFIGURADO' : 'NÃO_CONFIGURADO';

  console.log(`\n  ${bold}${runtime.name}:${reset} ${statusColor}${statusText}${reset}`);

  if (isConfigured) {
    // Check settings/config
    let hasSettings = false;
    let settingsLabel = 'Settings';

    if (runtime.name === 'Codex') {
      hasSettings = runtime.configFile !== undefined && fileExists(runtime.configFile);
      settingsLabel = 'Config';
    } else {
      hasSettings = runtime.settingsFile !== undefined && fileExists(runtime.settingsFile);
    }

    if (hasSettings) {
      console.log(`    ${green}✓${reset} ${settingsLabel}: OK`);
    } else {
      console.log(`    ${yellow}⚠${reset} ${settingsLabel}: MISSING`);
      issues.push(`${runtime.name}: ${settingsLabel} ausente`);
      suggestions.push({
        priority: 2,
        issue: `${runtime.name} sem configuração`,
        command: `npx fase-ai ${runtime.installFlag}`,
        description: `Configurar FASE para ${runtime.name}`
      });
    }

    // Check commands/skills
    let commandCount = 0;
    let commandLabel = 'Comandos FASE';

    if (runtime.name === 'Codex') {
      commandCount = runtime.skillsDir !== undefined && runtime.skillPattern !== undefined
        ? countFilesRecursive(runtime.skillsDir, runtime.skillPattern)
        : 0;
      commandLabel = 'Skills FASE';
    } else if (runtime.commandsDir && runtime.commandPattern) {
      commandCount = countFiles(runtime.commandsDir, runtime.commandPattern);
    }

    if (commandCount > 0) {
      console.log(`    ${green}✓${reset} ${commandLabel}: ${commandCount} encontrados`);
    } else {
      console.log(`    ${red}✗${reset} ${commandLabel}: ${green}0${reset} encontrados`);
      issues.push(`${runtime.name}: Sem comandos FASE instalados`);
      suggestions.push({
        priority: 2,
        issue: `${runtime.name} sem comandos`,
        command: `npx fase-ai ${runtime.installFlag}`,
        description: `Instalar comandos FASE para ${runtime.name}`
      });
    }

    // Check hooks (Claude Code only)
    if (runtime.hooksDir) {
      const hookCount = countFiles(runtime.hooksDir, runtime.hookPattern || /^fase-.*\.js$/);
      if (hookCount > 0) {
        console.log(`    ${green}✓${reset} Hooks: ${hookCount} encontrados`);
      } else {
        console.log(`    ${yellow}⚠${reset} Hooks: ${yellow}0${reset} encontrados`);
        // Hooks are optional, so just a warning
      }
    }
  } else {
    console.log(`    ${dim}- Settings: MISSING${reset}`);
    console.log(`    ${dim}- Comandos FASE: 0 encontrados${reset}`);
  }
}

console.log('\n');

// 3. Check shared FASE files (~/.fase-ai/)
console.log(bold + '📁 CONTEÚDO COMPARTILHADO (FASE v3.2+)' + reset);
const sharedDir = path.join(os.homedir(), '.fase-ai');
const hasSharedDir = dirExists(sharedDir);
const versionFile = path.join(sharedDir, 'VERSION');
const changelogFile = path.join(sharedDir, 'CHANGELOG.md');
const templatesDir = path.join(sharedDir, 'templates');
const referencesDir = path.join(sharedDir, 'references');

if (hasSharedDir) {
  console.log(`  ${green}✓${reset} Diretório ~/.fase-ai: EXISTS`);

  if (fileExists(versionFile)) {
    try {
      const versionContent = fs.readFileSync(versionFile, 'utf8').trim();
      console.log(`  ${green}✓${reset} VERSION: ${versionContent}`);
    } catch {
      console.log(`  ${yellow}⚠${reset} VERSION: não legível`);
    }
  } else {
    console.log(`  ${yellow}⚠${reset} VERSION: não encontrado`);
  }

  const templateCount = dirExists(templatesDir) ? countFiles(templatesDir, /\.md$/) : 0;
  const referenceCount = dirExists(referencesDir) ? countFiles(referencesDir, /\.md$/) : 0;

  console.log(`  ${templateCount > 0 ? green : yellow}${templateCount > 0 ? '✓' : '⚠'}${reset} Templates: ${templateCount > 0 ? templateCount + ' encontrados' : 'nenhum'}`);
  console.log(`  ${referenceCount > 0 ? green : yellow}${referenceCount > 0 ? '✓' : '⚠'}${reset} References: ${referenceCount > 0 ? referenceCount + ' encontrados' : 'nenhum'}`);
} else {
  console.log(`  ${yellow}⚠${reset} Diretório ~/.fase-ai: ${yellow}NÃO ENCONTRADO${reset}`);
  console.log(`  ${dim}(Será criado na próxima instalação/atualização)${reset}`);
}

console.log('\n');

// 4. Check workflows (legacy)
console.log(bold + '📁 WORKFLOWS FASE' + reset);
const workflowsDir = path.join(os.homedir(), '.fase', 'workflows');
const hasWorkflowsDir = dirExists(path.join(os.homedir(), '.fase'));
const hasWorkflowsSubdir = dirExists(workflowsDir);

if (hasWorkflowsDir && hasWorkflowsSubdir) {
  const workflowCount = countFiles(workflowsDir, /\.md$/);
  if (workflowCount > 0) {
    console.log(`  ${green}✓${reset} Diretório ~/.fase: EXISTS`);
    console.log(`  ${green}✓${reset} Workflows disponíveis: ${workflowCount}`);
  } else {
    console.log(`  ${green}✓${reset} Diretório ~/.fase: EXISTS`);
    console.log(`  ${yellow}⚠${reset} Workflows disponíveis: ${yellow}0${reset}`);
    issues.push('Nenhum workflow encontrado em ~/.fase/workflows');
    suggestions.push({
      priority: 3,
      issue: 'Workflows ausentes',
      command: 'mkdir -p ~/.fase/workflows',
      description: 'Criar diretório de workflows e copiar do projeto'
    });
  }
} else {
  console.log(`  ${red}✗${reset} Diretório ~/.fase: ${red}MISSING${reset}`);
  console.log(`  ${red}✗${reset} Workflows disponíveis: ${red}0${reset}`);
  issues.push('Diretório ~/.fase não existe');
  suggestions.push({
    priority: 3,
    issue: 'Diretório de workflows ausente',
    command: 'mkdir -p ~/.fase/workflows',
    description: 'Criar diretório de workflows'
  });
}

console.log('\n');

// 5. Summary
console.log(cyan + '═══════════════════════════════════════════════════════════' + reset);

if (issues.length === 0) {
  console.log(`\n  ${green}${bold}✅ F.A.S.E. está instalado e configurado corretamente!${reset}\n`);
} else {
  console.log(`\n  ${red}${bold}⚠️  ${issues.length} PROBLEMA(S) ENCONTRADO(S):${reset}\n`);

  for (let i = 0; i < issues.length; i++) {
    console.log(`  ${i + 1}. ${yellow}${issues[i]}${reset}`);
  }

  console.log(`\n  ${bold}💡 AÇÕES SUGERIDAS:${reset}\n`);

  // Sort suggestions by priority
  suggestions.sort((a: Suggestion, b: Suggestion) => a.priority - b.priority);

  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    console.log(`  ${i + 1}. ${yellow}${s.issue}${reset}`);
    console.log(`     ${dim}Comando:${reset} ${cyan}${s.command}${reset}`);
    console.log(`     ${dim}${s.description}${reset}\n`);
  }
}

console.log(cyan + '═══════════════════════════════════════════════════════════' + reset + '\n');

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);
