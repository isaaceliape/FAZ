---
description: Audita retroativamente e preenche gaps de validação Nyquist para uma fase completada
argument-hint: "[número da fase]"
tools:
  read_file: true
  write_file: true
  replace: true
  run_shell_command: true
  glob: true
  search_file_content: true
  ask_user: true
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
