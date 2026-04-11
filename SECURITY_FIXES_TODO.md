# FASE Security Fixes - Implementation Plan

## CRITICAL Priority (Fix Immediately)

### 1. Path Traversal Vulnerability
- **File:** `src/lib/commands.ts`
- **Lines:** 311-318 (cmdSummaryExtract), 88-89 (cmdVerifyPathExists)
- **Issue:** User-provided paths joined with cwd without validation, allowing `../../../etc/passwd` attacks
- **Fix Approach:**
  - Add `validatePathInsideCwd()` helper function
  - Use `path.resolve()` + `path.relative()` to verify resolved path stays within cwd
  - Reject paths that escape project boundary
  - Apply to: `cmdSummaryExtract`, `cmdVerifyPathExists`, `cmdStateAddDecision`, `cmdStateAddBlocker`

### 2. JSON.parse() Without Error Handling
- **Files:** `src/fase-tools.ts:191`, `src/install.ts:40`, `src/install.ts:1435`
- **Lines:**
  - fase-tools.ts:191: `JSON.parse(args[fieldsIdx + 1])` in cmdTemplateFill
  - install.ts:40: `JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))` for package.json
  - install.ts:1435: Need to locate (file was truncated)
- **Issue:** Malformed JSON causes unhandled exceptions
- **Fix Approach:**
  - Wrap all JSON.parse() in try-catch blocks
  - Create safe `parseJson()` helper with proper error messages
  - Return structured error objects instead of throwing

### 3. Command Injection in Hook
- **File:** `hooks/fase-check-update.cjs`
- **Lines:** 44-79 (spawn with execSync)
- **Issue:** execSync inside spawned process with no timeout/error handling; cache file path could be manipulated
- **Fix Approach:**
  - Add strict timeout to execSync (already has 10000ms but should be configurable)
  - Validate cache file path before writing
  - Add error handling for npm command failure
  - Consider using `npm.registry` API instead of execSync

### 4. Race Conditions in cmdTodoComplete
- **File:** `src/lib/commands.ts`
- **Lines:** 505-520
- **Issue:** TOCTOU (Time Of Check Time Of Use) between existsSync check and file operations
- **Fix Approach:**
  - Use atomic file operations where possible
  - Add file lock mechanism similar to state.ts
  - Handle EEXIST/ENOENT errors gracefully
  - Use `fs.renameSync()` for atomic move operation

---

## HIGH Priority (Fix Within Sprint)

### 5. Silent Error Suppression
- **File:** `src/lib/commands.ts`
- **Lines:** 77, 141, 204, 465 (empty catch blocks: `catch {}`)
- **Issue:** Errors swallowed silently, making debugging impossible
- **Fix Approach:**
  - Log errors to stderr even in catch blocks
  - Add optional verbose mode for debugging
  - Create `safeExecute()` wrapper that logs but doesn't throw
  - Track suppressed errors for diagnostics

### 6. Hardcoded Timeout
- **File:** `hooks/fase-statusline.cjs`
- **Line:** 13: `setTimeout(() => process.exit(0), 3000)`
- **Issue:** Fixed 3s timeout may be too short on slow systems or cause hangs
- **Fix Approach:**
  - Make timeout configurable via env var: `FASE_STATUSLINE_TIMEOUT`
  - Add fallback default of 5000ms
  - Log timeout events for debugging

### 7. Uncaught Promise Rejections
- **File:** `src/fase-tools.ts`
- **Lines:** 477-481 (cmdWebsearch called without .catch)
- **Issue:** Async function main() doesn't handle promise rejections from websearch
- **Fix Approach:**
  - Add process.on('unhandledRejection') handler at top of file
  - Wrap async command calls in try-catch
  - Add explicit error handling for websearch failures

### 8. Lock File Race Condition
- **File:** `src/lib/state.ts`
- **Lines:** 194-210 (acquireStateLock function)
- **Issue:** Race between statSync check and writeFileSync with 'wx' flag
- **Fix Approach:**
  - Use `fs.mkdirSync()` with exclusive flag for atomic lock creation
  - Add proper stale lock detection with PID verification
  - Implement exponential backoff instead of fixed delay
  - Consider using `proper-lockfile` package for production

### 9. Unvalidated execSync Input
- **File:** `src/lib/init.ts`
- **Lines:** 185-188 (cmdInitNewProject uses find command)
- **Issue:** Shell command with user-controlled cwd could be exploited
- **Fix Approach:**
  - Validate cwd parameter before passing to execSync
  - Use parameterized shell commands
  - Consider using fs.walkSync() or similar instead of shell find
  - Add shell: false option where possible

---

## MEDIUM Priority (Fix Within Release Cycle)

### 10. Missing Input Validation in cmdScaffold
- **File:** `src/lib/commands.ts`
- **Lines:** 530-590
- **Issue:** Phase parameter not validated before filesystem operations
- **Fix Approach:**
  - Validate phase name format (alphanumeric + dashes only)
  - Sanitize all user inputs before filesystem use
  - Add allowlist for scaffold types

### 11. Insufficient Error Messages
- **File:** `src/lib/commands.ts`, `src/lib/state.ts`
- **Lines:** Multiple error() calls with generic messages
- **Issue:** Error messages don't provide actionable debugging info
- **Fix Approach:**
  - Add context to error messages (file paths, operation names)
  - Include suggestion for resolution where applicable
  - Add error codes for programmatic handling

### 12. Missing File Permission Checks
- **File:** `src/lib/commands.ts`, `src/lib/state.ts`
- **Lines:** All fs.writeFileSync calls
- **Issue:** No verification of write permissions before operations
- **Fix Approach:**
  - Add accessSync checks before write operations
  - Handle EACCES errors explicitly
  - Provide helpful error messages for permission issues

### 13. Inconsistent Path Handling
- **File:** Multiple files
- **Lines:** Throughout codebase
- **Issue:** Mixed use of path.join, string concatenation, and toPosixPath
- **Fix Approach:**
  - Standardize on path.join() everywhere
  - Create consistent path normalization helper
  - Add path validation utilities

### 14. No Cleanup on Process Termination
- **File:** `src/lib/state.ts`
- **Lines:** 194-210 (lock files)
- **Issue:** Lock files may persist if process crashes
- **Fix Approach:**
  - Add process.on('exit') handler for cleanup
  - Implement PID-based stale lock detection
  - Add automatic cleanup on startup

---

## LOW Priority (Technical Debt)

### 15. Redundant Type Conversions
- **File:** `src/lib/commands.ts`, `src/lib/state.ts`
- **Lines:** Multiple places with unnecessary type assertions
- **Issue:** Code clarity reduced by excessive type casting
- **Fix Approach:**
  - Use proper TypeScript types instead of assertions
  - Create typed interfaces for complex objects
  - Remove redundant conversions

### 16. Magic Numbers
- **File:** `hooks/fase-statusline.cjs:29-31`, `src/lib/state.ts:198`
- **Lines:** 16.5, 10000, 150, 30000
- **Issue:** Hard-coded values without explanation
- **Fix Approach:**
  - Extract to named constants with documentation
  - Add comments explaining rationale
  - Consider making configurable

### 17. Inconsistent Error Handling Patterns
- **File:** Throughout codebase
- **Issue:** Mix of try-catch, error(), output(), and silent failures
- **Fix Approach:**
  - Establish consistent error handling pattern
  - Create error utility functions
  - Document error handling strategy

### 18. Missing Unit Tests for Security Functions
- **File:** All security-related functions
- **Issue:** No tests for path validation, lock mechanisms, etc.
- **Fix Approach:**
  - Add unit tests for all security utilities
  - Include edge cases and attack scenarios
  - Add integration tests for race conditions

### 19. Code Duplication in Path Operations
- **File:** Multiple files
- **Issue:** Similar path handling code repeated across files
- **Fix Approach:**
  - Extract common path utilities to dedicated module
  - Create reusable validation helpers
  - Document and export utilities

### 20. Missing Documentation for Security Features
- **File:** All security-related code
- **Issue:** Security mechanisms not documented for maintainers
- **Fix Approach:**
  - Add JSDoc comments explaining security measures
  - Create SECURITY.md with threat model
  - Document known limitations and mitigations

---

## Implementation Order

### Phase 1 (Week 1): Critical Fixes
1. Path Traversal (Issue #1)
2. JSON.parse Error Handling (Issue #2)
3. Command Injection (Issue #3)
4. Race Conditions (Issue #4)

### Phase 2 (Week 2): High Priority
5. Silent Error Suppression (Issue #5)
6. Hardcoded Timeout (Issue #6)
7. Uncaught Promise Rejections (Issue #7)
8. Lock File Race Condition (Issue #8)
9. Unvalidated execSync (Issue #9)

### Phase 3 (Week 3-4): Medium Priority
10-14. Medium issues

### Phase 4 (Ongoing): Low Priority
15-20. Low issues as technical debt allows

---

## Testing Requirements

For each fix:
- [ ] Unit tests for the specific vulnerability
- [ ] Integration tests with related components
- [ ] Manual security testing where applicable
- [ ] Regression tests to ensure no breaking changes
- [ ] Code review by security-conscious developer

## Verification Checklist

- [ ] All path inputs validated against traversal attacks
- [ ] All JSON.parse calls wrapped in try-catch
- [ ] All execSync/spawn calls use validated inputs
- [ ] All file operations use atomic operations or locks
- [ ] All async operations have error handlers
- [ ] All timeouts are configurable
- [ ] All errors are logged appropriately
- [ ] Lock files cleaned up on process exit
