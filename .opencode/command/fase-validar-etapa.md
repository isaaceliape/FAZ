---
description: Audita retroativamente e preenche gaps de validação Nyquist para uma fase completada
argument-hint: "[número da fase]"
tools:
  read: true
  write: true
  edit: true
  bash: true
  glob: true
  grep: true
  task: true
  question: true
---
<objective>
Auditar cobertura de validação Nyquist para uma fase completada. Três estados:
- (A) VALIDACAO.md existe — audita e preenche gaps
- (B) Sem VALIDACAO.md, SUMARIO.md existe — reconstrói dos artefatos
- (C) Fase não executada — sai com orientação

Output: VALIDACAO.md atualizado + arquivos de teste gerados.
</objective>


<context>
Fase: $ARGUMENTS — opcional, padrão é última fase completada.
</context>

<process>
Execute .md.
Preserve todos os gates do workflow.
</process>
