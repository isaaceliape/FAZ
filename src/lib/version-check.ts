/**
 * Version Check — Check for updates and prompt user to update
 */

import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Colors for terminal output
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

export interface VersionInfo {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
}

/**
 * Check the latest version from npm
 */
export function getLatestVersion(): string | null {
  try {
    const result = execSync('npm view fase-ai version', {
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Check if an update is available
 */
export function checkForUpdate(currentVersion: string): VersionInfo {
  const latest = getLatestVersion();

  if (!latest) {
    return {
      current: currentVersion,
      latest: null,
      updateAvailable: false
    };
  }

  return {
    current: currentVersion,
    latest,
    updateAvailable: compareVersions(currentVersion, latest) < 0
  };
}

/**
 * Prompt user to update
 */
export function promptForUpdate(versionInfo: VersionInfo): Promise<boolean> {
  return new Promise((resolve) => {
    if (!versionInfo.updateAvailable || !versionInfo.latest) {
      resolve(false);
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('');
    console.log(`  ${yellow}╔══════════════════════════════════════════════════════════════╗${reset}`);
    console.log(`  ${yellow}║${reset}  ${green}Nova versão do FASE disponível!${reset}                            ${yellow}║${reset}`);
    console.log(`  ${yellow}╠══════════════════════════════════════════════════════════════╣${reset}`);
    console.log(`  ${yellow}║${reset}  Versão atual:      ${dim}v${versionInfo.current}${reset}                              ${yellow}║${reset}`);
    console.log(`  ${yellow}║${reset}  Nova versão:       ${cyan}v${versionInfo.latest}${reset}                              ${yellow}║${reset}`);
    console.log(`  ${yellow}╠══════════════════════════════════════════════════════════════╣${reset}`);
    console.log(`  ${yellow}║${reset}  ${dim}Execute 'npx fase-ai --atualizar' para atualizar${reset}           ${yellow}║${reset}`);
    console.log(`  ${yellow}╚══════════════════════════════════════════════════════════════╝${reset}`);
    console.log('');

    // Only prompt if we're in an interactive terminal
    if (!process.stdin.isTTY) {
      resolve(false);
      return;
    }

    let answered = false;

    rl.on('close', () => {
      if (!answered) {
        answered = true;
        resolve(false);
      }
    });

    rl.question(`  Deseja atualizar agora? ${dim}[s/N]${reset}: `, (answer) => {
      answered = true;
      rl.close();
      const choice = (answer.trim() || 'n').toLowerCase();
      resolve(choice === 's' || choice === 'sim' || choice === 'y' || choice === 'yes');
    });
  });
}

/**
 * Run the update process
 */
export function runUpdate(): void {
  console.log('');
  console.log(`  ${cyan}Atualizando FASE...${reset}`);
  console.log('');

  try {
    execSync('npx fase-ai --atualizar', {
      stdio: 'inherit',
      timeout: 120000
    });
  } catch (error) {
    console.log(`  ${red}✗${reset} Falha ao atualizar. Tente manualmente:`);
    console.log(`     ${cyan}npx fase-ai@latest${reset}`);
    process.exit(1);
  }
}

/**
 * Check cache for update info (from the background hook)
 * NOTE: This is READ-ONLY. The cache file is written by external hooks, not by FASE.
 * FASE never writes to ~/.claude/ — all FASE state is kept in ~/.fase-ai/
 */
export function getCachedUpdateInfo(): VersionInfo | null {
  try {
    const homeDir = os.homedir();
    const cacheDir = path.join(homeDir, '.claude', 'cache');
    const cacheFile = path.join(cacheDir, 'fase-update-check.json');

    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    const content = fs.readFileSync(cacheFile, 'utf8');
    const data = JSON.parse(content);

    // Check if cache is fresh (less than 24 hours old)
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const checked = (data.checked || 0) * 1000;

    if (now - checked > CACHE_TTL_MS) {
      return null; // Cache is stale
    }

    return {
      current: data.installed,
      latest: data.latest,
      updateAvailable: data.update_available
    };
  } catch {
    return null;
  }
}

/**
 * Main entry point: check for updates and optionally prompt user
 */
export async function checkAndPromptForUpdate(currentVersion: string, forceCheck = false): Promise<void> {
  let versionInfo: VersionInfo | null = null;

  // First try to use cached info from the background hook
  if (!forceCheck) {
    versionInfo = getCachedUpdateInfo();
  }

  // If no cache or forced, check directly
  if (!versionInfo) {
    versionInfo = checkForUpdate(currentVersion);
  }

  if (!versionInfo.updateAvailable) {
    return;
  }

  const shouldUpdate = await promptForUpdate(versionInfo);

  if (shouldUpdate) {
    runUpdate();
    // After update, exit this process
    process.exit(0);
  }
}
