#!/usr/bin/env node
/**
 * Replace emojis with Font Awesome icon HTML in Markdown files
 * Usage: node scripts/replace-emojis.mjs [target-directory]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Emoji to Font Awesome icon mapping
const emojiMap = {
  // Interface & Status
  '✅': '<i class="fa fa-check-circle"></i>',
  '❌': '<i class="fa fa-times-circle"></i>',
  '⚠️': '<i class="fa fa-warning"></i>',
  '⚡': '<i class="fa fa-bolt"></i>',
  '🔔': '<i class="fa fa-bell"></i>',
  '📢': '<i class="fa fa-bullhorn"></i>',
  '📣': '<i class="fa fa-bullhorn"></i>',

  // Technology & Development
  '🤖': '<i class="fa fa-robot"></i>',
  '💻': '<i class="fa fa-laptop"></i>',
  '⚙️': '<i class="fa fa-cog"></i>',
  '🔧': '<i class="fa fa-wrench"></i>',
  '🛠️': '<i class="fa fa-hammer"></i>',
  '🔨': '<i class="fa fa-hammer"></i>',

  // Data & Documents
  '📋': '<i class="fa fa-list-check"></i>',
  '📄': '<i class="fa fa-file"></i>',
  '📃': '<i class="fa fa-file-text"></i>',
  '📑': '<i class="fa fa-files"></i>',
  '📊': '<i class="fa fa-chart-bar"></i>',
  '📈': '<i class="fa fa-chart-line"></i>',
  '📉': '<i class="fa fa-chart-line"></i>',
  '💾': '<i class="fa fa-floppy-disk"></i>',
  '💿': '<i class="fa fa-floppy-disk"></i>',

  // Navigation & Direction
  '🔄': '<i class="fa fa-arrows-rotate"></i>',
  '🔃': '<i class="fa fa-arrows-rotate"></i>',
  '🔂': '<i class="fa fa-arrows-rotate"></i>',
  '🔁': '<i class="fa fa-arrows-rotate"></i>',
  '➡️': '<i class="fa fa-arrow-right"></i>',
  '⬅️': '<i class="fa fa-arrow-left"></i>',
  '⬆️': '<i class="fa fa-arrow-up"></i>',
  '⬇️': '<i class="fa fa-arrow-down"></i>',
  '📍': '<i class="fa fa-location-dot"></i>',

  // Global & Location
  '🌍': '<i class="fa fa-globe"></i>',
  '🌎': '<i class="fa fa-globe"></i>',
  '🌏': '<i class="fa fa-globe"></i>',
  '🗺️': '<i class="fa fa-map"></i>',

  // Communication
  '💬': '<i class="fa fa-comments"></i>',
  '🗨️': '<i class="fa fa-comments"></i>',
  '💭': '<i class="fa fa-comment-dots"></i>',
  '🗯️': '<i class="fa fa-comment"></i>',
  '📧': '<i class="fa fa-envelope"></i>',
  '📨': '<i class="fa fa-inbox"></i>',
  '📩': '<i class="fa fa-inbox"></i>',

  // Time & Calendar
  '⏰': '<i class="fa fa-clock"></i>',
  '🕐': '<i class="fa fa-clock"></i>',
  '⏱️': '<i class="fa fa-hourglass-end"></i>',
  '⏲️': '<i class="fa fa-stopwatch"></i>',
  '📅': '<i class="fa fa-calendar"></i>',
  '📆': '<i class="fa fa-calendar"></i>',

  // Objects & Things
  '📦': '<i class="fa fa-box"></i>',
  '📫': '<i class="fa fa-mailbox"></i>',
  '🎁': '<i class="fa fa-gift"></i>',
  '🔑': '<i class="fa fa-key"></i>',
  '🔐': '<i class="fa fa-lock"></i>',
  '🔒': '<i class="fa fa-lock"></i>',
  '🔓': '<i class="fa fa-unlock"></i>',

  // Symbols & Marks
  '✓': '<i class="fa fa-check"></i>',
  '✔': '<i class="fa fa-check"></i>',
  '✕': '<i class="fa fa-xmark"></i>',
  '✗': '<i class="fa fa-xmark"></i>',
  '★': '<i class="fa fa-star"></i>',
  '⭐': '<i class="fa fa-star"></i>',
  '◆': '<i class="fa fa-diamond"></i>',

  // People & Roles
  '👤': '<i class="fa fa-user"></i>',
  '👥': '<i class="fa fa-users"></i>',
  '👨‍💻': '<i class="fa fa-user-tie"></i>',
  '👩‍💻': '<i class="fa fa-user-tie"></i>',

  // Other commonly used
  '🎯': '<i class="fa fa-bullseye"></i>',
  '🚀': '<i class="fa fa-rocket"></i>',
  '📌': '<i class="fa fa-thumbtack"></i>',
  '📎': '<i class="fa fa-paperclip"></i>',
  '🎨': '<i class="fa fa-palette"></i>',
  '🔍': '<i class="fa fa-magnifying-glass"></i>',
  '🔎': '<i class="fa fa-magnifying-glass"></i>',
};

/**
 * Recursively process all markdown files in a directory
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip hidden directories and node_modules
      if (file.startsWith('.') || file === 'node_modules') {
        continue;
      }
      processDirectory(filePath);
    } else if (file.endsWith('.md')) {
      processMarkdownFile(filePath);
    }
  }
}

/**
 * Process a single markdown file and replace emojis
 */
function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let replacementCount = 0;

  // Replace each emoji with its Font Awesome equivalent
  for (const [emoji, icon] of Object.entries(emojiMap)) {
    const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, icon);
    if (newContent !== content) {
      replacementCount += (content.match(regex) || []).length;
    }
    content = newContent;
  }

  if (replacementCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ ${filePath.replace(process.cwd(), '')}: ${replacementCount} emojis replaced`);
  }
}

// Main execution
const targetDir = process.argv[2] || path.join(__dirname, '..', 'www', 'docs', 'src', 'content', 'docs');

console.log(`\nScanning for markdown files in: ${targetDir}\n`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

processDirectory(targetDir);
console.log('\n✓ Emoji replacement complete!\n');
