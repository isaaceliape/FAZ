# FASE Parallelization Strategy — Complete Analysis and Roadmap

## Executive Summary

FASE's development workflow can be optimized for parallel sub-agent execution in 4 key commands, yielding 2–4× speedup for typical workflows while keeping the orchestrator lean (~15% context per orchestrator). This document outlines the current state, opportunities, and implementation roadmap.

---

## Current Parallelism Status

### ✅ Already Implemented and Working

| Command | Pattern | Details |
|---|---|---|
| `/fase-executar-fase` | **Stage-based parallel execution** | Plans grouped into etapas (stages) by dependency graph; all plans in same etapa run simultaneously via multiple `fase-executor` subagents |
| `/fase-mapear-codigo` | **4 parallel mappers by focus** | Spawns 4 `fase-mapeador-codigo` agents in parallel: tech, arch, quality, concerns. Each writes directly to disk; orchestrator collects confirmations |
| `/fase-novo-projeto` | **4 parallel researchers + synthesizer** | 4 `fase-pesquisador-projeto` agents (STACK, FEATURES, ARCH, PITFALLS) run in parallel; `fase-sintetizador-pesquisa` merges outputs |

### ⚠️ Sequential But Could Be Parallel

These 4 opportunities are detailed below with implementation status.

---

## Opportunity 1: `/fase-validar-fase` — Parallel Gap Auditing

**Status:** 🟡 Workflow design complete (committed), implementation ready

### Current Behavior
- Single `fase-auditor-nyquist` agent handles ALL validation gaps **serially**
- For a phase with 8 gaps, processes gap 1 → gap 2 → ... → gap 8 sequentially
- Max 3 debug iterations per gap × 8 gaps = potentially 24 iterations executed one at a time

### Problem
Validation gaps are **almost always independent** — missing auth test ≠ missing pagination test.

### Solution
**Gap Clustering + Parallel Auditors**

1. **Group gaps** by type/subsystem:
   - Auth gaps (login, tokens, permissions) → Cluster A
   - API gaps (endpoints, contracts, validation) → Cluster B
   - UI gaps (forms, flows, states) → Cluster C

2. **Spawn one `fase-auditor-nyquist` per cluster** in parallel
   - Each auditor receives `<gap_cluster>` (subset of gaps, not full array)
   - Auditor processes only its cluster
   - All clusters audit simultaneously

3. **Collect results** and merge into single VALIDATION.md

### Implementation Status
✅ **Committed Changes:**
- `agentes/fase-auditor-nyquist.md` — Support `<gap_cluster>` parameter (fallback to `<gaps>` for compatibility)
- `comandos/validar-fase.md` — Describe parallel workflow (gap clustering before spawn)

⏳ **Still Needed:**
- Update the `~/.fase/workflows/validate-phase.md` (external GSD file) OR create a new orchestrator in Claude Code that implements the clustering logic
- Modify the return format to include which gap IDs were handled per auditor

### Expected Impact
- **Speedup:** 2–4× (linear with number of clusters; typical phases have 3–4 clusters)
- **Context savings:** Orchestrator stays lean; each auditor gets fresh 200k context for its cluster only
- **Wall-clock time:** 8 gaps × 3 iterations each serially = 24 steps → parallel reduces to ~3 clusters × 3 iterations = 9 steps worst-case

---

## Opportunity 2: `/fase-verificar-trabalho` — Parallel Gap Diagnosis

**Status:** 🟡 Workflow design complete (committed), implementation ready

### Current Behavior
- UAT runs, finds N test failures
- Orchestrator **diagnoses each failure sequentially**:
  - Read relevant code for failure 1 → determine what's missing → write PLANO.md 1
  - Read relevant code for failure 2 → determine what's missing → write PLANO.md 2
  - ... (N times)

### Problem
Each failure is **independent** — can diagnose all at once.

### Solution
**Parallel Diagnosis Agents**

1. Run UAT normally, collect all test results in one batch
2. **If 2+ failures found:**
   - Partition failures (e.g., failures [1, 3, 5] vs [2, 4])
   - Spawn one diagnosis agent **per failure** in parallel
   - Each agent reads relevant code, produces PLANO-{failure_id}.md
   - Orchestrator collects all PLANOs, merges into UAT.md
3. **If 1 failure:** diagnose inline (compatibility)

### Implementation Status
✅ **Committed Changes:**
- `comandos/verificar-trabalho.md` — Describe parallel diagnosis workflow

⏳ **Still Needed:**
- Implement batch collection of test results
- Spawn N diagnosis agents in parallel when N ≥ 2
- Each agent should be lightweight: just test description + `files_to_read` block with relevant code

### Expected Impact
- **Speedup:** N× for N failures (fully parallelizable; no dependencies between diagnoses)
- **Typical scenario:** 4 failed tests → 4 parallel diagnoses = ~1/4 wall-clock time
- **Best case:** 8 failures → 8× speedup

---

## Opportunity 3: `/fase-pesquisar-fase` — Multi-Mode Deep Research

**Status:** 🟡 Workflow design complete (committed), implementation ready

### Current Behavior
- Single researcher in one mode: ecosystem (default) OR comparison OR feasibility OR implementation
- If you need both ecosystem AND implementation knowledge, run the command twice

### Problem
Complex phases need **multiple research angles** simultaneously.

### Solution
**Parallel Multi-Mode Research + Synthesis**

1. **Add `--deep` flag** to command
2. **If `--deep` is passed:**
   - Spawn 4 researchers **in parallel**:
     - Researcher 1: ecosystem mode → RESEARCH-ecosystem.md
     - Researcher 2: comparison mode → RESEARCH-comparison.md
     - Researcher 3: feasibility mode → RESEARCH-feasibility.md
     - Researcher 4: implementation mode → RESEARCH-implementation.md
   - **Spawn synthesizer** (`fase-sintetizador-pesquisa`) after all 4 complete:
     - Reads RESEARCH-*.md files
     - Merges into unified RESEARCH.md
     - Consolidates recommendations
3. **If `--deep` not passed:** Single researcher in ecosystem mode (default behavior)

### Implementation Status
✅ **Committed Changes:**
- `comandos/pesquisar-fase.md` — Describe `--deep` flag, parallel spawn + synthesis workflow

⏳ **Still Needed:**
- Modify `fase-pesquisador-fase` agent to:
  - Accept `<output_file>` parameter (write to RESEARCH-{mode}.md, not RESEARCH.md)
  - Respect forced `<research_mode>` (don't choose, use what's passed)
- Implement synthesizer step:
  - New agent: `fase-sintetizador-pesquisa` (similar to the one used in `/fase-novo-projeto`)
  - Reads 4 RESEARCH-*.md files
  - Produces unified RESEARCH.md

### Expected Impact
- **Speedup:** 3–4× (4 researchers in parallel, then ~1× synthesizer = ~2.5× overall)
- **Context efficiency:** Each researcher gets fresh 200k; synthesizer also gets fresh context to merge
- **Quality improvement:** Deeper analysis from multiple angles vs single angle sequentially

---

## Opportunity 4: `/fase-auditar-marco` — Parallel Phase Summary Reading

**Status:** 🟡 Workflow design complete (committed), implementation ready

### Current Behavior
- Orchestrator **reads all phase summary files sequentially**:
  - Glob: `.fase-ai-local/phases/*/*-SUMMARY.md`
  - Glob: `.fase-ai-local/phases/*/*-VERIFICATION.md`
  - Load all into orchestrator context to aggregate tech debt, gaps, deferred items
- For large milestones (12+ phases), this consumes significant orchestrator context

### Problem
Orchestrator burns context on **reading phase files** when it could delegate to parallel readers.

### Solution
**Parallel Summary Reading**

1. **Discover all phases** for milestone
2. **Partition into batches** (groups of 3 phases each)
3. **Spawn one reader agent per batch** in parallel:
   - Each reader: `fase-leitor-resumo` (new mini-agent or inline task)
   - Reads SUMMARY.md + VERIFICATION.md for assigned phases
   - Returns structured JSON: `{ phases: { N: { tech_debt: [...], gaps: [...], deferred: [...] } } }`
4. **Orchestrator aggregates** the structured returns (NOT full file content)
5. **Continue normally** with integration check, requirements coverage

### Implementation Status
✅ **Committed Changes:**
- `comandos/auditar-marco.md` — Describe parallel reading workflow for 8+ phases

⏳ **Still Needed:**
- Create `fase-leitor-resumo` mini-agent or inline task prompt:
  - Input: `<phase_numbers>` (e.g., [3, 4, 5])
  - Output: structured JSON with aggregated tech debt + gaps + deferred
- Implement batch partitioning in orchestrator
- Spawn parallel reader agents

### Expected Impact
- **Speedup:** Linear with number of batches (for 12 phases → 4 batches → 4× potential speedup)
- **Context savings:** Orchestrator stays lean (~15% context) even for large milestones
- **Scalability:** No orchestrator context overflow for 20+ phase milestones

---

## Strictly Sequential (Correct as-is)

These workflows have **hard dependencies** and should NOT be parallelized:

| Command | Reason |
|---|---|
| `/fase-planejar-fase` | Research → Plan → Verify chain: each step needs previous artifact. Verification loops require planner revision. |
| `/fase-completar-marco` | Human approval gates at each step; operations must complete before advancing. |
| `/fase-debug` | Hypothesis must be confirmed before fix design. Debugging is inherently iterative. |

---

## Implementation Roadmap

### Phase 1: Low-Hanging Fruit (High Impact, Low Complexity)
1. **`/fase-validar-fase`** (estimated: 2–3 days)
   - Gap clustering logic
   - Modify `fase-auditor-nyquist` to process `gap_cluster` subsets
   - Test with phase having 4+ independent gaps

2. **`/fase-verificar-trabalho`** (estimated: 1–2 days)
   - Batch collection of test failures
   - Spawn diagnosis agents per failure
   - Simple merged output

### Phase 2: Medium Complexity (Medium-High Impact)
3. **`/fase-pesquisar-fase --deep`** (estimated: 3–4 days)
   - Modify `fase-pesquisador-fase` for multi-mode support
   - Implement synthesis step (similar to `fase-sintetizador-pesquisa`)
   - Test with complex phase needing ecosystem + implementation

4. **`/fase-auditar-marco` large milestones** (estimated: 2–3 days)
   - Create `fase-leitor-resumo` mini-agent
   - Batch partitioning + parallel spawn
   - Test with 8+ phase milestone

### Phase 3: Documentation and Validation
5. Update main README, COMANDO.md with parallelization notes
6. Add performance benchmarks (before/after wall-clock times)
7. Document when to use `--deep`, when parallel kicks in automatically

---

## Backward Compatibility

All changes maintain **full backward compatibility**:
- Commands work without flags (serial mode is default)
- Agents fallback to full array if `gap_cluster` not provided
- Single-failure diagnosis works inline (no parallel overhead)

---

## Architecture Principles Reinforced

1. **Orchestrators stay lean (~15% context)** — subagents get fresh context
2. **File-based inter-agent communication** — RESEARCH-{mode}.md files, gap PLANOs, structured JSON summaries
3. **Parallel agents collect results independently** — no blocking, no shared state
4. **Synthesis happens in dedicated agent** — merging doesn't burn orchestrator context

---

## Expected Overall Impact

For a typical phase with:
- 8 independent validation gaps
- 4 test failures in UAT
- Complex research needs

**Without parallelization:**
- Validate phase: 24 serial debug iterations
- Verify work: 4 sequential diagnoses
- Research: 1 mode at a time

**With parallelization:**
- Validate phase: 3–4 parallel clusters × 3 iterations = ~3 clusters → 9 steps worst-case
- Verify work: 4 parallel diagnoses → ~1/4 time
- Research (--deep): 4 parallel researchers → ~3–4× faster

**Overall speedup:** 2–3× wall-clock time reduction for typical workflows, with **no loss of quality** and **no additional context per developer**.

---

## Questions for Prioritization

1. **Which bottleneck hurts most?** Validate (common in late phases) vs Verify (common after every execute)?
2. **Should `--deep` be automatic for complex phases?** Or always require explicit flag?
3. **Are there other commands we should analyze?** e.g., `/fase-discutir-fase` (discussion synthesis)?

