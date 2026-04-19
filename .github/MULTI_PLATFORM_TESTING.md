# Multi-Platform Testing Guide

## Overview

This guide covers testing FASE v4.0.0 across all supported platforms to ensure stability and compatibility.

## Platforms to Test

### Tier 1 (Critical)
- [x] **Linux** - Ubuntu 22.04 LTS (GitHub Actions)
- [ ] **macOS** - Apple Silicon (M1/M2/M3)
- [ ] **macOS** - Intel (x86_64)
- [ ] **Windows** - PowerShell 7
- [ ] **Windows** - WSL2 (Ubuntu)

### Tier 2 (Important)
- [ ] **Linux** - Debian 12
- [ ] **Linux** - Fedora 39
- [ ] **Windows** - CMD (Legacy)

---

## Test Scenarios

### Scenario 1: Clean Install

**Purpose:** Verify installation works on fresh system

**Steps:**
```bash
# 1. Ensure no previous FASE installation
rm -rf ~/.claude/fase-ai 2>/dev/null || true
rm -rf ~/.opencode/fase-ai 2>/dev/null || true
rm -rf ~/.gemini/fase-ai 2>/dev/null || true
rm -rf ~/.codex/fase-ai 2>/dev/null || true
rm -rf ~/.github-copilot/fase-ai 2>/dev/null || true

# 2. Run fresh install
npx fase-ai --claude

# 3. Verify installation
fase health

# 4. Test basic commands
fase-ajuda
fase-configuracoes
```

**Expected:**
- ✅ Installation completes in <30s
- ✅ No errors
- ✅ Hooks registered
- ✅ Commands work

---

### Scenario 2: Upgrade from v3.x

**Purpose:** Verify upgrade path works without data loss

**Steps:**
```bash
# 1. Install v3.5.3
npm install -g fase-ai@3.5.3
npx fase-ai --claude

# 2. Verify v3.x works
fase-ajuda

# 3. Upgrade to v4.0.0
npm install -g fase-ai@latest
npx fase-ai --claude

# 4. Verify upgrade
fase health
fase-ajuda
```

**Expected:**
- ✅ Hooks preserved
- ✅ Configs preserved
- ✅ No data loss
- ✅ Commands work

---

### Scenario 3: Multi-Provider Install

**Purpose:** Verify multiple providers can coexist

**Steps:**
```bash
# 1. Install for Claude
npx fase-ai --claude

# 2. Install for OpenCode
npx fase-ai --opencode

# 3. Install for Gemini
npx fase-ai --gemini

# 4. Verify all providers
fase health

# 5. Test commands work for all
```

**Expected:**
- ✅ All providers configured
- ✅ No conflicts
- ✅ Commands work for all

---

### Scenario 4: Uninstall & Reinstall

**Purpose:** Verify clean uninstall and reinstall

**Steps:**
```bash
# 1. Install
npx fase-ai --claude

# 2. Uninstall
npx fase-ai --uninstall

# 3. Verify removed
ls ~/.claude/fase-ai  # Should not exist

# 4. Reinstall
npx fase-ai --claude

# 5. Verify works
fase health
```

**Expected:**
- ✅ Clean uninstall
- ✅ Reinstall works
- ✅ No残留 files

---

### Scenario 5: Hooks Execution

**Purpose:** Verify hooks execute correctly

**Steps:**
```bash
# 1. Install with hooks
npx fase-ai --claude

# 2. Check hooks exist
ls ~/.claude/hooks/fase-*

# 3. Manually run a hook
node ~/.claude/hooks/fase-statusline.cjs

# 4. Verify output
```

**Expected:**
- ✅ Hooks exist
- ✅ Hooks execute without errors
- ✅ Output is correct

---

## Platform-Specific Notes

### Linux (Ubuntu/Debian)

**Known Issues:** None expected

**Test Commands:**
```bash
# Check Node version
node --version  # Should be >=18

# Check permissions
ls -la ~/.claude/hooks/

# Test execution
~/.claude/hooks/fase-statusline.cjs
```

---

### macOS (Apple Silicon)

**Known Issues:** None expected

**Test Commands:**
```bash
# Check architecture
uname -m  # Should be arm64

# Check Node is native
node --version

# Test hooks
~/.claude/hooks/fase-statusline.cjs
```

---

### macOS (Intel)

**Known Issues:** None expected

**Test Commands:**
```bash
# Check architecture
uname -m  # Should be x86_64

# Test hooks
~/.claude/hooks/fase-statusline.cjs
```

---

### Windows (PowerShell)

**Known Issues:**
- Path separators (`\` vs `/`)
- Script execution policy

**Test Commands:**
```powershell
# Check execution policy
Get-ExecutionPolicy

# If Restricted, allow scripts
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Test installation
npx fase-ai --claude

# Test hooks (may need node explicitly)
node $env:USERPROFILE\.claude\hooks\fase-statusline.cjs
```

---

### Windows (WSL2)

**Known Issues:**
- Path translation between WSL/Windows
- File permissions

**Test Commands:**
```bash
# Check WSL version
wsl --version

# Test installation
npx fase-ai --claude

# Verify paths are Linux-style
ls ~/.claude/hooks/
```

---

## Test Results Template

```markdown
## Test Results: [Platform]

**Date:** YYYY-MM-DD
**Tester:** [Name]
**OS:** [OS Version]
**Node:** [Version]
**Shell:** [Shell]

### Scenario Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Clean Install | ✅ Pass / ❌ Fail | [Notes] |
| Upgrade v3.x | ✅ Pass / ❌ Fail | [Notes] |
| Multi-Provider | ✅ Pass / ❌ Fail | [Notes] |
| Uninstall | ✅ Pass / ❌ Fail | [Notes] |
| Hooks | ✅ Pass / ❌ Fail | [Notes] |

### Issues Found

1. **[Issue Title]**
   - Severity: High/Medium/Low
   - Description: ...
   - Workaround: ...

### Logs

```
[Paste relevant log output]
```

---

**Overall:** ✅ Pass / ❌ Fail
```

---

## CI/CD Matrix Setup

### GitHub Actions Configuration

```yaml
# .github/workflows/test-multi-platform.yml
name: Multi-Platform Tests

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, macos-13, windows-latest]
        node: [18, 20, 22]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Test installation
        run: |
          node dist/install.js --claude
          # Verify installation
```

---

## Manual Testing Checklist

### Pre-Test Setup

- [ ] Fresh VM/container for each platform
- [ ] Node.js 18+ installed
- [ ] No previous FASE installation
- [ ] Network access for npm

### During Test

- [ ] Record all errors
- [ ] Note installation time
- [ ] Check memory usage
- [ ] Verify file permissions
- [ ] Test all commands

### Post-Test

- [ ] Clean up test files
- [ ] Document results
- [ ] Create issues for bugs
- [ ] Update this guide

---

## Contact

For questions about multi-platform testing:
- GitHub Issues: https://github.com/isaaceliape/FASE/issues
- Email: [Maintainer email]

---

**Last Updated:** 2026-04-18
**Version:** 1.0
