#!/usr/bin/env node
/**
 * Sync version from package.json to landing page and documentation files
 *
 * This script automatically updates version references in:
 * - www/index.html (status badge, installer ASCII art)
 * - docs/index.html (version badge)
 *
 * Run this as part of the build process to ensure version consistency.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

console.log(`📦 Syncing version: v${version}`);

// Files to update
const filesToUpdate = [
  { path: join(rootDir, 'www', 'index.html'), name: 'Landing page (www/index.html)' },
  { path: join(rootDir, 'docs', 'index.html'), name: 'Documentation (docs/index.html)' },
];

let updatedCount = 0;

for (const file of filesToUpdate) {
  if (!existsSync(file.path)) {
    console.warn(`  ⚠️  ${file.name} not found, skipping`);
    continue;
  }

  let content = readFileSync(file.path, 'utf-8');
  let originalContent = content;

  // Pattern 1: Status badge version (e.g., "✓ v3.5.3 - Todos os testes passando")
  content = content.replace(
    /(✓\s*v)\d+\.\d+\.\d+(\s+-\s+Todos os testes passando)/,
    `$1${version}$2`
  );

  // Pattern 2: Installer ASCII art version (e.g., "Instalador Interativo v2.5.0")
  content = content.replace(/(Instalador Interativo\s+v)\d+\.\d+\.\d+/, `$1${version}`);

  // Pattern 3: Version badge in docs (e.g., "📦 Versão 3.5.3 ✓ Testes Passando")
  content = content.replace(/(📦\s+Versão\s+)\d+\.\d+\.\d+/, `$1${version}`);

  // Pattern 4: Version badge text with date (e.g., "Versão: 3.5.3 | Última atualização")
  content = content.replace(/(<strong>Versão<\/strong>:\s*)\d+\.\d+\.\d+/, `$1${version}`);

  if (content !== originalContent) {
    writeFileSync(file.path, content, 'utf-8');
    console.log(`  ✓ Updated ${file.name}`);
    updatedCount++;
  } else {
    console.log(`  ✓ ${file.name} already up to date`);
  }
}

console.log(`\n✅ Version sync complete! Updated ${updatedCount} file(s).`);
