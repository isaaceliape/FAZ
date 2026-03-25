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

Lê MARCO-AUDITORIA.md, agrupa gaps em fases lógicas, cria entradas de fase no ROTEIRO.md, e oferece planejar cada fase.

Um comando cria todas fix fases — sem `/fase-adicionar-fase` manual por gap.
</objective>


<context>
**Resultados do audit:**
Glob: .fase-ai-local/v*-MARCO-AUDITORIA.md (use mais recente)

Intent original e estado atual do planning são carregados on demand dentro do workflow.
</context>

<process>
Execute o workflow plan-milestone-gaps end-to-end.
Preserve todas workflow gates (audit loading, prioritization, fase grouping, confirmação do usuário, roteiro updates).
</process>
