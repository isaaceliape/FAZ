---
name: fase:check-installation
description: Checks FASE installation status and generates report with fix suggestions
---
<objective>
Verifies FASE installation status on the system and generates a detailed report with identified issues and suggested corrective actions.
</objective>

<execution_context>
This command checks:
1. If fase-ai package is installed globally
2. If FASE configuration files exist
3. If commands are available in the runtime
4. If there are version conflicts or issues
</execution_context>

<process>
Run the checks below and present the formatted report.

## Checks to Perform

### 1. Check Global Package Installation
```bash
npm list -g fase-ai 2>/dev/null || echo "NOT_INSTALLED_GLOBAL"
```

### 2. Check Package Version
```bash
npx fase-ai --version 2>/dev/null || echo "VERSION_UNAVAILABLE"
```

### 3. Check Configuration Directories
For each runtime, verify if directory exists:

**Claude Code:**
```bash
test -d ~/.claude && echo "EXISTS" || echo "NOT_EXISTS"
test -f ~/.claude/settings.json && echo "EXISTS" || echo "NOT_EXISTS"
```

**OpenCode:**
```bash
test -d ~/.config/opencode && echo "EXISTS" || echo "NOT_EXISTS"
test -f ~/.config/opencode/opencode.json && echo "EXISTS" || echo "NOT_EXISTS"
```

**Gemini:**
```bash
test -d ~/.gemini && echo "EXISTS" || echo "NOT_EXISTS"
test -f ~/.gemini/settings.json && echo "EXISTS" || echo "NOT_EXISTS"
```

**Codex:**
```bash
test -d ~/.codex && echo "EXISTS" || echo "NOT_EXISTS"
test -f ~/.codex/config.toml && echo "EXISTS" || echo "NOT_EXISTS"
```

### 4. Check Installed FASE Commands
For each configured runtime, list FASE commands:

**Claude Code:**
```bash
ls ~/.claude/commands/fase-*.md 2>/dev/null | wc -l || echo "0"
```

**OpenCode:**
```bash
ls ~/.config/opencode/command/fase-*.md 2>/dev/null | wc -l || echo "0"
```

**Gemini:**
```bash
ls ~/.gemini/commands/fase-*.toml 2>/dev/null | wc -l || echo "0"
```

**Codex:**
```bash
ls ~/.codex/skills/fase-*/SKILL.md 2>/dev/null | wc -l || echo "0"
```

### 5. Check FASE Hooks (if applicable)
```bash
ls ~/.claude/hooks/fase-*.js 2>/dev/null | wc -l || echo "0"
```

### 6. Check Workflows Files
```bash
test -d ~/.fase && echo "EXISTS" || echo "NOT_EXISTS"
test -d ~/.fase/workflows && echo "EXISTS" || echo "NOT_EXISTS"
ls -la ~/.fase/workflows/*.md 2>/dev/null | wc -l || echo "0"
```

## Report Format

Present the report in this format:

```
═══════════════════════════════════════════════════════════
  F.A.S.E. INSTALLATION CHECK REPORT v{version}
═══════════════════════════════════════════════════════════

📦 PACKAGE INSTALLATION
  Status: {INSTALLED/NOT_INSTALLED}
  Version: {version}
  Location: {path}

🔧 CONFIGURED RUNTIMES
  Claude Code: {CONFIGURED/NOT_CONFIGURED}
    - Settings: {OK/MISSING}
    - FASE Commands: {N} found
    - Hooks: {N} found
  
  OpenCode: {CONFIGURED/NOT_CONFIGURED}
    - Settings: {OK/MISSING}
    - FASE Commands: {N} found
  
  Gemini: {CONFIGURED/NOT_CONFIGURED}
    - Settings: {OK/MISSING}
    - FASE Commands: {N} found
  
  Codex: {CONFIGURED/NOT_CONFIGURED}
    - Config: {OK/MISSING}
    - FASE Skills: {N} found

📁 FASE WORKFLOWS
  ~/.fase Directory: {EXISTS/MISSING}
  Workflows available: {N}

⚠️ ISSUES FOUND
  {List of identified issues}

💡 SUGGESTED ACTIONS
  {Corrective actions in priority order}

═══════════════════════════════════════════════════════════
```

## Corrective Actions by Issue

### If package not installed globally:
```bash
npm install -g fase-ai@latest
```

### If Claude Code configured but no commands:
```bash
npx fase-ai --claude
```

### If OpenCode configured but no commands:
```bash
npx fase-ai --opencode
```

### If Gemini configured but no commands:
```bash
npx fase-ai --gemini
```

### If Codex configured but no commands:
```bash
npx fase-ai --codex
```

### If workflows missing:
```bash
mkdir -p ~/.fase/workflows
# Copy workflows from current project or reinstall
npx fase-ai
```

### If hooks missing (Claude Code):
```bash
# Reinstall FASE for Claude Code
npx fase-ai --claude
```

### If version outdated:
```bash
npm update -g fase-ai
# Or inside the assistant:
/fase-atualizar
```

### If version conflicts detected:
```bash
npm uninstall -g fase-ai
npm install -g fase-ai@latest
```

## Health Criteria

**✅ Healthy Installation:**
- Package installed globally
- At least one runtime configured
- FASE commands present in configured runtime
- Workflows available

**⚠️ Partial Installation:**
- Package installed but no runtimes configured
- Runtime configured but no FASE commands
- Workflows missing

**❌ Problematic Installation:**
- Package not installed
- Multiple configuration issues
- Version conflicts detected
</process>

<output_format>
Present the formatted report as specified above.

If all checks passed, display:
```
✅ F.A.S.E. is installed and configured correctly!
```

If issues were found, list in priority order:
1. Critical issues (package installation)
2. Configuration issues (runtimes)
3. Functionality issues (commands/hooks)
4. Optional improvements (additional workflows)

For each issue, include the exact command to fix.
</output_format>

<examples>
Example usage:
```bash
/fase-check-installation
```

Expected output (healthy installation):
```
═══════════════════════════════════════════════════════════
  F.A.S.E. INSTALLATION CHECK REPORT v3.0.2
═══════════════════════════════════════════════════════════

📦 PACKAGE INSTALLATION
  Status: INSTALLED
  Version: 3.0.2
  Location: /usr/local/lib/node_modules/fase-ai

🔧 CONFIGURED RUNTIMES
  Claude Code: CONFIGURED
    - Settings: OK
    - FASE Commands: 31 found
    - Hooks: 6 found
  
  OpenCode: NOT_CONFIGURED
    - Settings: MISSING
    - FASE Commands: 0 found
  
  Gemini: CONFIGURED
    - Settings: OK
    - FASE Commands: 31 found
  
  Codex: NOT_CONFIGURED
    - Config: MISSING
    - FASE Skills: 0 found

📁 FASE WORKFLOWS
  ~/.fase Directory: EXISTS
  Workflows available: 12

✅ F.A.S.E. is installed and configured correctly!

═══════════════════════════════════════════════════════════
```
</examples>
