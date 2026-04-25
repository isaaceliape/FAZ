#!/usr/bin/env node

/**
 * FASE Documentation Builder
 *
 * Reads markdown files from docs/*.md and generates static HTML pages
 * using templates/doc-page.html and styles/docs.css.
 *
 * This serves as a fallback for GitHub Pages deployment if Astro build fails.
 * Portuguese documentation complementing the English docs in www/docs/.
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Paths
const rootDir = __dirname;
const docsDir = path.join(rootDir, 'docs');
const templatePath = path.join(rootDir, 'templates', 'doc-page.html');
const cssPath = path.join(rootDir, 'styles', 'docs.css');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
const version = packageJson.version;

// Read template and CSS files
const template = fs.readFileSync(templatePath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

// Navigation items
const docs = [
  { file: 'index.html', label: 'README', icon: '<i class="fa fa-book"></i>' },
  { file: 'COMANDOS.html', label: 'Comandos', icon: '<i class="fa fa-list-check"></i>' },
  {
    file: 'GUIA-DO-USUARIO.html',
    label: 'Guia do Usuário',
    icon: '<i class="fa fa-book-open"></i>',
  },
  {
    file: 'CONTRIBUINDO.html',
    label: 'Guia de Contribuição',
    icon: '<i class="fa fa-handshake"></i>',
  },
  { file: 'HOOKS.html', label: 'Git Hooks', icon: '<i class="fa fa-wrench"></i>' },
  { file: 'NPM-REGISTRY.html', label: 'NPM Registry', icon: '<i class="fa fa-box"></i>' },
  {
    file: 'technical/padronizacao-caminhos.html',
    label: 'Padronização de Caminhos',
    icon: '<i class="fa fa-road"></i>',
  },
  {
    file: 'maintainers/MANTENEDORES.html',
    label: 'Guia de Maintainers',
    icon: '<i class="fa fa-user-tie"></i>',
  },
  {
    file: 'CONTEXT-MONITOR.html',
    label: 'Monitor de Contexto',
    icon: '<i class="fa fa-chart-bar"></i>',
  },
];

/**
 * Generate sidebar links with correct relative paths
 */
function generateSidebarLinks(currentFile) {
  const currentDir = currentFile.includes('/') ? currentFile.split('/')[0] : '';

  return docs
    .map((doc) => {
      const isActive = doc.file === currentFile ? 'active' : '';
      let linkPath;

      if (currentDir === '') {
        linkPath = doc.file;
      } else {
        const docDir = doc.file.includes('/') ? doc.file.split('/')[0] : '';
        if (docDir === currentDir) {
          linkPath = doc.file.split('/').pop();
        } else if (docDir === '') {
          linkPath = '../' + doc.file;
        } else {
          linkPath = '../' + doc.file;
        }
      }

      return `<a href="${linkPath}" class="sidebar-link ${isActive}">${doc.icon} ${doc.label}</a>`;
    })
    .join('\n');
}

/**
 * Render HTML template with placeholders
 */
function renderTemplate(title, currentFile, content) {
  const currentDir = currentFile.includes('/') ? currentFile.split('/')[0] : '';
  const homeLink = currentDir === '' ? 'index.html' : '../index.html';

  return template
    .replace('{{TITLE}}', title)
    .replace('{{CSS}}', cssContent)
    .replace('{{HOME_LINK}}', homeLink)
    .replace('{{SIDEBAR_LINKS}}', generateSidebarLinks(currentFile))
    .replace('{{VERSION}}', version)
    .replace('{{CONTENT}}', content);
}

/**
 * Recursively find all markdown files in docs directory
 */
function getAllMarkdownFiles(dir, prefix = '') {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(itemPath, prefix ? `${prefix}/${item}` : item));
    } else if (item.endsWith('.md')) {
      files.push({
        file: item,
        path: itemPath,
        prefix: prefix,
        fullPath: prefix ? `${prefix}/${item}` : item,
      });
    }
  });

  return files;
}

// Main build
console.log('🔨 Building documentation pages...\n');
console.log(`   Template: ${templatePath}`);
console.log(`   CSS: ${cssPath}`);
console.log(`   Version: ${version}\n`);

const markdownFiles = getAllMarkdownFiles(docsDir);

markdownFiles.forEach(({ file, path: filePath, prefix, fullPath }) => {
  let markdown = fs.readFileSync(filePath, 'utf-8');

  // Replace hardcoded version strings with actual version
  markdown = markdown.replace(/> \*\*Versão\*\*:\s*[\d.]+\s*\|/g, `> **Versão**: ${version} |`);
  markdown = markdown.replace(/\*\*Versão\*\*:\s*[\d.]+/g, `**Versão**: ${version}`);
  markdown = markdown.replace(/> \*\*Version\*\*:\s*[\d.]+\s*\|/g, `> **Version**: ${version} |`);
  markdown = markdown.replace(/\*\*Version\*\*:\s*[\d.]+/g, `**Version**: ${version}`);

  const title = file.replace('.md', '');
  const htmlFileName = file === 'README.md' ? 'readme.html' : file.replace('.md', '.html');
  const html = marked(markdown);

  // Create subdirectory if needed
  if (prefix) {
    const subDir = path.join(docsDir, prefix);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
  }

  const htmlFile = prefix
    ? path.join(docsDir, prefix, htmlFileName)
    : path.join(docsDir, htmlFileName);

  const fullHtmlFileName = prefix ? `${prefix}/${htmlFileName}` : htmlFileName;

  fs.writeFileSync(htmlFile, renderTemplate(title, fullHtmlFileName, html));
  console.log(`✅ ${fullPath} → ${htmlFile.replace(docsDir, 'docs')}`);

  // Create index.html for README.md
  if (file === 'README.md') {
    const indexFile = path.join(docsDir, 'index.html');
    fs.writeFileSync(indexFile, renderTemplate(title, 'index.html', html));
    console.log(`✅ ${fullPath} → ${indexFile.replace(docsDir, 'docs')} (index)`);
  }
});

console.log('\n✨ Documentation build complete!');
console.log('📂 HTML files created in', docsDir);
console.log('🎨 Styles from styles/docs.css');
console.log('📄 Template from templates/doc-page.html');
