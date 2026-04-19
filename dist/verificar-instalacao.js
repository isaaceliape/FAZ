#!/usr/bin/env node
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
/**
 * Run a shell command and return output
 */
function run(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    }
    catch (e) {
        const err = e;
        const stdout = err.stdout;
        if (typeof stdout === 'string')
            return stdout.trim();
        if (stdout instanceof Buffer)
            return stdout.toString().trim();
        return '';
    }
}
/**
 * Check if file exists
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}
/**
 * Check if directory exists
 */
function dirExists(dirPath) {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}
/**
 * Count files matching pattern in directory
 */
function countFiles(dirPath, pattern) {
    if (!dirExists(dirPath))
        return 0;
    try {
        const files = fs.readdirSync(dirPath).filter((f) => pattern.test(f));
        return files.length;
    }
    catch {
        return 0;
    }
}
/**
 * Count files matching pattern in directory (recursive for skills)
 */
function countFilesRecursive(dirPath, pattern) {
    if (!dirExists(dirPath))
        return 0;
    try {
        let count = 0;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith('fase-')) {
                if (pattern.test('SKILL.md') && fileExists(path.join(dirPath, entry.name, 'SKILL.md'))) {
                    count++;
                }
            }
            else if (entry.isFile() && pattern.test(entry.name)) {
                count++;
            }
        }
        return count;
    }
    catch {
        return 0;
    }
}
/**
 * Get global npm prefix
 */
function getNpmPrefix() {
    try {
        return execSync('npm prefix -g', { encoding: 'utf8' }).trim();
    }
    catch {
        return '';
    }
}
// Main verification logic
console.log('\n' + cyan + '  ═══════════════════════════════════════════════════════════' + reset);
console.log(cyan + '  RELATÓRIO DE VERIFICAÇÃO FASE. v' + pkg.version + reset);
console.log(cyan + '  ═══════════════════════════════════════════════════════════' + reset + '\n');
const issues = [];
const suggestions = [];
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
    }
    catch {
        console.log(`  ${yellow}⚠${reset} Versão: ${pkg.version} (package.json)`);
        console.log(`  ${yellow}⚠${reset} Localização: ${globalPkgPath}`);
    }
}
else {
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
const runtimes = [
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
    },
    {
        name: 'GitHub Copilot',
        configDir: path.join(os.homedir(), '.github-copilot'),
        settingsFile: path.join(os.homedir(), '.github-copilot', '.copilot-settings.json'),
        commandsDir: path.join(os.homedir(), '.github-copilot', 'commands'),
        hooksDir: path.join(os.homedir(), '.github-copilot', 'hooks'),
        commandPattern: /^fase-.*\.md$/,
        hookPattern: /^fase-.*\.js$/,
        installFlag: '--github-copilot'
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
        }
        else {
            hasSettings = runtime.settingsFile !== undefined && fileExists(runtime.settingsFile);
        }
        if (hasSettings) {
            console.log(`    ${green}✓${reset} ${settingsLabel}: OK`);
        }
        else {
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
        }
        else if (runtime.commandsDir && runtime.commandPattern) {
            commandCount = countFiles(runtime.commandsDir, runtime.commandPattern);
        }
        if (commandCount > 0) {
            console.log(`    ${green}✓${reset} ${commandLabel}: ${commandCount} encontrados`);
        }
        else {
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
            }
            else {
                console.log(`    ${yellow}⚠${reset} Hooks: ${yellow}0${reset} encontrados`);
                // Hooks are optional, so just a warning
            }
        }
    }
    else {
        console.log(`    ${dim}- Settings: MISSING${reset}`);
        console.log(`    ${dim}- Comandos FASE: 0 encontrados${reset}`);
    }
}
console.log('\n');
console.log('\n');
// 5. Summary
console.log(cyan + '═══════════════════════════════════════════════════════════' + reset);
if (issues.length === 0) {
    console.log(`\n  ${green}${bold}✅ FASE. está instalado e configurado corretamente!${reset}\n`);
}
else {
    console.log(`\n  ${red}${bold}⚠️  ${issues.length} PROBLEMA(S) ENCONTRADO(S):${reset}\n`);
    for (let i = 0; i < issues.length; i++) {
        console.log(`  ${i + 1}. ${yellow}${issues[i]}${reset}`);
    }
    console.log(`\n  ${bold}💡 AÇÕES SUGERIDAS:${reset}\n`);
    // Sort suggestions by priority
    suggestions.sort((a, b) => a.priority - b.priority);
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
//# sourceMappingURL=verificar-instalacao.js.map