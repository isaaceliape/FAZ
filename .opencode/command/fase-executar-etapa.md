---
description: Executa todos os planos de uma fase com paralelização em etapas
argument-hint: "<número-fase> [--gaps-only]"
tools:
  read: true
  write: true
  edit: true
  glob: true
  grep: true
  bash: true
  task: true
  todowrite: true
  question: true
---
<objective>
Executar todos os planos de uma fase usando execução paralela em etapas.

Orquestrador se mantém enxuto: descobrir planos, analisar dependências, agrupar em etapas, spawnar subagents, coletar resultados. Cada subagent carrega o contexto completo de execute-plan e gerencia seu próprio plano.

Orçamento de contexto: ~15% orquestrador, 100% fresh por subagent.
</objective>


<context>
Fase: $ARGUMENTS

**Flags:**
- `--gaps-only` — Executa apenas planos de fechamento de gaps (planos com `gap_closure: true` no frontmatter). Use após verify-work criar planos de correção.

Arquivos de contexto são resolvidos dentro do workflow via `fase-tools init execute-fase` e por subagent via blocos `<files_to_read>`.
</context>

<process>
Execute o workflow execute-fase ponta a ponta.
Preservar todos os gates do workflow (execução em etapas, checkpoint handling, verificação, atualizações de estado, roteamento).
</process>
