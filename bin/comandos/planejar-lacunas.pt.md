---
name: fase:planejar-lacunas
description: Cria fases para fechar todos gaps identificados pelo audit do milestone
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---
<objective>
Crie todas fases necessárias para fechar gaps identificados por `/fase-audit-milestone`.

Lê MILESTONE-AUDIT.md, agrupa gaps em fases lógicas, cria entradas de phase no ROTEIRO.md, e oferece planejar cada phase.

Um comando cria todas fix fases — sem `/fase-adicionar-fase` manual por gap.
</objective>

<execution_context>
@~/.fase/workflows/plan-milestone-gaps.md
</execution_context>

<context>
**Resultados do audit:**
Glob: .planejamento/v*-MILESTONE-AUDIT.md (use mais recente)

Intent original e estado atual do planning são carregados on demand dentro do workflow.
</context>

<process>
Execute o workflow plan-milestone-gaps de @~/.fase/workflows/plan-milestone-gaps.md end-to-end.
Preserve todas workflow gates (audit loading, prioritization, phase grouping, confirmação do usuário, roteiro updates).
</process>
