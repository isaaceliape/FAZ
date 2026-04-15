/**
 * FASE Test Helper — Common setup for testes/ directory
 * 
 * Usage: mocha testes/*.test.cjs --require ./testes/test-helper.cjs
 */

const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';

// Resolve paths relative to project root
const ROOT_DIR = path.join(__dirname, '..');
const BIN_DIR = path.join(ROOT_DIR, 'bin');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

/**
 * Verify test prerequisites
 */
function verifyTestSetup() {
  const errors = [];
  
  // Check dist directory exists (tests need compiled code)
  if (!fs.existsSync(DIST_DIR)) {
    errors.push('dist/ directory not found. Run `npm run build` first.');
  }
  
  // Check critical compiled files
  const criticalFiles = ['install.js', 'fase-tools.js'];
  for (const file of criticalFiles) {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`dist/${file} not found. Run 'npm run build'.`);
    }
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Test setup validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease run: npm run build\n');
    process.exit(1);
  }
}

// Run verification
verifyTestSetup();

module.exports = { ROOT_DIR, BIN_DIR, SRC_DIR, DIST_DIR };
