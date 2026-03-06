---
name: faz:insert-phase
description: Insere trabalho urgente como phase decimal (ex: 72.1) entre phases existentes
argument-hint: <after> <description>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Insere uma phase decimal para trabalho urgente descoberto mid-milestone que deve ser completado entre phases integer existentes.

Usa numeração decimal (72.1, 72.2, etc.) para preservar sequência lógica de phases planejadas enquanto acomoda inserções urgentes.

Propósito: Lidar com trabalho urgente descoberto durante execução sem renumerar roadmap inteiro.
</objective>

<execution_context>
@~/.faz/workflows/insert-phase.md
</execution_context>

<context>
Argumentos: $ARGUMENTS (formato: <after-phase-number> <description>)

Roadmap e state são resolvidos in-workflow via `init phase-op` e tool calls direcionados.
</context>

<process>
Execute o workflow insert-phase de @~/.faz/workflows/insert-phase.md end-to-end.
Preserve todas validation gates (argument parsing, phase verification, decimal calculation, roadmap updates).
</process>
