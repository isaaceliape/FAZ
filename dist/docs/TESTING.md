# FASE Testing Guide

## Test Structure

FASE has comprehensive test coverage across multiple directories:

### `test/` — Modern Test Suite (English)
- **Location:** `test/*.test.cjs`, `test/tmux/*.test.cjs`
- **Framework:** Mocha
- **Tests:** 41 edge case tests + 9 tmux install tests + 11 TUI interaction tests = 61 tests
- **Status:** ✅ Active, maintained
- **Run:** `npm test` or `npm run test:tmux` or `npm run test:tmux:interaction`

### `test/tmux/` — Installation & TUI Tests
- **Location:** `test/tmux/*.test.cjs`
- **Framework:** Node.js child_process with tmux automation
- **Tests:** Provider installation (9 tests), TUI interaction (11 tests)
- **Coverage:** All 6 providers (Claude, OpenCode, Gemini, Codex, GitHub Copilot, Qwen)
- **Status:** ✅ Active, newly expanded
- **Run:** `npm run test:tmux` (install) or `npm run test:tmux:interaction` (TUI)

### `testes/` — Legacy Test Suite (Portuguese)
- **Location:** `testes/*.test.cjs` (17 files)
- **Framework:** Node.js native test runner (`node:test`)
- **Tests:** Agent frontmatter validation, command structure, migrations, backups
- **Status:** ⚠️ Legacy, being migrated
- **Run:** `npm run test:teses`

**Why Two Directories?**

This is a historical artifact. The `testes/` directory (Portuguese for "tests") contains the original test suite. The `test/` directory was created for modern edge case testing with better Mocha integration. 

**Going forward:** Add new tests to `test/` directory following the pattern in `edge-cases.test.cjs`.

---

## Running Tests

### Quick Test (Edge Cases Only)
```bash
npm test
```

### Installation & Smoke Tests
```bash
npm run test:tmux         # All 9 installation tests (97s)
npm run test:tmux:smoke   # Quick smoke tests (2 providers, ~30s)
npm run test:tmux:all     # Full install matrix (same as test:tmux)
```

### TUI Interaction Tests
```bash
npm run test:tmux:interaction  # 11 tests validating provider CLI interaction (60s)
```

### Legacy Tests (Agent Validation)
```bash
npm run test:teses
```

### All Tests
```bash
npm run test:all
npm run lint && npm run build && npm run test:tmux && npm run test:tmux:interaction
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
cat test-results.json | jq '.stats'
```

---

## Test Prerequisites

### Build First
Tests require compiled JavaScript in `dist/`:
```bash
npm run build && npm test
```

The test helper (`testes/test-helper.cjs`) will automatically verify that `dist/` exists and fail fast if you forget to build.

### Environment
- Node.js 18.0.0+
- No API keys required (tests are offline)
- Tests run in isolated temp directories

---

## Writing New Tests

### Location
Add new tests to `test/` directory:
```
test/
└── your-feature.test.cjs
```

### Format (Mocha)
```javascript
const { describe, it } = require('mocha');
const assert = require('assert');

describe('Your Feature', function() {
  it('should do something', function() {
    const result = yourFunction();
    assert.strictEqual(result, expected);
  });
});
```

### Naming Convention
- Use `.test.cjs` extension
- Prefix with feature name: `edge-cases.test.cjs`, `security.test.cjs`
- Describe blocks should be human-readable
- Use `it()` for individual test cases

---

## Test Categories

### Installation & Provider Verification (`test/tmux/`)
Validates all 6 providers can successfully install FASE commands:
- **Install Tests (9 tests):**
  - Individual: Claude, OpenCode, Gemini, Codex, GitHub Copilot, Qwen
  - Multi: All 6 providers in single run
  - Uninstall: Clean removal for Claude, OpenCode
- **Status:** ✅ 9/9 passing, ~97 seconds

### TUI Interaction Tests (`test/tmux/tui-interaction.test.cjs`)
Validates that FASE commands appear in each provider's interactive UI:
- **Launch Tests (6 tests):** Each provider CLI launches in tmux
- **Command Tests (6 tests):** `/fase` command input accepted by each provider
- **Installation Checks (5 tests):** Commands verified in local directories
- **Pattern Tests (2 tests):** `/fase` and `$fase` patterns recognized
- **Status:** ✅ 11/11 passing, ~60 seconds
- **Highlight:** Qwen provider successfully captures FASE commands in real TUI

### Edge Cases (`test/edge-cases.test.cjs`)
Tests for unusual inputs and boundary conditions:
- Symlink handling
- Long path names
- Special characters
- Large files
- Concurrent operations
- Race conditions
- Permission errors
- Encoding issues

### Agent Validation (`testes/agent-frontmatter.test.cjs`)
Validates agent `.md` files:
- Required frontmatter fields
- Anti-heredoc instructions
- Skills field presence
- Hook patterns

### Command Structure (`testes/commands.test.cjs`)
Tests command files:
- Frontmatter validation
- Phase structure
- Tool references

### Core Functions (`testes/core.test.cjs`)
Tests utility functions:
- Path handling
- Config loading
- File operations

### State Management (`testes/state.test.cjs`)
Tests state file operations:
- Lock acquisition
- Field extraction
- Atomic updates

### Migration Tests (`testes/atualizar.test.cjs`)
Tests update/migration system:
- Backup creation
- Migration application
- Version checking

---

## TUI Interaction Testing

### What It Does

The TUI interaction test suite validates that FASE commands are properly available in each provider's interactive command interface:

```bash
npm run test:tmux:interaction
```

### How It Works

1. **Launches each provider CLI** in an isolated tmux session (140x50 terminal)
2. **Simulates user interaction:**
   - Types `/fase` (or `$fase` for Codex) to trigger command suggestions
   - Captures terminal output
   - Counts FASE commands found
3. **Verifies local installation:** Confirms commands exist in provider config directories
4. **Tests command patterns:** Validates `/fase` and `$fase` syntax recognition

### Supported Providers

| Provider | CLI | Launch | Command Trigger | Pattern |
|----------|-----|--------|-----------------|---------|
| Claude | `claude` | ✅ | `/fase` | `/fase-*` |
| OpenCode | `opencode` | ✅ | `/fase` or `ctrl+p` | `/fase-*` |
| Gemini | `gemini` | ✅ | `/fase` | `/fase-*` |
| Codex | `codex` | ✅ | `$fase` | `$fase-*` |
| GitHub Copilot | `gh` | ✅ | `/fase` | `/fase-*` |
| Qwen | `qwen` | ✅ | `/fase` | `/fase-*` |

### Example Output

```
Provider TUI Interaction Tests
  Launch Provider and Type /fase Command
    ✅ claude: /fase command accepted (12.5s)
    ✅ opencode: /fase command accepted (12.8s)
    ✅ gemini: /fase command accepted (12.5s)
    ✅ codex: /fase command accepted (12.5s)
    ✅ qwen: /fase triggered, found 1 FASE command(s) (12.4s) ⭐
  Verify FASE Commands Installed Locally
    ✅ claude: 0 FASE commands installed (local directory verified)
    ⊘ opencode: not installed locally (skipped)
    ✅ gemini: 0 FASE commands installed (local directory verified)
    ✅ codex: 0 FASE commands installed (local directory verified)
    ✅ qwen: 0 FASE commands installed (local directory verified)
  Slash Command Pattern Recognition
    ✅ should recognize /fase as valid command prefix
    ✅ should recognize $fase for Codex skills

  11 passing (1m)
```

### Test Files

- **Main Test:** `test/tmux/tui-interaction.test.cjs`
  - `TUIInteractionTester` class for provider automation
  - Mocha test suite with 11 individual tests
  - Comprehensive tmux session management

### Running TUI Tests

```bash
# Run all TUI interaction tests
npm run test:tmux:interaction

# Run with verbose output
npm run test:tmux:interaction -- --reporter spec

# Run specific provider test (requires mocha grep)
npx mocha test/tmux/tui-interaction.test.cjs --grep "qwen"

# Run alongside installation tests
npm run test:tmux && npm run test:tmux:interaction
```

### Debugging TUI Tests

If a test fails, check:

1. **Provider CLI installed:**
   ```bash
   which claude     # Should output path to claude
   which qwen       # Should output path to qwen
   ```

2. **Provider config directory:**
   ```bash
   ls ~/.claude/commands/       # Or equivalent for provider
   ```

3. **Tmux available:**
   ```bash
   tmux -V
   ```

4. **Verbose test output:**
   ```bash
   npm run test:tmux:interaction -- --reporter spec --grep "claude"
   ```

---

### Verbose Output
```bash
npm test -- --reporter spec
```

### Run Specific Test
```bash
npx mocha test/edge-cases.test.cjs --grep "symlink"
```

### Skip Build Check (for development)
```bash
# Temporarily disable verification in testes/test-helper.cjs
# Uncomment this line to skip dist/ check
// verifyTestSetup();
```

### Common Issues

**"Cannot find module '../dist/...'"**
```bash
npm run build
```

**"0 passing" but tests seem to run**
This is normal for `testes/` tests - they use Node.js native test runner, not Mocha. Look for ✔/✖ symbols in output.

**Tests fail after code changes**
```bash
npm run build && npm run test:all
```

---

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies
- No network calls (except rate-limited metrics tracking)
- Isolated temp directories
- Clean exit codes (0 = pass, 1 = fail)

### GitHub Actions (Future)
```yaml
- name: Build
  run: npm run build

- name: Test
  run: npm run test:all
```

---

## Test Coverage Goals

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Installation tests | 9 tests (6 providers) | Maintain | HIGH |
| TUI interaction tests | 11 tests (6 providers) | Enhance | HIGH |
| Edge cases | 41 tests | 60 tests | HIGH |
| Agent validation | ✅ Complete | Maintain | LOW |
| Command structure | Partial | 80% coverage | MEDIUM |
| Core functions | Partial | 80% coverage | MEDIUM |
| State management | Partial | 80% coverage | HIGH |
| Migrations | ✅ Complete | Maintain | LOW |

---

## Contributing Tests

1. **Identify gap:** What's not tested?
2. **Choose location:** `test/` for new features, `testes/` for legacy
3. **Write test:** Follow existing patterns
4. **Build:** `npm run build`
5. **Run:** `npm test` or `npm run test:teses`
6. **Verify:** All tests pass
7. **Commit:** Include test file + source changes

### Test Review Checklist
- [ ] Test has clear description
- [ ] Assertions are specific (not just "works")
- [ ] Edge cases covered
- [ ] Error conditions tested
- [ ] No hardcoded paths (use temp dirs)
- [ ] Cleanup after test (no leftover files)

---

## Legacy Test Migration Plan

The `testes/` directory will be gradually migrated to `test/`:

**Phase 1 (v3.5.1):** Fix imports, ensure tests run
**Phase 2 (v3.6.0):** Convert to Mocha, move to `test/`
**Phase 3 (v3.7.0):** Deprecate `testes/` directory

Until migration is complete, both directories are supported.

---

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Assert Module](https://nodejs.org/api/assert.html)
- [FASE Internal Testing Standards](./TESTING_STANDARDS.md) (TODO)

---

**Last Updated:** 2026-04-24  
**Version:** 1.2 (for FASE v5.0.1 - Added TUI interaction tests for all 6 providers)
