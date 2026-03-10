---
name: fase:remover-fase
description: Remover fase futura do roadmap e renumerar fases subsequentes
argument-hint: <numero-da-fase>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
Remover uma fase futura não iniciada do roadmap e renumerar todas fases subsequentes para manter sequência limpa e linear.

Propósito: Remoção limpa de trabalho que decidiu não fazer, sem poluir contexto com marcadores de cancelled/deferred.
Output: Fase deletada, todas fases subsequentes renumeradas, git commit como registro histórico.
</objective>

<execution_context>
@~/.fase/workflows/remove-phase.md
</execution_context>

<context>
Fase: $ARGUMENTS

Roadmap e estado são resolvidos no-workflow via `init phase-op` e leituras direcionadas.
</context>

<process>
Executar workflow remove-phase em @~/.fase/workflows/remove-phase.md do início ao fim.
Preservar todos validation gates (checagem de fase futura, checagem de trabalho), lógica de renumeração e commit.
</process>
