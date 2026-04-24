# FASE Project Analysis and Suggestions

Date: 2026-04-24  
Scope: repository-level health check (code, tests, docs, packaging, CI)

## Executive Summary

FASE has strong breadth (multi-runtime installer, broad command/agent surface, extensive test files, CI workflows), but there are reliability gaps in the delivery pipeline caused by drift between source-of-truth files and automation.

The highest-impact issue is test validity: current `npm test` reports success while a direct Node test run shows many failing unit tests. Documentation and release artifacts also show significant version/content drift.

## What Is Working Well

- Clear product surface and structure: 13 agents, 34 commands, multi-provider runtime support.
- Linting is passing (`npm run lint`).
- E2E checks for landing-page consistency are present and passing.
- CI is in place for Linux/macOS and release/deploy workflows.
- Core code is TypeScript-first (`src/` as canonical source, strict TS config).

## Priority Findings and Recommendations

### P0 (Fix Immediately)

1. Test runner mismatch hides failing unit tests.
- Evidence:
  - `npm test` exits `0`.
  - `node --test --test-reporter tap test/unit/*.test.cjs` exits `1` with `# pass 297`, `# fail 322`.
  - Example: `test/unit/agent-frontmatter.test.cjs` fails when run directly, but Mocha run exits `0`.
- Recommendation:
  - Stop running `node:test` suites via Mocha.
  - Split scripts explicitly:
    - `test:unit` => `node --test test/unit/*.test.cjs`
    - `test:integration` => Mocha (if those files are Mocha-based)
  - Update CI to fail on unit failures.

2. Docs build command is broken.
- Evidence:
  - `npm run build-docs` calls `node build-docs.cjs`, but only `build-docs.js` exists.
- Recommendation:
  - Make script/file consistent (`build-docs.cjs` or convert script to ESM and keep `.js`).
  - Add CI check for docs build.

### P1 (High Impact, Next Iteration)

3. Documentation is materially out of sync with current version and commands.
- Evidence:
  - `package.json` version is `5.0.1`.
  - `README.md` header shows `v4.0.2`.
  - Multiple docs files show `4.0.0`.
  - Docs references old command names (`/fase-planejar-fase`, `/fase-executar-fase`) and `.fase-ai-local`.
  - Missing linked files referenced in README (`CONTRIBUTING.md`, `TEST_RESULTS.md`, `docs/technical/COMMAND_PATHS.md`, `docs/VERIFICAR-VERSAO.html`).
- Recommendation:
  - Declare single source of truth for docs (prefer `www/docs/src`).
  - Generate and validate links/version in CI.
  - Complete migration from `.fase-ai-local` to `.fase-ai` in all docs/tests.

4. Corrupted published docs artifact risk.
- Evidence:
  - `docs/GUIA-DO-USUARIO.html` and `dist/docs/GUIA-DO-USUARIO.html` are 13 bytes (`<h1>test</h1>`).
- Recommendation:
  - Add artifact sanity checks (minimum size + required markers) before publish/deploy.
  - Regenerate docs and prevent manual placeholder artifacts from entering `docs/` and `dist/docs/`.

5. Unit tests still encode legacy behavior/paths.
- Evidence:
  - Many failures reference `.fase-ai-local` and older expectations.
- Recommendation:
  - Systematically migrate test fixtures/assertions to current directory conventions and command names.
  - Track migration with a checklist and fail CI until complete.

### P2 (Maintainability and Cost Reduction)

6. Installer monolith is still very large.
- Evidence:
  - `src/install.ts` has ~3081 lines.
  - `src/install/index.ts` still includes “Phase 3 Refactoring Status” note indicating incomplete integration.
- Recommendation:
  - Complete modular migration to `src/install/*` with thin orchestration in `install.ts`.
  - Add focused unit tests per install module.

7. Package payload includes avoidable duplication.
- Evidence:
  - `npm pack --dry-run --ignore-scripts` includes both root and `dist/` copies of `agentes/`, `comandos/`, `fase-shared/`, docs.
  - Tarball shows duplicated assets and includes corrupted docs HTML.
- Recommendation:
  - Keep only runtime-required artifacts in published package.
  - Remove duplicated source directories from `files` if `dist/` already contains required copies.

8. Legacy directories/files still add cognitive overhead.
- Evidence:
  - `bin/README.md` itself marks `bin/` as legacy/outdated.
- Recommendation:
  - Create and execute a deprecation/removal plan for legacy directories.
  - Keep one canonical implementation path and one canonical docs path.

9. Sensitive/low-signal runtime logs are tracked in Git.
- Evidence:
  - `logs/openai/openai-2026-04-22T08-23-34.368Z-f237f78f.json` is committed and contains full conversation/system prompt payloads.
- Recommendation:
  - Add `logs/` to `.gitignore`.
  - Remove tracked logs from repo history or at least from current tree.
  - Keep only sanitized fixtures when needed for tests.

## Suggested Execution Plan

1. Stabilize quality gates (P0): fix test runner strategy + docs build script.
2. Repair truth drift (P1): docs/README/link/version/command/path alignment.
3. Reduce maintenance burden (P2): finish installer modularization + packaging cleanup + legacy/log cleanup.

## Validation Commands Used

- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `node --test --test-reporter tap test/unit/*.test.cjs`
- `npm run build-docs`
- `npm pack --dry-run --ignore-scripts --cache /tmp/npm-cache-fase`

