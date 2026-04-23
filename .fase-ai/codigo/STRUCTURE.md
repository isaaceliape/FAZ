# Codebase Structure

**Data de Análise:** 2026-04-22

## Directory Layout

```
FASE/
├── src/                    # TypeScript source code
│   ├── lib/                # Core library modules
│   ├── install/            # Installer modules
│   ├── fase-tools.ts       # CLI entry point
│   ├── install.ts          # Installer entry point
│   └── verificar-instalacao.ts
├── dist/                   # Compiled JavaScript output
├── bin/                    # Pre-built distribution (npm package)
│   ├── agentes/            # Agent definitions (copy)
│   ├── comandos/           # Command definitions (copy)
│   ├── fase-shared/        # Shared resources (copy)
│   ├── src/                # Compiled JS (copy)
│   └── lib/                # Legacy lib (deprecated)
├── agentes/                # AI agent definitions (13 agents)
├── comandos/               # Slash command definitions (35 commands)
├── fase-shared/            # Shared templates and references
│   ├── templates/          # Document templates
│   └── references/         # Schema definitions
├── test/                   # Test suites
│   ├── tmux/               # E2E tmux tests
│   └── e2e/                # End-to-end tests
├── docs/                   # Documentation
│   ├── maintainers/        # Maintainer docs
│   └── technical/          # Technical docs
├── www/                    # Website (Astro)
│   ├── docs/               # Documentation site
│   └── images/             # Image assets
├── deploy/                 # Deployment configs
├── specs/                  # Specification files
├── .claude/                # Claude Code config (local)
├── .opencode/              # OpenCode config (local)
├── .gemini/                # Gemini config (local)
├── .qwen/                  # Qwen config (local)
├── .fase-ai/               # Project state directory
│   ├── etapas/             # Phase directories
│   ├── milestones/         # Milestone archives
│   ├── todos/              # Todo tracking
│   ├── quick/              # Quick tasks
│   └── codigo/             # Codebase maps (output)
├── package.json            # npm package definition
└── tsconfig.json           # TypeScript configuration
```

## Directory Purposes

**src/lib:**
- Propósito: Core library modules for CLI operations
- Contains: TypeScript modules for state, phase, roadmap, commands, init
- Key files: `core.ts`, `commands.ts`, `init.ts`, `etapa.ts`, `state.ts`
- Pattern: Functional exports, no classes

**src/install:**
- Propósito: Installer support modules
- Contains: Provider detection, settings, hooks, frontmatter conversion
- Key files: `providers.ts`, `frontmatter-convert.ts`, `settings.ts`, `hooks.ts`

**agentes:**
- Propósito: AI agent definitions with structured prompts
- Contains: 13 markdown files defining specialized agents
- Key files: `fase-planejador.md`, `fase-executor.md`, `fase-verificador.md`
- Pattern: YAML frontmatter + role + workflow sections

**comandos:**
- Propósito: Slash command orchestrators
- Contains: 35 markdown files defining workflows
- Key files: `planejar-etapa.md`, `executar-etapa.md`, `verificar-trabalho.md`
- Pattern: YAML frontmatter + objective + process sections

**fase-shared/templates:**
- Propósito: Document templates for workflow outputs
- Contains: SUMMARY, STATE, CONTEXT, ROADMAP templates
- Key files: `summary.md`, `state.md`, `contexto.md`, `roteiro.md`

**fase-shared/references:**
- Propósito: Schema definitions for validation
- Contains: PLANO schema, checkpoint reference, validation schema
- Key files: `plano-schema.md`, `checkpoints.md`, `validacao-schema.md`

**dist:**
- Propósito: Compiled JavaScript for npm distribution
- Contains: All src compiled to ES modules
- Generated: Yes (via `npm run build`)
- Committed: Yes (part of npm package)

**bin:**
- Propósito: Legacy npm package directory (DISCONTINUED)
- Status: Contains outdated TypeScript sources (version 3.3.1)
- Warning: ⚠️ DO NOT use bin/src/ as source — official source is src/
- Official Source: src/ (root directory, compiles to dist/)
- Recommendation: Will be removed/cleaned in Phase 5
- Key Evidence:
  - tsconfig.json: rootDir "src" (not bin/src)
  - package.json versions: root 5.0.1 (current), bin 3.3.1 (outdated)
  - bin/src/lib/*.ts has older code (.fase-ai-local naming)
- See: bin/README.md for detailed documentation

**.fase-ai:**
- Propósito: Project-local state and workflow documents
- Contains: Etapas (phases), STATE.md, ROADMAP.md, config.json
- Key files: `STATE.md`, `ROADMAP.md`, `config.json`, `etapas/*/`
- Generated: Yes (by commands/agents)
- Committed: Optional (user decision)

## Key File Locations

**Entry Points:**
- `src/fase-tools.ts`: CLI utility entry point
- `src/install.ts`: Installer entry point
- `dist/fase-tools.js`: Compiled CLI (npm bin)
- `dist/install.js`: Compiled installer (npm bin)

**Configuration:**
- `package.json`: npm package config, scripts, dependencies
- `tsconfig.json`: TypeScript compiler config
- `.fase-ai/config.json`: Project-level FASE config
- `.fase-ai/STATE.md`: Current project state
- `.fase-ai/ROADMAP.md`: Phase roadmap

**Core Logic:**
- `src/lib/core.ts`: Shared utilities, constants, helpers (651 lines)
- `src/lib/commands.ts`: CLI command implementations (705 lines)
- `src/lib/init.ts`: Workflow init compounds (743 lines)
- `src/lib/etapa.ts`: Phase CRUD operations (798 lines)
- `src/lib/state.ts`: State management
- `src/lib/frontmatter.ts`: YAML frontmatter parsing

**Testing:**
- `test/*.test.cjs`: Unit tests
- `test/tmux/`: E2E tmux-based tests
- `test/e2e/`: Integration tests

## Naming Conventions

**Arquivos:**
- TypeScript: `*.ts` em `src/`
- Compiled JS: `*.js` em `dist/`
- Agent definitions: `fase-{role}.md` em `agentes/`
- Command definitions: `{command}.md` em `comandos/`
- Templates: `{purpose}.md` em `fase-shared/templates/`
- Schemas: `{purpose}-schema.md` em `fase-shared/references/`

**Diretórios:**
- Phase directories: `{number}-{slug}` em `.fase-ai/etapas/` (e.g., `01-foundation`)
- Milestone archives: `v{version}-phases` em `.fase-ai/milestones/`
- Provider configs: `.{provider}` (e.g., `.claude`, `.opencode`, `.gemini`)

**Functions:**
- CLI commands: `cmd{Action}` (e.g., `cmdCommit`, `cmdFindEtapa`)
- Internal helpers: `{action}Internal` (e.g., `findEtapaInternal`)
- Utilities: `{purpose}` (e.g., `loadConfig`, `safeReadFile`)

## Onde Adicionar Novo Código

**Nova Feature (CLI command):**
- Código primário: `src/lib/{module}.ts`
- CLI registration: `src/fase-tools.ts` switch statement
- Tests: `test/{module}.test.cjs`

**Novo Agent:**
- Definition: `agentes/fase-{name}.md`
- Reference update: `AGENTS.md`

**Novo Command:**
- Definition: `comandos/{command}.md`
- Reference update: `docs/COMANDOS.md` (if exists)

**Novo Template:**
- Template file: `fase-shared/templates/{name}.md`
- Usage: Reference em agent/command definitions

**Nova Provider Support:**
- Provider module: `src/install/providers.ts`
- Frontmatter converter: `src/install/frontmatter-convert.ts`
- Installer update: `src/install.ts`
- Provider config dirs: Add handling for new `.{provider}`

**Utilities:**
- Shared helpers: `src/lib/core.ts`
- Provider-specific: `src/install/{module}.ts`

## Special Directories

**node_modules:**
- Propósito: npm dependencies
- Generated: Yes (npm install)
- Committed: No (gitignore)

**dist:**
- Propósito: Compiled output for npm
- Generated: Yes (tsc build)
- Committed: Yes (package.json files)

**bin:**
- Propósito: Legacy npm package directory (DISCONTINUED — use dist/)
- Generated: Historical (no longer used for publish)
- Committed: Yes (pending cleanup in Phase 5)
- Warning: Contains outdated src/ copy (v3.3.1)

**.fase-ai:**
- Propósito: Project workflow state
- Generated: Yes (FASE commands)
- Committed: Optional (user choice)
- Contains: ROADMAP.md, STATE.md, etapas/, config.json

**.{provider} (local):**
- Propósito: Provider-specific project config
- Generated: Yes (installer creates)
- Committed: Optional (team sharing)
- Examples: `.claude/`, `.opencode/`, `.gemini/`

**www/docs:**
- Propósito: Astro documentation site
- Generated: Partial (Astro build)
- Committed: Yes (source + generated)
- Build: `npm run build-docs`

## Workflow Document Locations

**Project-Level:**
- `.fase-ai/PROJECT.md`: Project description
- `.fase-ai/ROADMAP.md`: Phase roadmap
- `.fase-ai/STATE.md`: Current state
- `.fase-ai/config.json`: FASE configuration
- `.fase-ai/REQUIREMENTS.md`: Requirement tracking

**Phase-Level (.fase-ai/etapas/{phase}-{slug}/):**
- `{phase}-{NN}-PLANO.md`: Plan documents
- `{phase}-{NN}-SUMARIO.md`: Execution summaries
- `{phase}-CONTEXT.md`: Phase context (optional)
- `{phase}-RESEARCH.md`: Research findings (optional)
- `{phase}-VERIFICATION.md`: Verification results (optional)
- `{phase}-UAT.md`: User acceptance tests (optional)

**Quick Tasks:**
- `.fase-ai/quick/{num}-{slug}/`: Quick task directory
- `{num}-PLAN.md`: Quick task plan
- `{num}-SUMMARY.md`: Quick task summary

**Todos:**
- `.fase-ai/todos/pending/*.md`: Pending todos
- `.fase-ai/todos/completed/*.md`: Completed todos

---

*Structure analysis: 2026-04-22*