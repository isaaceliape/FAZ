#!/usr/bin/env node
/**
 * Post-build script: restore shebangs, set executable permissions, and copy static directories
 *
 * TypeScript does not preserve `#!/usr/bin/env node` lines during compilation
 * because they are not valid JS/TS syntax. This script:
 * 1. Prepends shebangs to CLI entry points
 * 2. Marks them executable
 * 3. Copies static directories (.github/commands, .github/agents, fase-shared, docs) to dist/
 */

import { readFileSync, writeFileSync, chmodSync, existsSync, readdirSync, mkdirSync, copyFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

const SHEBANG = '#!/usr/bin/env node\n';
const CLI_FILES = ['install.js', 'verificar-instalacao.js'];
const STATIC_DIRS = ['.github/commands', '.github/agents', 'fase-shared', 'docs'];

// Copy static directories from root to dist/
function copyStaticDir(dirName) {
  const srcPath = join(rootDir, dirName);
  const destPath = join(distDir, dirName);

  if (!existsSync(srcPath)) {
    console.warn(`  skip ${dirName}/ — not found in root`);
    return;
  }

  // Recursively copy directory
  function copyDirRecursive(src, dest) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    for (const file of readdirSync(src)) {
      const srcFile = join(src, file);
      const destFile = join(dest, file);
      const stat = statSync(srcFile);
      if (stat.isDirectory()) {
        copyDirRecursive(srcFile, destFile);
      } else {
        copyFileSync(srcFile, destFile);
      }
    }
  }

  copyDirRecursive(srcPath, destPath);
  console.log(`  ✓ copied ${dirName}/`);
}

// Copy static directories
for (const dir of STATIC_DIRS) {
  copyStaticDir(dir);
}

// Process CLI entry points
for (const file of CLI_FILES) {
  const filePath = join(distDir, file);
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    console.warn(`  skip ${file} — not found in dist/`);
    continue;
  }
  if (!content.startsWith('#!')) {
    writeFileSync(filePath, SHEBANG + content);
    console.log(`  ✓ shebang added to ${file}`);
  } else {
    console.log(`  ✓ ${file} already has shebang`);
  }
  chmodSync(filePath, 0o755);
}
