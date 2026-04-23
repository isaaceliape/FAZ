# bin/ Directory — FASE Project Structure Documentation

**⚠️ IMPORTANT: This directory contains legacy/outdated content.**

---

## Purpose of bin/ Directory

The `bin/` directory contains **pre-built npm package content (DISCONTINUED)**.

### Official Source Location

**The official source code is in `src/` (root directory).**

- TypeScript compiles from `src/` → `dist/` (see root `tsconfig.json`)
- `rootDir: "src"` in tsconfig.json confirms src/ as source
- All development should use `src/` directory

### Current Status of bin/

**Status: Legacy/Outdated (version 3.3.1)**

- `bin/src/` contains TypeScript SOURCE files (not compiled output)
- `bin/src/lib/*.ts` contains **older code** (version 3.3.1)
- `bin/package.json` shows version 3.3.1 (outdated)
- Root `package.json` shows version 5.0.1 (current)
- **DO NOT use `bin/src/` as source — use `src/`**

### Why bin/src/ Exists

Historically, `bin/` was intended to be a standalone npm package directory with its own source files. This approach was discontinued. The current architecture uses:

- `src/` — Official TypeScript source (root of repo)
- `dist/` — Compiled JavaScript output (from src/)
- `package.json` — npm package definition (root)

### Version Comparison

| Location | Version | Status |
|----------|---------|--------|
| Root package.json | 5.0.1 | ✅ Current (use this) |
| bin/package.json | 3.3.1 | ❌ Outdated (DO NOT use) |

### Files with Different Versions

The following files exist in both `src/lib/` and `bin/src/lib/` with **different versions**:

| File | src/lib/ (current) | bin/src/lib/ (outdated) |
|------|--------------------|-------------------------|
| core.ts | 756 lines | 564 lines |
| state.ts | 989 lines | 667 lines |
| etapa.ts | 892 lines | 798 lines |
| verify.ts | 1009 lines | 780 lines |
| init.ts | 814 lines | 667 lines |
| commands.ts | 778 lines | 590 lines |
| config.ts | 157 lines | 151 lines |
| frontmatter.ts | 398 lines | 298 lines |
| milestone.ts | 267 lines | 241 lines |
| roadmap.ts | 324 lines | 273 lines |
| template.ts | 256 lines | 231 lines |
| version-check.ts | 233 lines | 212 lines |

Plus: `bin/src/lib/path-utils.ts` — orphaned file (not used anywhere)

---

## Recommendations

### For Development

- ✅ Use `src/` for all source code changes
- ✅ Run `npm run build` to compile src/ → dist/
- ❌ Do NOT edit files in `bin/src/`
- ❌ Do NOT use `bin/src/lib/*.ts` as reference

### For npm Publish

- Root `package.json` defines the npm package
- `files` array in package.json specifies: `dist/`, `agentes/`, `comandos/`, `fase-shared/`, `README.md`
- Build process: `npm run build` → compiles src/ to dist/

### Cleanup Plan

`bin/src/` will be **removed in Phase 5 Plan 02** as part of deduplication effort.

- Files in `bin/src/lib/*.ts` will be deleted
- `bin/src/` directory will be removed
- Only `dist/` (compiled output) will be used for npm distribution

---

## Key Evidence

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "rootDir": "src",     // ← Official source directory
    "outDir": "dist",     // ← Compiled output
    ...
  },
  "include": ["src/**/*.ts"]  // ← Only src/ is compiled
}
```

### Version Mismatch

- Root: version 5.0.1 (current, maintained)
- bin/package.json: version 3.3.1 (outdated, 2 years behind)

### Code Differences

Examples of outdated patterns in bin/src/lib/*.ts:

- Uses `.fase-ai-local` naming (legacy)
- Missing newer features (PathTraversalError, .fase-ai naming)
- Less error handling
- Fewer lines in all files

---

## Summary

| Aspect | Status |
|--------|--------|
| Official source | `src/` ✅ |
| bin/src/ purpose | Legacy/outdated ❌ |
| Recommendation | Use src/, ignore bin/src/ |
| Cleanup | Phase 5 Plan 02 |

---

*Last updated: 2026-04-23*
*Document created as part of Phase 5 — Eliminar Duplicação*
*REQ-013: Clarificar bin/ Purpose*