---
name: fase:planejar-fase
description: Cria plano detalhado da fase (PLAN.md) com loop de verificação
argument-hint: "[fase] [--auto] [--research] [--skip-research] [--gaps] [--skip-verify] [--prd <arquivo>]"
agent: fase-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
<objective>
Criar prompts executáveis da fase (arquivos PLAN.md) para uma fase do roadmap com research e verificação integrados.

**Fluxo padrão:** Research (se necessário) → Plano → Verificar → Concluir

**Papel do orquestrador:** Analisar argumentos, validar fase, pesquisar domínio (a menos que pulado), spawnar fase-planner, verificar com fase-plan-checker, iterar até passar ou atingir max de iterações, apresentar resultados.
</objective>

<execution_context>
@~/.claude/fase/workflows/plan-phase.md
@~/.claude/fase/references/ui-brand.md
</execution_context>

<context>
Número da fase: $ARGUMENTS (opcional — auto-detecta próxima fase não planejada se omitido)

**Flags:**
- `--research` — Força re-research mesmo se RESEARCH.md existir
- `--skip-research` — Pula research, vai direto para planejamento
- `--gaps` — Modo de fechamento de gaps (lê VERIFICATION.md, pula research)
- `--skip-verify` — Pula loop de verificação
- `--prd <arquivo>` — Usa um arquivo PRD/critérios de aceitação em vez de discuss-phase. Parseia requisitos em CONTEXT.md automaticamente. Pula discuss-phase completamente.

Normalizar input da fase no passo 2 antes de qualquer lookup de diretório.
</context>

<process>
Execute o workflow plan-phase de @~/.claude/fase/workflows/plan-phase.md ponta a ponta.
Preservar todos os gates do workflow (validação, research, planejamento, loop de verificação, roteamento).
</process>
