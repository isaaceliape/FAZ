---
description: Cria fases para fechar todos gaps identificados pelo audit do milestone
tools:
  read_file: true
  write_file: true
  run_shell_command: true
  glob: true
  search_file_content: true
  ask_user: true
---

<objective>
Crie todas fases necessárias para fechar gaps identificados por `/fase-audit-milestone`.

Lê MARCO-AUDITORIA.md, agrupa gaps em fases lógicas, cria entradas de fase no ROTEIRO.md, e oferece planejar cada fase.

Um comando cria todas fix fases — sem `/fase-adicionar-etapa` manual por gap.
</objective>


<context>
**Resultados do audit:**
Glob: .fase-ai/v*-MARCO-AUDITORIA.md (use mais recente)

Intent original e estado atual do planning são carregados on demand dentro do workflow.
</context>

<process>
Execute o workflow plan-milestone-gaps end-to-end.
Preserve todas workflow gates (audit loading, prioritization, fase grouping, confirmação do usuário, roteiro updates).
</process>
