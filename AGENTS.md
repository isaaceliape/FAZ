# FASE Agents Reference

FASE (Framework de Automação Sem Enrolação) includes a comprehensive suite of AI agents designed to work together in orchestrated workflows. Each agent has a specific role in the development and verification lifecycle.

## Agent Overview

| Agent | Role | Key Responsibilities |
|-------|------|----------------------|
| **Planejador** | Planning | Creates executable phase plans with task division, dependency analysis, and backward verification |
| **Executor** | Execution | Executes plans atomically with commits per task, deviation handling, and checkpoints |
| **Verificador** | Verification | Validates implementation completeness and code quality |
| **Verificador de Plano** | Plan Validation | Validates plan structure, feasibility, and dependency resolution |
| **Verificador de Integração** | Integration Testing | Tests component integration and cross-module functionality |
| **Pesquisador FASE** | Research | Researches FASE framework capabilities, patterns, and best practices |
| **Pesquisador de Projeto** | Project Research | Analyzes project structure, dependencies, and architecture |
| **Auditor Nyquist** | Code Auditing | Performs Nyquist-based code quality and stability auditing |
| **Depurador** | Debugging | Debugs issues systematically with error analysis and solution verification |
| **Arquiteto** | Architecture | Designs system architecture, refactoring strategies, and long-term planning |
| **Mapeador de Código** | Code Mapping | Maps codebase structure, dependencies, and relationships |
| **Roadmapper** | Roadmap Planning | Creates development roadmaps, timelines, and milestone planning |
| **Sintetizador de Pesquisa** | Research Synthesis | Synthesizes research findings into actionable insights and documentation |

---

## Detailed Agent Descriptions

### 🟢 Planejador (Planner)

**File:** `agentes/fase-planejador.md`

**Purpose:** Creates executable phase plans with clear task division, dependency analysis, and backward verification.

**Key Capabilities:**
- Break down complex work into atomic, executable tasks
- Analyze and visualize task dependencies
- Create plans that follow CLAUDE.md project conventions
- Support both standard planning and gap-closure planning modes
- Backward verification to validate completeness

**Triggered By:**
- `/fase-planejar-etapa` command
- `/fase-planejar-etapa --gaps` (gap closure mode)
- Review/update mode

**Output:**
- `PLANO.md` files with executable tasks

---

### 🟡 Executor (Executor)

**File:** `agentes/fase-executor.md`

**Purpose:** Executes FASE plans atomically with one commit per task, automatic deviation handling, and checkpoint protocols.

**Key Capabilities:**
- Execute plans step-by-step with atomic commits
- Handle deviations from plan automatically
- Create checkpoint files for recovery
- Generate summary reports (SUMARIO.md)
- Update project state (ESTADO.md)
- Manage state transitions and rollback

**Triggered By:**
- `/fase-executar-etapa` command
- `execute-plan` workflow

**Output:**
- Committed code changes
- `SUMARIO.md` execution summaries
- Updated `ESTADO.md`

---

### 🔵 Verificador (Verifier)

**File:** `agentes/fase-verificador.md`

**Purpose:** Validates that implementations meet specifications and code quality standards.

**Key Capabilities:**
- Check specification adherence
- Validate code quality metrics
- Verify test coverage
- Check documentation completeness
- Generate verification reports

**Triggered By:**
- Manual verification requests
- Quality gates in CI/CD
- Post-execution verification

---

### 🔴 Verificador de Plano (Plan Verifier)

**File:** `agentes/fase-verificador-plano.md`

**Purpose:** Validates plan structure, feasibility, and dependency resolution before execution.

**Key Capabilities:**
- Validate plan syntax and structure
- Check task feasibility
- Verify dependency graphs
- Identify circular dependencies
- Flag blocking issues

**Triggered By:**
- Plan validation workflows
- Pre-execution checks

---

### 🟠 Verificador de Integração (Integration Verifier)

**File:** `agentes/fase-verificador-integracao.md`

**Purpose:** Tests component integration and cross-module functionality.

**Key Capabilities:**
- Run integration tests
- Validate component communication
- Check API contracts
- Verify data flow between modules
- Generate integration reports

**Triggered By:**
- Integration test phases
- Multi-component verification

---

### 📚 Pesquisador FASE (FASE Researcher)

**File:** `agentes/fase-pesquisador-fase.md`

**Purpose:** Researches FASE framework capabilities, patterns, and best practices.

**Key Capabilities:**
- Deep knowledge of FASE framework
- Document FASE patterns and conventions
- Research framework capabilities
- Recommend best practices
- Answer FASE-specific questions

**Use Cases:**
- Understanding FASE workflows
- Learning agent capabilities
- Framework troubleshooting

---

### 🔍 Pesquisador de Projeto (Project Researcher)

**File:** `agentes/fase-pesquisador-projeto.md`

**Purpose:** Analyzes project structure, dependencies, and overall architecture.

**Key Capabilities:**
- Analyze project structure
- Map dependencies
- Document architecture decisions
- Identify architectural patterns
- Research project-specific conventions

**Use Cases:**
- Understanding project organization
- Architectural analysis
- Dependency mapping

---

### 🎯 Auditor Nyquist (Nyquist Auditor)

**File:** `agentes/fase-auditor-nyquist.md`

**Purpose:** Performs Nyquist-based code quality and stability auditing.

**Key Capabilities:**
- Code quality assessment
- Stability analysis using Nyquist criteria
- Performance bottleneck identification
- Refactoring recommendations
- Quality metric calculation

**Output:**
- Audit reports with grades
- Detailed findings
- Improvement recommendations

---

### 🐛 Depurador (Debugger)

**File:** `agentes/fase-depurador.md`

**Purpose:** Debugs issues systematically with error analysis and solution verification.

**Key Capabilities:**
- Systematic error analysis
- Root cause identification
- Solution verification
- Test-driven debugging
- Regression prevention

**Triggered By:**
- Bug reports
- Build failures
- Integration failures

---

### 🏗️ Arquiteto (Architect)

**File:** `agentes/fase-arquiteto.md`

**Purpose:** Designs system architecture, refactoring strategies, and long-term planning.

**Key Capabilities:**
- System architecture design
- Refactoring strategy planning
- Technology selection guidance
- Scalability analysis
- Long-term roadmap design

**Use Cases:**
- Major architectural decisions
- System redesign
- Technology evaluation

---

### 🗺️ Mapeador de Código (Code Mapper)

**File:** `agentes/fase-mapeador-codigo.md`

**Purpose:** Maps codebase structure, dependencies, and relationships.

**Key Capabilities:**
- Generate code structure maps
- Identify dependencies
- Create architecture diagrams
- Document code relationships
- Analyze code organization

**Output:**
- Code maps and visualizations
- Dependency graphs
- Architecture documentation

---

### 🛣️ Roadmapper (Roadmap Planner)

**File:** `agentes/fase-roadmapper.md`

**Purpose:** Creates development roadmaps, timelines, and milestone planning.

**Key Capabilities:**
- Create project roadmaps
- Plan milestones and releases
- Estimate timeline
- Identify critical path
- Plan resource allocation

**Output:**
- Roadmap documents
- Timeline estimates
- Milestone definitions

---

### 📖 Sintetizador de Pesquisa (Research Synthesizer)

**File:** `agentes/fase-sintetizador-pesquisa.md`

**Purpose:** Synthesizes research findings into actionable insights and documentation.

**Key Capabilities:**
- Synthesize research findings
- Generate actionable recommendations
- Create summary documentation
- Organize findings by priority
- Identify patterns in research

**Output:**
- Research synthesis documents
- Recommendation lists
- Pattern summaries

---

## Agent Workflow Orchestration

### Typical Development Flow

```
User Request
    ↓
Pesquisador/Pesquisador-Projeto (gather context)
    ↓
Planejador (create plan)
    ↓
Verificador-de-Plano (validate plan)
    ↓
Executor (execute plan)
    ↓
Verificador (verify implementation)
    ↓
Verificador-de-Integração (test integration)
    ↓
Complete ✓
```

### Quality Gates

Each agent respects quality standards:
- **Code Quality:** No new quality issues
- **Test Coverage:** Maintained or improved
- **Documentation:** Updated for changes
- **Architecture:** Adherence to patterns

---

## Agent Skills & Tools

### Common Tools Available
- **Read:** File reading and analysis
- **Write:** File creation and writing
- **Edit:** Precision file editing
- **Bash:** Command execution
- **Grep:** Text searching
- **Glob:** File pattern matching
- **WebFetch:** Remote resource fetching

### Skills Available
Agents have access to specialized skills like:
- `fase-planner-workflow` - Phase planning
- `fase-executor-workflow` - Plan execution
- And domain-specific skills per agent

---

## Project Context

All agents respect the following project files:

### CLAUDE.md
Project-specific guidelines, conventions, and requirements for Claude-based agents.

### CONTEXT.md
Current project state, decisions, and constraints.

### ESTADO.md
Project state tracking and history.

### PLANO.md
Current execution plan.

### SUMARIO.md
Execution summaries and results.

---

## Best Practices

### When to Use Each Agent

| Task | Agent | Reason |
|------|-------|--------|
| Plan a feature | Planejador | Creates structured plans |
| Execute a plan | Executor | Handles atomic execution |
| Verify quality | Verificador | Validates standards |
| Fix a bug | Depurador | Systematic debugging |
| Understand architecture | Arquiteto | System design knowledge |
| Analyze codebase | Mapeador-Código | Mapping expertise |
| Plan timeline | Roadmapper | Timeline planning |
| Research framework | Pesquisador-FASE | Framework knowledge |

### Agent Limitations

- Agents work within defined scope and tools
- Plans must be feasible within constraints
- Research is based on available documentation
- Audits reflect configured quality standards

---

## Configuration

### Agent Access

Agents are invoked through:
- CLI commands: `/fase-command-name`
- Orchestrator workflows
- Direct Claude Code/Editor integration

### Environment Variables

Agents respect project environment configuration:
- `.env` files for secrets
- Configuration in `CLAUDE.md`
- Runtime-specific settings per provider

---

## Troubleshooting

### Agent Not Found
Ensure agent file exists in `agentes/` directory with `.md` extension.

### Plan Validation Failed
Check `Verificador-de-Plano` output for specific issues.

### Execution Errors
Review `SUMARIO.md` and `ESTADO.md` for error details.

### Research Returns Limited Results
Ensure sufficient project documentation is available for research agents.

---

## Contributing

To add a new agent:

1. Create new markdown file in `agentes/` directory
2. Include YAML frontmatter with metadata
3. Document agent role and responsibilities
4. Include workflow examples
5. Add to this reference guide

---

## Active Projects & Initiatives

### 🚀 GitHub Copilot Folder Structure Migration

**Status:** ✅ PLAN COMPLETE - Ready for Execution  
**Objective:** Migrate GitHub Copilot installation from root-level folders to GitHub-standard `.github` folder structure

**Target State:**
- Agents: `/agentes/` → `.github/agents/` ✓
- Hooks: `/hooks/` → `.github/hooks/` (organized by function) ✓
- Skills: `/skills/` → `.github/skills/` (organized by category) ✓
- Workflows: Already in `.github/workflows/` ✓
- Commands: `/comandos/` → `.github/commands/` ✓

**Planning Complete:**
- ✅ Questionnaire administered (24 questions)
- ✅ Comprehensive investigation performed
- ✅ Detailed execution plan created
- ✅ 18 atomic commits planned
- ✅ Test strategy defined
- ✅ Rollback procedures documented
- ✅ Success criteria established

**Key Decisions Made:**
- **Backward Compatibility:** Deprecation warnings (old paths work temporarily)
- **Migration Pace:** All-at-once migration
- **Risk Tolerance:** High (full migration in one go)
- **Validation:** Unit + integration tests
- **Rollback:** Git history enables easy revert
- **Team Capacity:** Single developer, limited time
- **Success Metrics:** A) Folder structure ✓ + B) No broken imports ✓ + C) Tests pass ✓

**Execution Plan:** `.github/docs/migracoes/copilot-folder-structure/PLANO.md`  
**Questionnaire:** `.github/docs/migracoes/copilot-folder-structure/QUESTIONARIO.md`  
**Estimated Duration:** 5 hours (300 min total)

**Next Step:** Execute Phase 1 (Preparation)

---

## Related Documentation

- **Installation:** [README.md](README.md)
- **Commands:** [docs/COMANDOS.md](docs/COMANDOS.md)
- **Getting Started:** [Getting Started Guide](docs/index.html)
- **Technical Docs:** [/docs](docs/)
- **Project Structure:** See `scripts/mapeador-codigo.md` output
- **Migration Plans:** `.github/docs/migracoes/`

---

**Last Updated:** 2026-04-21  
**FASE Version:** 4.0.2  
**Total Agents:** 13  
**Active Migrations:** 1 (GitHub Copilot Folder Structure)
