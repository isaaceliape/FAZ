#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));
const version = packageJson.version;

const docs = [
  { file: "index.html", label: "README", icon: "<i class=\"fa fa-book\"></i>" },
  { file: "COMANDOS.html", label: "Comandos", icon: "<i class=\"fa fa-list-check\"></i>" },
  { file: "GUIA-DO-USUARIO.html", label: "Guia do Usuário", icon: "<i class=\"fa fa-book-open\"></i>" },
  { file: "CONTRIBUINDO.html", label: "Guia de Contribuição", icon: "<i class=\"fa fa-handshake\"></i>" },
  { file: "HOOKS.html", label: "Git Hooks", icon: "<i class=\"fa fa-wrench\"></i>" },
  { file: "NPM-REGISTRY.html", label: "NPM Registry", icon: "<i class=\"fa fa-box\"></i>" },
  { file: "technical/padronizacao-caminhos.html", label: "Padronização de Caminhos", icon: "<i class=\"fa fa-road\"></i>" },
  { file: "maintainers/MANTENEDORES.html", label: "Guia de Maintainers", icon: "<i class=\"fa fa-user-tie\"></i>" },
  { file: "CONTEXT-MONITOR.html", label: "Monitor de Contexto", icon: "<i class=\"fa fa-chart-bar\"></i>" },
];

const htmlTemplate = (title, currentFile, content) => {
  // Get directory of current file
  const currentDir = currentFile.includes('/') ? currentFile.split('/')[0] : '';

  const sidebarLinks = docs
    .map((doc) => {
      const isActive = doc.file === currentFile ? "active" : "";
      let linkPath;

      // Calculate relative path for the link
      if (currentDir === '') {
        // Current file is at root level (index.html, COMANDOS.html, etc.)
        linkPath = doc.file;
      } else {
        // Current file is in a subdirectory (technical/, maintainers/)
        const docDir = doc.file.includes('/') ? doc.file.split('/')[0] : '';

        if (docDir === currentDir) {
          // Same subdirectory - just use filename
          linkPath = doc.file.split('/').pop();
        } else if (docDir === '') {
          // Target is at root - go up one level
          linkPath = '../' + doc.file;
        } else {
          // Target is in different subdirectory - go up and then into subdirectory
          linkPath = '../' + doc.file;
        }
      }

      return `<a href="${linkPath}" class="sidebar-link ${isActive}">${doc.icon} ${doc.label}</a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>${title} - FASE Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-dWl2hjFlPDATYNKGRekq9h+OhN6Z3BYV+VCugMzKa+2ZgIVsK0Y2SjC1+e6i7B9WDu9Zy4gxXVW5tADhJYXnzw==" crossorigin="anonymous" referrerpolicy="no-referrer">
  <style>
    :root {
      --primary: #00ff88;
      --secondary: #00bfff;
      --warning: #ffaa00;
      --danger: #ff3366;
      --dark-bg: #0a0e27;
      --grid-bg: #111827;
      --text: #e5e7eb;
      --dim: #9ca3af;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: var(--dark-bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .header {
      background-color: var(--grid-bg);
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
      padding: 20px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.5px;
      text-decoration: none;
      transition: color 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .logo:hover {
      color: var(--primary);
    }

    .logo span {
      color: var(--primary);
    }

    .logo:hover span {
      color: var(--secondary);
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      color: var(--text);
      text-decoration: none;
      transition: color 0.2s ease;
      border: none;
    }

    .nav-links a:hover {
      color: var(--primary);
    }

    .content-wrapper {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 250px;
      background-color: var(--grid-bg);
      border-right: 1px solid rgba(0, 255, 136, 0.1);
      padding: 20px;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .sidebar h3 {
      color: var(--primary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      margin-top: 20px;
    }

    .sidebar h3:first-child {
      margin-top: 0;
    }

    .sidebar-link {
      display: block;
      color: var(--text);
      text-decoration: none;
      padding: 10px 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .sidebar-link:hover {
      color: var(--primary);
      background-color: rgba(0, 255, 136, 0.1);
      border-left-color: var(--primary);
    }

    .sidebar-link.active {
      color: var(--primary);
      background-color: rgba(0, 255, 136, 0.15);
      border-left-color: var(--primary);
      font-weight: 600;
    }

    .main {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
    }

    h1 {
      color: var(--primary);
      font-size: 2rem;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 10px;
    }

    h2 {
      color: var(--secondary);
      font-size: 1.5rem;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    h3 {
      color: var(--primary);
      font-size: 1.2rem;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    p {
      margin-bottom: 15px;
      color: var(--text);
    }

    a {
      color: var(--primary);
      text-decoration: none;
      border-bottom: 1px dotted var(--primary);
      transition: all 0.2s ease;
    }

    a:hover {
      color: var(--secondary);
      border-bottom-style: solid;
    }

    code {
      background-color: var(--dark-bg);
      color: var(--primary);
      padding: 0.2rem 0.4rem;
      border-radius: 2px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: var(--dark-bg);
      border: 1px solid var(--dim);
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      margin: 15px 0;
    }

    pre code {
      padding: 0;
      background: none;
      color: var(--primary);
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }

    li {
      margin-bottom: 8px;
      color: var(--text);
    }

    blockquote {
      border-left: 4px solid var(--primary);
      background-color: var(--dark-bg);
      padding: 15px;
      margin: 15px 0;
      color: var(--dim);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      border: 1px solid var(--dim);
    }

    th {
      background-color: var(--dark-bg);
      color: var(--primary);
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid var(--primary);
      border-right: 1px solid var(--dim);
      font-weight: 600;
    }

    th:last-child {
      border-right: none;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid var(--dim);
      border-right: 1px solid var(--dim);
    }

    td:last-child {
      border-right: none;
    }

    tr:hover {
      background-color: rgba(0, 255, 136, 0.05);
    }

    strong {
      color: var(--secondary);
      font-weight: 600;
    }

    em {
      color: var(--dim);
      font-style: italic;
    }

    hr {
      border: none;
      border-top: 1px solid var(--dim);
      margin: 30px 0;
    }

    .version-badge {
      display: inline-block;
      background-color: rgba(0, 255, 136, 0.15);
      color: var(--primary);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid var(--primary);
      margin-bottom: 20px;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--dark-bg);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--primary);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--secondary);
    }

    /* Font Awesome Icon Styling */
    i[class*="fa"] {
      color: var(--primary);
      margin-right: 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-link i {
      margin-right: 0.5rem;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid rgba(0, 255, 136, 0.1);
        max-height: 150px;
        overflow-x: auto;
        display: flex;
        gap: 10px;
      }

      .sidebar h3 {
        display: none;
      }

      .sidebar-link {
        white-space: nowrap;
        margin-bottom: 0;
      }

      .main {
        padding: 20px;
      }

      h1 {
        font-size: 1.5rem;
      }

      h2 {
        font-size: 1.2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="${currentDir === '' ? 'index.html' : '../index.html'}" class="logo">fase<span>-</span>ai</a>
    <div class="nav-links">
      <a href="${currentDir === '' ? 'index.html' : '../index.html'}">Home</a>
      <a href="https://github.com/isaaceliape/FASE">GitHub</a>
    </div>
  </div>

  <div class="content-wrapper">
    <aside class="sidebar">
      <h3><i class="fa fa-book"></i> Documentação</h3>
      ${sidebarLinks}
    </aside>

    <main class="main">
      <div class="version-badge"><i class="fa fa-box"></i> Versão ${version}</div>
      ${content}
    </main>
  </div>
</body>
</html>`;
};

// Get all markdown files in docs folder (including subdirectories)
const docsDir = path.join(__dirname, "docs");

function getAllMarkdownFiles(dir, prefix = "") {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getAllMarkdownFiles(itemPath, prefix ? `${prefix}/${item}` : item));
    } else if (item.endsWith(".md")) {
      files.push({
        file: item,
        path: itemPath,
        prefix: prefix,
        fullPath: prefix ? `${prefix}/${item}` : item
      });
    }
  });

  return files;
}

const markdownFiles = getAllMarkdownFiles(docsDir);

// Create HTML files
console.log(
  "🔨 Building documentation pages with proper markdown parsing...\n",
);

markdownFiles.forEach(({ file, path: filePath, prefix, fullPath }) => {
  let markdown = fs.readFileSync(filePath, "utf-8");

  // Replace hardcoded version strings with actual version from package.json
  // Matches patterns like:
  // > **Versão**: 3.2.0 | Última atualização: 2026-03-25
  // **Versão**: 1.0
  markdown = markdown.replace(
    /> \*\*Versão\*\*:\s*[\d.]+\s*\|/g,
    `> **Versão**: ${version} |`
  );
  markdown = markdown.replace(
    /\*\*Versão\*\*:\s*[\d.]+/g,
    `**Versão**: ${version}`
  );
  // Also handle English version markers for non-Portuguese docs
  markdown = markdown.replace(
    /> \*\*Version\*\*:\s*[\d.]+\s*\|/g,
    `> **Version**: ${version} |`
  );
  markdown = markdown.replace(
    /\*\*Version\*\*:\s*[\d.]+/g,
    `**Version**: ${version}`
  );

  const title = file.replace(".md", "");
  const htmlFileName =
    file === "README.md" ? "readme.html" : file.replace(".md", ".html");
  const html = marked(markdown);

  // Create subdirectory if it doesn't exist
  if (prefix) {
    const subDir = path.join(docsDir, prefix);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
  }

  const htmlFile = prefix
    ? path.join(docsDir, prefix, htmlFileName)
    : path.join(docsDir, htmlFileName);

  // For subdirectory files, include the prefix in the htmlFileName
  const fullHtmlFileName = prefix ? `${prefix}/${htmlFileName}` : htmlFileName;

  fs.writeFileSync(htmlFile, htmlTemplate(title, fullHtmlFileName, html));
  console.log(`✅ ${fullPath} → ${htmlFile.replace(docsDir, "docs")}`);

  // For README.md, also create index.html as the main entry point
  if (file === "README.md") {
    const indexFile = path.join(docsDir, "index.html");
    fs.writeFileSync(indexFile, htmlTemplate(title, "index.html", html));
    console.log(`✅ ${fullPath} → ${indexFile.replace(docsDir, "docs")} (index)`);
  }
});

console.log("\n✨ Documentation build complete!");
console.log("📂 HTML files created in", docsDir);
console.log(
  "🎨 Tables, lists, and all markdown features now properly rendered",
);
