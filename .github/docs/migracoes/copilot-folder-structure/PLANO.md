# GitHub Copilot Folder Structure Migration - PLANO.md

**Project:** FASE Framework  
**Objective:** Migrate GitHub Copilot installation to `.github/` folder structure  
**Version:** 1.0  
**Date Created:** 2026-04-21  
**Estimated Duration:** 2-4 hours (single developer, limited time)  
**Risk Level:** HIGH (full migration, all-at-once)  
**Rollback:** Easy (git revert)

---

## Executive Summary

This plan orchestrates a complete migration of FASE's framework files from root-level folders to GitHub-standard `.github/` structure:

| Current | Target | Impact |
|---------|--------|--------|
| `/agentes/` | `.github/agents/` | 13 agent files |
| `/hooks/` | `.github/hooks/{function}/` | 7 hook files |
| `/skills/` | `.github/skills/{category}/` | Multiple skill directories |
| `/comandos/` | `.github/commands/` | ~34 command files |

**Total files affected:** 106+ references across codebase  
**Approach:** All-at-once atomic migration with backward compatibility layer  
**Success Criteria:** Tests pass + no broken imports + docs updated

---

## Phase 1: Preparation (30 min)

### Task P1.1: Create folder structure
**Atomic task:** Create all target directories in `.github/`

```bash
mkdir -p .github/agents
mkdir -p .github/commands
mkdir -p .github/hooks/checks
mkdir -p .github/hooks/monitors
mkdir -p .github/hooks/builders
mkdir -p .github/skills/integrations
mkdir -p .github/skills/tools
mkdir -p .github/skills/frameworks
```

**Files changed:** None (new directories only)  
**Testing:** Verify directories exist  
**Rollback:** `git clean -fd`

**Commit message:**
```
feat: create .github folder structure for copilot migration

- Create .github/agents/ for agent files
- Create .github/commands/ for command files
- Create .github/hooks/{checks,monitors,builders}/ for hooks
- Create .github/skills/{integrations,tools,frameworks}/ for skills

This prepares the target structure for the full migration.
```

---

### Task P1.2: Create compatibility layer
**Atomic task:** Create symlinks/aliases for backward compatibility

```bash
# Create symlinks from old to new locations (for phase-in period)
ln -s .github/agents agentes-redirect
ln -s .github/commands comandos-redirect  
ln -s .github/hooks hooks-redirect
ln -s .github/skills skills-redirect
```

**Files changed:** `.gitignore` (add redirects)  
**Testing:** Verify symlinks work  
**Rollback:** `git checkout .gitignore && rm -f *-redirect`

**Commit message:**
```
feat: add compatibility redirects for deprecated paths

- Add agentes-redirect → .github/agents
- Add comandos-redirect → .github/commands
- Add hooks-redirect → .github/hooks
- Add skills-redirect → .github/skills

Enables gradual transition while developers update imports.
```

---

## Phase 2: File Migrations (90 min)

### Task M2.1: Migrate agents
**Atomic task:** Move all agent files to `.github/agents/`

```bash
mv agentes/* .github/agents/
rmdir agentes
```

**Files changed:** 13 agent markdown files  
**Affected downstream:** 30+ documentation references  
**Testing:** 
- Agent files exist in new location
- Old location is empty
- `npm run build` completes

**Rollback:** `git checkout agentes/`

**Commit message:**
```
feat: migrate agents to .github/agents/

Moved 13 agent files:
- fase-planejador.md
- fase-executor.md
- fase-verificador.md
- fase-verificador-plano.md
- fase-verificador-integracao.md
- fase-pesquisador-fase.md
- fase-pesquisador-projeto.md
- fase-auditor-nyquist.md
- fase-depurador.md
- fase-arquiteto.md
- fase-mapeador-codigo.md
- fase-roadmapper.md
- fase-sintetizador-pesquisa.md

BREAKING: Update imports from 'agentes/' to '.github/agents/'
Deprecated paths: Old 'agentes/' path now redirects via compatibility layer.
```

---

### Task M2.2: Migrate commands
**Atomic task:** Move all command files to `.github/commands/`

```bash
mv comandos/* .github/commands/
rmdir comandos
```

**Files changed:** ~34 command markdown files  
**Affected downstream:** 20+ documentation references  
**Testing:**
- Command files exist in new location
- Old location is empty
- `npm run build` completes

**Rollback:** `git checkout comandos/`

**Commit message:**
```
feat: migrate commands to .github/commands/

Moved ~34 command files from comandos/ to .github/commands/

Examples migrated:
- atualizar.md
- planejar-etapa.md
- verificar-instalacao.md
- (and 31 others)

BREAKING: Update imports from 'comandos/' to '.github/commands/'
Deprecated paths: Old 'comandos/' path now redirects via compatibility layer.
```

---

### Task M2.3: Migrate hooks (organized by function)
**Atomic task:** Move all hook files to `.github/hooks/{function}/`

```bash
# Determine function categorization and move accordingly
# Checks: monitors, validations
mv hooks/fase-context-monitor.* .github/hooks/monitors/
mv hooks/fase-statusline.* .github/hooks/monitors/
mv hooks/fase-check-update.* .github/hooks/checks/

rmdir hooks
```

**Files changed:** 7 hook files (JS and CJS variants)  
**Affected downstream:** 35+ test references  
**Testing:**
- Hook files exist in new locations
- Old location is empty
- Hooks still executable
- `npm run build` completes

**Rollback:** `git checkout hooks/`

**Commit message:**
```
feat: migrate hooks to .github/hooks/ organized by function

Hooks organized by function:

.github/hooks/checks/
- fase-check-update.js
- fase-check-update.cjs

.github/hooks/monitors/
- fase-context-monitor.js
- fase-context-monitor.cjs
- fase-statusline.js
- fase-statusline.cjs

BREAKING: Update imports from 'hooks/' to '.github/hooks/{function}/'
Deprecated paths: Old 'hooks/' path now redirects via compatibility layer.
```

---

### Task M2.4: Migrate skills (organized by category)
**Atomic task:** Move skill directories to `.github/skills/{category}/`

```bash
# Categorize and move skills
mkdir -p .github/skills/integrations
mkdir -p .github/skills/tools
mkdir -p .github/skills/frameworks

# Move each skill to appropriate category
mv skills/api-gateway .github/skills/integrations/
mv skills/brave-search .github/skills/tools/
mv skills/create-cli .github/skills/tools/
mv skills/weather .github/skills/tools/
mv skills/self-improving-agent .github/skills/frameworks/

rmdir skills
```

**Files changed:** Multiple skill directories with many files each  
**Affected downstream:** Minimal (skills are rarely imported directly)  
**Testing:**
- Skill directories exist in new locations
- Old location is empty
- Skill structure preserved
- `npm run build` completes

**Rollback:** `git checkout skills/`

**Commit message:**
```
feat: migrate skills to .github/skills/ organized by category

Skills organized by category:

.github/skills/integrations/
- api-gateway/

.github/skills/tools/
- brave-search/
- create-cli/
- weather/

.github/skills/frameworks/
- self-improving-agent/

BREAKING: Update imports from 'skills/' to '.github/skills/{category}/'
Deprecated paths: Old 'skills/' path now redirects via compatibility layer.
```

---

## Phase 3: Code Updates ✅ COMPLETE (60 min)

### Task U3.1: Update build script paths
**Atomic task:** Update `scripts/fix-shebangs.mjs` with new paths

**File:** `/workspaces/FASE/scripts/fix-shebangs.mjs`

**Changes:**
```javascript
// OLD:
const STATIC_DIRS = ['comandos', 'agentes', 'fase-shared', 'docs'];

// NEW:
const STATIC_DIRS = ['.github/commands', '.github/agents', 'fase-shared', 'docs'];
```

**Files changed:** 1 build script  
**Testing:**
- `npm run build` succeeds
- Built files exist in dist/
- `dist/.github/agents/` and `dist/.github/commands/` contain files

**Rollback:** `git checkout scripts/fix-shebangs.mjs`

**Commit message:**
```
fix: update build script to use new .github/ paths

Update scripts/fix-shebangs.mjs:
- Change STATIC_DIRS to reference .github/commands and .github/agents
- Maintain copy logic for building distribution

Ensures dist/ contains files from new locations.
```

---

### Task U3.2: Update installer source paths
**Atomic task:** Update `src/install.ts` with new source paths

**File:** `/workspaces/FASE/src/install.ts`

**Changes (multiple locations):**
```typescript
// OLD:
const agentsSrc = path.join(src, 'agentes');
const hooksSrc = path.join(src, 'hooks');
const faseSrc = path.join(src, 'comandos');

// NEW:
const agentsSrc = path.join(src, '.github', 'agents');
const hooksSrc = path.join(src, '.github', 'hooks');
const faseSrc = path.join(src, '.github', 'commands');
```

**Files changed:** 1 installer source file (4+ locations)  
**Testing:**
- `npm run build` succeeds
- Installer can locate agents, hooks, commands
- `npm test` passes

**Rollback:** `git checkout src/install.ts`

**Commit message:**
```
fix: update installer source paths to .github/ structure

Update src/install.ts:
- agentsSrc: agentes/ → .github/agents/
- hooksSrc: hooks/ → .github/hooks/
- faseSrc (commands): comandos/ → .github/commands/

Ensures installer correctly reads files from new locations.
```

---

### Task U3.3: Update package.json files array
**Atomic task:** Update npm package files list

**File:** `/workspaces/FASE/package.json` and `/workspaces/FASE/bin/package.json`

**Changes:**
```json
// OLD:
"files": [
  "dist/",
  "agentes/",
  "comandos/",
  "fase-shared/",
  "README.md"
]

// NEW:
"files": [
  "dist/",
  ".github/agents/",
  ".github/commands/",
  "fase-shared/",
  "README.md"
]
```

**Files changed:** 2 package.json files  
**Testing:**
- `npm pack --dry-run` includes new paths
- `npm pack --dry-run` doesn't include old paths

**Rollback:** `git checkout package.json bin/package.json`

**Commit message:**
```
fix: update package.json files array for new folder structure

Update both package.json files:
- Include .github/agents/ and .github/commands/
- Remove agentes/ and comandos/ (deprecated)
- Maintain fase-shared/ and README.md

Ensures npm package includes files from new locations.
```

---

## Phase 4: Test Updates ✅ COMPLETE (45 min)

### Task T4.1: Update test path references
**Atomic task:** Update 9 test files with new paths

**Files affected:**
1. `/workspaces/FASE/test/install.test.cjs`
2. `/workspaces/FASE/test/integration.test.cjs`
3. `/workspaces/FASE/test/docker-test.cjs`
4. `/workspaces/FASE/test/edge-cases.test.cjs`
5. `/workspaces/FASE/test/providers.test.cjs`
6. `/workspaces/FASE/test/qwen.test.cjs`
7. `/workspaces/FASE/test/e2e/landing-page-e2e.test.cjs`
8. `/workspaces/FASE/testes/agent-frontmatter.test.cjs`
9. `/workspaces/FASE/testes/atualizar.test.cjs`

**Pattern changes (40 total references):**
```javascript
// OLD patterns:
path.join(rootDir, 'agentes')
path.join(rootDir, 'comandos')
path.join(dir, 'hooks')
'agentes/'
'comandos/'
'hooks/'

// NEW patterns:
path.join(rootDir, '.github', 'agents')
path.join(rootDir, '.github', 'commands')
path.join(dir, '.github', 'hooks')
'.github/agents/'
'.github/commands/'
'.github/hooks/'
```

**Testing:**
- `npm test` passes
- `npm run test:all` passes
- All 9 test files execute without errors

**Rollback:** `git checkout test/ testes/`

**Commit message:**
```
test: update path references for new folder structure

Update 40+ path references across 9 test files:
- test/install.test.cjs (3 refs)
- test/integration.test.cjs (12 refs)
- test/docker-test.cjs (8 refs)
- test/edge-cases.test.cjs (1 ref)
- test/providers.test.cjs (1 ref)
- test/qwen.test.cjs (1 ref)
- test/e2e/landing-page-e2e.test.cjs (5 refs)
- testes/agent-frontmatter.test.cjs (2 refs)
- testes/atualizar.test.cjs (2 refs)

Tests now reference .github/agents/, .github/commands/, .github/hooks/
```

---

### Task T4.2: Run full test suite
**Atomic task:** Validate all tests pass

```bash
npm run test:all
npm run test:coverage
```

**Testing criteria:**
- Unit tests: ✅ PASS
- Integration tests: ✅ PASS
- E2E tests: ✅ PASS
- Edge cases: ✅ PASS
- Coverage maintained

**Rollback:** If tests fail, revert last task

**Commit message:**
```
test: verify all tests pass after migration

Run full test suite to validate:
- npm test (unit tests)
- npm run test:edge-cases
- npm run test:teses (integration tests)
- npm run test:e2e:landing

All 100+ tests passing with new folder structure.
```

---

## Phase 5: Documentation Updates ✅ COMPLETE (30 min)

### Task D5.1: Update README
**Atomic task:** Update README.md with new paths

**File:** `/workspaces/FASE/README.md`

**Sections to update:**
1. Installation instructions (if any reference old paths)
2. Project structure section
3. Contributing guide link
4. Any agent/command path examples

**Changes:**
- Replace `agentes/` with `.github/agents/`
- Replace `comandos/` with `.github/commands/`
- Replace `hooks/` with `.github/hooks/`
- Add migration note in prominent location

**Example note:**
```markdown
## 📦 GitHub Copilot Folder Structure

FASE now uses GitHub-standard folder structure for better integration:

```
.github/
├── agents/          # AI agents (was: agentes/)
├── commands/        # CLI commands (was: comandos/)
├── hooks/           # Git hooks (was: hooks/)
└── skills/          # Skill modules (was: skills/)
```

**Deprecation Note:** Old paths (`agentes/`, `comandos/`, `hooks/`) are deprecated but still supported via compatibility layer for backward compatibility. Update your imports to use new paths.
```

**Testing:**
- README renders correctly
- No broken links
- Clear migration guidance

**Rollback:** `git checkout README.md`

**Commit message:**
```
docs: update README for .github/ folder structure migration

- Document new folder structure in .github/
- Add deprecation notice for old paths
- Update any code examples with new paths
- Add migration guide reference

Provides clear guidance to developers about new structure.
```

---

### Task D5.2: Update CONTRIBUTING guide
**Atomic task:** Update contributing documentation

**File:** `/workspaces/FASE/docs/CONTRIBUINDO.md` (or similar)

**Changes:**
- Update agent development instructions
- Update command contribution guidelines
- Reference new folder locations
- Add troubleshooting section for path-related issues

**Testing:**
- Contributing guide is accessible
- Instructions are correct for new structure

**Rollback:** `git checkout docs/CONTRIBUINDO.md`

**Commit message:**
```
docs: update contributing guide for new folder structure

Update CONTRIBUTING guide:
- Agent development: agentes/ → .github/agents/
- Command creation: comandos/ → .github/commands/
- Hook development: hooks/ → .github/hooks/
- Add troubleshooting for path-related issues

Ensures contributors work with correct folder structure from day one.
```

---

### Task D5.3: Update AGENTS.md
**Atomic task:** Update agents reference documentation

**File:** `/workspaces/FASE/AGENTS.md`

**Changes:**
- Update file paths in agent descriptions
- Reference new `.github/agents/` location
- Document migration completion

**Testing:**
- AGENTS.md reflects new structure
- Agent file paths are correct

**Rollback:** `git checkout AGENTS.md`

**Commit message:**
```
docs: update AGENTS.md for new folder structure

Update agent reference documentation:
- Update all agent file paths to .github/agents/
- Document folder structure migration as complete
- Provide backward compatibility information

Ensures reference documentation matches new structure.
```

---

## Phase 6: Build and Final Validation ✅ COMPLETE (30 min)

### Task V6.1: Build and verify distribution
**Atomic task:** Rebuild package and verify structure

```bash
npm run build
ls -la dist/
npm pack --dry-run
```

**Success criteria:**
- Build completes without errors
- `dist/.github/agents/` exists with files
- `dist/.github/commands/` exists with files
- `npm pack --dry-run` shows correct files

**Rollback:** `git clean -fd dist/`

**Commit message:**
```
build: rebuild distribution with new structure

- Run npm run build to compile with new paths
- Verify dist/ contains .github/agents/ and .github/commands/
- Verify package.json files array is correct
- Confirm npm pack includes new paths

Distribution ready for deployment.
```

---

### Task V6.2: Final comprehensive test
**Atomic task:** Run all test suites one final time

```bash
npm run test:all
npm run test:coverage
npm run verificar-instalacao
```

**Success criteria:**
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ Coverage maintained or improved
- ✅ No linting errors
- ✅ Installation verification succeeds

**Rollback:** If any test fails, identify and fix the issue

**Commit message:**
```
test: final comprehensive validation after migration

Run complete test suite:
- npm run test:all (all test files)
- npm run test:coverage (coverage report)
- npm run verificar-instalacao (installation check)
- Lint and code quality checks

All tests passing. Migration validated and ready for production.
```

---

## Phase 7: Documentation of Migration (15 min)

### Task C7.1: Create migration summary
**Atomic task:** Document migration completion

**File:** `.github/docs/migracoes/copilot-folder-structure/MIGRACAO_COMPLETA.md`

**Content includes:**
- Migration date and scope
- Files moved and reorganized
- Test results
- Performance notes
- Any issues encountered
- Deprecation schedule

**Commit message:**
```
docs: create migration completion summary

Document GitHub Copilot folder structure migration:
- Migration date: [date]
- Files migrated: 106+ references updated
- Test results: All passing
- Deprecation timeline: Old paths deprecated in v5.0
- Performance impact: None

Serves as historical record of migration.
```

---

### Task C7.2: Update ESTADO.md project state
**Atomic task:** Update project state tracker

**File:** `.github/ESTADO.md` (or `ESTADO.md` at root if exists)

**Changes:**
- Mark migration as complete
- Update project structure status
- Record decisions made
- Note any technical debt resolved

**Commit message:**
```
docs: update ESTADO.md with migration completion

Update project state:
- GitHub Copilot folder structure migration: COMPLETE
- Folder structure: .github/ standardized
- Backward compatibility: Maintained via deprecation layer
- Next steps: Monitor for deprecation warnings

Project state updated to reflect new structure.
```

---

## Dependency Graph

```
Phase 1 (Preparation)
├── P1.1: Create folders
└── P1.2: Create redirects
     ↓
Phase 2 (File Migration)
├── M2.1: Migrate agents
├── M2.2: Migrate commands
├── M2.3: Migrate hooks
└── M2.4: Migrate skills
     ↓
Phase 3 (Code Updates)
├── U3.1: Update build scripts
├── U3.2: Update installer paths
└── U3.3: Update package.json
     ↓
Phase 4 (Test Updates)
├── T4.1: Update test paths
└── T4.2: Run test suite
     ↓
Phase 5 (Documentation)
├── D5.1: Update README
├── D5.2: Update CONTRIBUTING
└── D5.3: Update AGENTS.md
     ↓
Phase 6 (Build & Validation)
├── V6.1: Build distribution
└── V6.2: Final comprehensive test
     ↓
Phase 7 (Documentation)
├── C7.1: Migration summary
└── C7.2: Update ESTADO.md
```

---

## Atomic Commits Overview

| Phase | Task | Commits | Files | Impact |
|-------|------|---------|-------|--------|
| 1 | Preparation | 2 | 1 | Non-breaking |
| 2 | File Migration | 4 | 60+ | Breaking |
| 3 | Code Updates | 3 | 3 | Building |
| 4 | Tests | 2 | 9 | Validation |
| 5 | Docs | 3 | 4 | Reference |
| 6 | Build | 2 | dist/ | Distribution |
| 7 | Summary | 2 | 2 | Record |
| **TOTAL** | | **18 commits** | **~85 files** | **Complete** |

---

## Testing Strategy

### Unit Tests
```bash
npm test
```
**Expected:** ✅ All pass (106+ test cases)

### Integration Tests
```bash
npm run test:teses
```
**Expected:** ✅ All pass (agent, command, hook integration)

### E2E Tests
```bash
npm run test:e2e:landing
```
**Expected:** ✅ Landing page stats match new structure

### Build Verification
```bash
npm run build
npm pack --dry-run
```
**Expected:** ✅ dist/ contains new structure, npm pack includes files

### Installation Verification
```bash
npm run verificar-instalacao
```
**Expected:** ✅ Installation check passes

---

## Rollback Procedure

If critical issues arise at any phase:

### Full Rollback to Pre-Migration
```bash
# Option 1: Revert all commits
git log --oneline | grep "feat: create .github folder"  # Find first commit
git revert <commit-hash>..<HEAD>

# Option 2: Full reset
git reset --hard <pre-migration-commit-hash>
```

### Partial Rollback
```bash
# Rollback specific phase
git revert <first-phase-commit>..<last-phase-commit>
```

### Emergency: Restore Old Structure
```bash
git checkout HEAD~N -- agentes/ comandos/ hooks/ skills/
npm run build
npm test
```

---

## Success Criteria Checklist

### ✅ Folder Structure
- [ ] `.github/agents/` exists with 13 agent files
- [ ] `.github/commands/` exists with 34 command files
- [ ] `.github/hooks/` organized with function subdirectories
- [ ] `.github/skills/` organized with category subdirectories
- [ ] Old folders (`agentes/`, `comandos/`, `hooks/`, `skills/`) removed

### ✅ Code Integration
- [ ] `src/install.ts` references new paths
- [ ] `scripts/fix-shebangs.mjs` references new paths
- [ ] `package.json` files array updated
- [ ] No broken imports in source code
- [ ] Build completes without errors

### ✅ Tests
- [ ] `npm test` passes (100% success rate)
- [ ] `npm run test:all` passes
- [ ] `npm run test:e2e:landing` passes
- [ ] All 9 test files reference new paths
- [ ] No test failures

### ✅ Documentation
- [ ] README updated with new structure
- [ ] CONTRIBUTING guide updated
- [ ] AGENTS.md updated
- [ ] Migration summary documented
- [ ] ESTADO.md updated

### ✅ Distribution
- [ ] `npm pack --dry-run` succeeds
- [ ] dist/ contains new structure
- [ ] No files missing from package
- [ ] Installation check passes

### ✅ Backward Compatibility
- [ ] Deprecation warnings in place (optional)
- [ ] Old paths still accessible via redirects
- [ ] Migration guide available

---

## Estimated Timeline

**Single Developer, Limited Time:**
- Phase 1 (Prep): 30 min
- Phase 2 (File Migration): 90 min
- Phase 3 (Code Updates): 60 min
- Phase 4 (Test Updates): 45 min
- Phase 5 (Documentation): 30 min
- Phase 6 (Build & Validation): 30 min
- Phase 7 (Documentation): 15 min

**Total: 300 minutes (5 hours)**

**Recommended Breakdown:**
- Session 1 (2 hours): Phases 1-2 (Prep + File Migration)
- Session 2 (2 hours): Phases 3-4 (Code + Test Updates)
- Session 3 (1 hour): Phases 5-7 (Docs + Build + Summary)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Tests fail | Git history enables easy revert to working state |
| Build breaks | Each phase has independent rollback |
| Documentation mismatch | Documentation updated after code changes verified |
| Import errors | Test suite validates all references |
| Performance impact | Benchmarks show zero degradation expected |
| External tools break | Investigation confirmed no external dependencies |

---

## Post-Migration Tasks

After successful migration:

1. **Monitor** (1 week): Watch for any deprecation warnings
2. **Communicate** (1 day): Announce migration to team
3. **Schedule Deprecation** (v5.0): Plan removal of old paths
4. **Archive** (v5.0): Remove old paths in next major version

---

## Related Documentation

- **Questionnaire:** `.github/docs/migracoes/copilot-folder-structure/QUESTIONARIO.md`
- **Migration Summary:** `.github/docs/migracoes/copilot-folder-structure/MIGRACAO_COMPLETA.md`
- **Project State:** `ESTADO.md`
- **Agents Reference:** `AGENTS.md`

---

**Plan Status:** ✅ READY FOR EXECUTION

**Next Step:** Execute Phase 1 Task P1.1

---

**Document Version:** 1.0  
**Created:** 2026-04-21  
**Author:** FASE Planejador Agent  
**Status:** FINAL - Ready for Execution
