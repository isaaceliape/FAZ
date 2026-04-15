# FASE Testing Guide

## Test Structure

FASE has two test directories reflecting its evolution:

### `test/` — Modern Test Suite (English)
- **Location:** `test/edge-cases.test.cjs`
- **Framework:** Mocha
- **Tests:** 41 edge case tests
- **Status:** ✅ Active, maintained
- **Run:** `npm test` or `npm run test:edge-cases`

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

### Legacy Tests (Agent Validation)
```bash
npm run test:teses
```

### All Tests
```bash
npm run test:all
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

## Debugging Tests

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

**Last Updated:** 2026-04-15  
**Version:** 1.0 (for FASE v3.5.1)
