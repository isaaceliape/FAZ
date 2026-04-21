# GitHub Copilot Folder Structure Migration - Questionnaire

**Project:** FASE Framework  
**Date:** 2026-04-21  
**Objective:** Assess requirements and constraints for migrating to GitHub-standard folder structure

---

## Section 1: Scope & Requirements

### Q1.1: Backward Compatibility
**Question:** Should the system maintain backward compatibility with code that imports from old paths?

**Options:**
- [ ] A) Strict new paths only - break old imports (aggressive migration)
- [ ] B) Support both old and new paths temporarily with deprecation warnings
- [ ] C) Maintain indefinitely - keep symlinks or aliases
- [ ] D) Phased approach - deprecate after N releases

**Answer:** _______________

---

### Q1.2: Agent Migration Priority
**Question:** In what order should agents be migrated to `.github/agents/`?

**Options:**
- [ ] A) All at once (single large migration)
- [ ] B) By category (core, research, verification agents separately)
- [ ] C) By criticality (Planejador → Executor → others)
- [ ] D) Rolling migration (one agent per commit/PR)

**Answer:** _______________

---

### Q1.3: Hooks Organization
**Question:** How should hooks be organized under `.github/hooks/`?

**Options:**
- [ ] A) Flat structure: `.github/hooks/*.js`
- [ ] B) By type: `.github/hooks/git/*.js`, `.github/hooks/npm/*.js`
- [ ] C) By function: `.github/hooks/checks/`, `.github/hooks/monitors/`, `.github/hooks/builders/`
- [ ] D) Hybrid: type + function

**Answer:** _______________

---

### Q1.4: Skills Folder Organization
**Question:** Current skills are in `/skills/`. How to restructure?

**Options:**
- [ ] A) Flatten to `.github/skills/{skill-name}/` at root level
- [ ] B) Categorize: `.github/skills/integrations/`, `.github/skills/tools/`, etc.
- [ ] C) Keep current structure but symlink: `/skills/ → .github/skills/`
- [ ] D) Split between `.github/skills/` (framework) and preserve `/skills/` (domain skills)

**Answer:** _______________

---

### Q1.5: Commands/Comandos Migration
**Question:** How should `/comandos/` be handled?

**Options:**
- [ ] A) Migrate to `.github/commands/`
- [ ] B) Keep at root as user-facing CLI entry point
- [ ] C) Split: framework commands to `.github/`, user commands stay at root
- [ ] D) Convert to GitHub workflow dispatch commands

**Answer:** _______________

---

## Section 2: Dependencies & Imports

### Q2.1: Import Path Updates
**Question:** Approximately how many files reference old folder paths?

**Options:**
- [ ] A) < 10 files (minimal surface area)
- [ ] B) 10-50 files (moderate)
- [ ] C) 50-150 files (significant)
- [ ] D) 150+ files (extensive)

**Answer:** _______________

---

### Q2.2: Dynamic Imports
**Question:** Are there dynamic imports that resolve paths at runtime?

**Options:**
- [ ] A) No - all imports are static
- [ ] B) Few - mostly in entry points or configuration loaders
- [ ] C) Moderate - scattered throughout (need glob patterns)
- [ ] D) Heavy - config-driven imports from multiple sources

**Answer:** _______________

---

### Q2.3: Package.json References
**Question:** What needs updating in package.json?

**Options:**
- [ ] A) Just scripts and bin entries
- [ ] B) Also exports/main fields
- [ ] C) Also workspaces configuration
- [ ] D) Needs major restructuring (monorepo changes)

**Answer:** _______________

---

## Section 3: Configuration & Tooling

### Q3.1: Build System Impact
**Question:** Will build process be affected?

**Options:**
- [ ] A) No - pure folder reorganization
- [ ] B) Minor - update glob patterns in build config
- [ ] C) Moderate - webpack/rollup path aliases needed
- [ ] D) Major - significant build reconfiguration needed

**Answer:** _______________

---

### Q3.2: IDE/Editor Configuration
**Question:** Are VSCode/IDE settings affected?

**Options:**
- [ ] A) No configuration changes needed
- [ ] B) Update workspace settings for new paths
- [ ] C) Update launch.json for debugging
- [ ] D) Update multiple config files (settings, launch, paths)

**Answer:** _______________

---

### Q3.3: Testing Framework Updates
**Question:** How many test files reference the old structure?

**Options:**
- [ ] A) No test path references (< 5 files)
- [ ] B) Few test files (5-20)
- [ ] C) Moderate test impact (20-50 files)
- [ ] D) Extensive test updates needed (50+ files)

**Answer:** _______________

---

## Section 4: Documentation & Onboarding

### Q4.1: Documentation Updates
**Question:** What documentation needs updates?

**Options:**
- [ ] A) README and contributing guide only
- [ ] B) README, contributing guide + API docs
- [ ] C) Full docs overhaul including examples
- [ ] D) Extensive docs + migration guide for contributors

**Answer:** _______________

---

### Q4.2: Migration Timeline Communication
**Question:** How should developers be informed?

**Options:**
- [ ] A) Single announcement in PR
- [ ] B) Migration guide in docs + deprecation warnings
- [ ] C) Multi-phase: warnings → deprecation → removal
- [ ] D) Parallel running period before cutover

**Answer:** _______________

---

## Section 5: Risk & Validation

### Q5.1: Risk Level Assessment
**Question:** What's your risk tolerance for this migration?

**Options:**
- [ ] A) Low - canary approach, test thoroughly first
- [ ] B) Moderate - controlled rollout with monitoring
- [ ] C) High - full migration in one go
- [ ] D) Custom - staged by component type

**Answer:** _______________

---

### Q5.2: Validation Strategy
**Question:** How should migration be validated?

**Options:**
- [ ] A) Unit tests + linting
- [ ] B) Unit + integration tests
- [ ] C) Full test suite + manual verification
- [ ] D) Test suite + staging environment testing

**Answer:** _______________

---

### Q5.3: Rollback Capability
**Question:** Should rollback be possible?

**Options:**
- [ ] A) No - commit to migration fully
- [ ] B) Yes - maintain git history for easy revert
- [ ] C) Yes - keep parallel branches for period
- [ ] D) Full rollback strategy with documentation

**Answer:** _______________

---

## Section 6: Constraint & External Factors

### Q6.1: Breaking Change Policy
**Question:** Are there policies about breaking changes?

**Options:**
- [ ] A) None - can break anytime
- [ ] B) Must be in major version (semver)
- [ ] C) Must be in major version with deprecation period
- [ ] D) Cannot break - must maintain compatibility

**Answer:** _______________

---

### Q6.2: Third-party Integration
**Question:** Do external tools/services depend on current folder structure?

**Options:**
- [ ] A) No external dependencies
- [ ] B) GitHub Actions only
- [ ] C) GitHub Actions + CI/CD integrations
- [ ] D) Multiple integrations + custom tools

**Answer:** _______________

---

### Q6.3: Team Availability
**Question:** How much team capacity for this migration?

**Options:**
- [ ] A) Single developer, limited time
- [ ] B) Single developer, dedicated
- [ ] C) Multiple developers, part-time
- [ ] D) Multiple developers, dedicated

**Answer:** _______________

---

## Section 7: Success Criteria

### Q7.1: Primary Success Metrics
**Question:** What defines success? (Select top 3)

**Options:**
- [ ] A) All files in `.github/` folder structure
- [ ] B) No broken imports in codebase
- [ ] C) All tests passing
- [ ] D) Documentation fully updated
- [ ] E) Zero performance degradation
- [ ] F) Developer workflow unchanged or improved
- [ ] G) CI/CD pipelines functioning
- [ ] H) External integrations working

**Top 3 Selections:** _______________

---

### Q7.2: Definition of Done
**Question:** What must be completed for phase completion?

**Options:**
- [ ] A) Code merged to main
- [ ] B) Code merged + tests passing + docs updated
- [ ] C) B + manual verification + monitoring period
- [ ] D) B + monitoring period + zero issues reported

**Answer:** _______________

---

## Section 8: Open Questions & Notes

### Q8.1: Additional Considerations
**Question:** Any special constraints, technical debt, or considerations?

**Notes:**
```




```

---

### Q8.2: Timeline & Dependencies
**Question:** Any external timeline dependencies or blocking factors?

**Notes:**
```




```

---

### Q8.3: Stakeholder Input
**Question:** Key stakeholders and their requirements:

**Notes:**
```




```

---

## Summary

After answering these questions, the **Planejador** agent will:

1. ✅ Create detailed migration plan (PLANO.md)
2. ✅ Identify specific tasks and dependencies
3. ✅ Estimate effort and timeline
4. ✅ Define rollback procedures
5. ✅ Generate implementation scripts

**Next Step:** Share your answers, and we'll create a comprehensive implementation plan.

---

**Document Version:** 1.0  
**Created:** 2026-04-21  
**For:** FASE Framework Migration Planning
