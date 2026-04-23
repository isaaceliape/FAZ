---
description: Remover fase futura do roteiro e renumerar fases subsequentes
argument-hint: <numero-da-fase>
tools:
  read: true
  write: true
  bash: true
  glob: true
---
<objective>
Remover uma fase futura não iniciada do roteiro e renumerar todas fases subsequentes para manter sequência limpa e linear.

Propósito: Remoção limpa de trabalho que decidiu não fazer, sem poluir contexto com marcadores de cancelled/deferred.
Output: Fase deletada, todas fases subsequentes renumeradas, git commit como registro histórico.
</objective>


<context>
Fase: $ARGUMENTS

Roadmap e estado são resolvidos no-workflow via `init fase-op` e leituras direcionadas.
</context>

<process>
Executar workflow remove-fase em do início ao fim.
Preservar todos validation gates (checagem de fase futura, checagem de trabalho), lógica de renumeração e commit.
</process>
