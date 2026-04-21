#!/usr/bin/env node
// Verifica atualizações do FASE em segundo plano e salva resultado no cache
// Chamado pelo hook SessionStart — executa uma vez por sessão

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cwd = process.cwd();

// Detecta o diretório de configuração do runtime (suporta Claude, OpenCode, Gemini)
// Respeita CLAUDE_CONFIG_DIR para configurações com diretório customizado
function detectConfigDir(baseDir) {
  // Verifica variável de ambiente primeiro (suporta configurações multi-conta)
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir && fs.existsSync(path.join(envDir, 'fase-ai', 'VERSION'))) {
    return envDir;
  }
  for (const dir of ['.config/opencode', '.opencode', '.gemini', '.claude']) {
    if (fs.existsSync(path.join(baseDir, dir, 'fase-ai', 'VERSION'))) {
      return path.join(baseDir, dir);
    }
  }
  return envDir || path.join(baseDir, '.claude');
}

const globalConfigDir = detectConfigDir(homeDir);
const projectConfigDir = detectConfigDir(cwd);
const cacheDir = path.join(globalConfigDir, 'cache');
const cacheFile = path.join(cacheDir, 'fase-update-check.json');

// Localização dos arquivos VERSION (verifica projeto primeiro, depois global)
const projectVersionFile = path.join(projectConfigDir, 'fase-ai', 'VERSION');
const globalVersionFile = path.join(globalConfigDir, 'fase-ai', 'VERSION');

// Garante que o diretório de cache existe
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Executa verificação em segundo plano (processo separado; windowsHide evita flash de console no Windows)
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execSync } = require('child_process');

  const cacheFile = ${JSON.stringify(cacheFile)};
  const projectVersionFile = ${JSON.stringify(projectVersionFile)};
  const globalVersionFile = ${JSON.stringify(globalVersionFile)};

  // Verifica diretório do projeto primeiro (instalação local), depois global
  let installed = '0.0.0';
  try {
    if (fs.existsSync(projectVersionFile)) {
      installed = fs.readFileSync(projectVersionFile, 'utf8').trim();
    } else if (fs.existsSync(globalVersionFile)) {
      installed = fs.readFileSync(globalVersionFile, 'utf8').trim();
    }
  } catch (e) {}

  let latest = null;
  try {
    latest = execSync('npm view fase-ai version', { encoding: 'utf8', timeout: 10000, windowsHide: true }).trim();
  } catch (e) {}

  const result = {
    update_available: latest && installed !== latest,
    installed,
    latest: latest || 'unknown',
    checked: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(cacheFile, JSON.stringify(result));
`], {
  stdio: 'ignore',
  windowsHide: true,
  detached: true  // Necessário no Windows para desanexar o processo corretamente
});

child.unref();
