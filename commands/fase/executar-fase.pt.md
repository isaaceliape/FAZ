---
name: fase:executar-fase
description: Executa todos os planos de uma fase com paralelização em waves
argument-hint: "<número-fase> [--gaps-only]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - TodoWrite
  - AskUserQuestion
---
<objective>
Executar todos os planos de uma fase usando execução paralela em waves.

Orquestrador se mantém enxuto: descobrir planos, analisar dependências, agrupar em waves, spawnar subagents, coletar resultados. Cada subagent carrega o contexto completo de execute-plan e gerencia seu próprio plano.

Orçamento de contexto: ~15% orquestrador, 100% fresh por subagent.
</objective>

<execution_context>
@~/.claude/fase/workflows/execute-phase.md
@~/.claude/fase/references/ui-brand.md
</execution_context>

<context>
Fase: $ARGUMENTS

**Flags:**
- `--gaps-only` — Executa apenas planos de fechamento de gaps (planos com `gap_closure: true` no frontmatter). Use após verify-work criar planos de correção.

Arquivos de contexto são resolvidos dentro do workflow via `fase-tools init execute-phase` e por subagent via blocos `<files_to_read>`.
</context>

<process>
Execute o workflow execute-phase de @~/.claude/fase/workflows/execute-phase.md ponta a ponta.
Preservar todos os gates do workflow (execução em waves, checkpoint handling, verificação, atualizações de estado, roteamento).
</process>
