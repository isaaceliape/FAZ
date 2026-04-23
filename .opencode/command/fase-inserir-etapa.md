---
description: Insere trabalho urgente como fase decimal (ex: 72.1) entre fases existentes
argument-hint: <after> <description>
tools:
  read: true
  write: true
  bash: true
---

<objective>
Insere uma fase decimal para trabalho urgente descoberto mid-milestone que deve ser completado entre fases integer existentes.

Usa numeração decimal (72.1, 72.2, etc.) para preservar sequência lógica de fases planejadas enquanto acomoda inserções urgentes.

Propósito: Lidar com trabalho urgente descoberto durante execução sem renumerar roteiro inteiro.
</objective>


<context>
Argumentos: $ARGUMENTS (formato: <after-fase-number> <description>)

Roadmap e state são resolvidos in-workflow via `init fase-op` e tool calls direcionados.
</context>

<process>
Execute o workflow insert-fase end-to-end.
Preserve todas validation gates (argument parsing, fase verification, decimal calculation, roteiro updates).
</process>
