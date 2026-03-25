---
name: fase:auditar-marco
description: Audita conclusão do milestone contra o intent original antes de arquivar
argument-hint: "[version]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Task
  - Write
---
<objective>
Verifique se o milestone atingiu sua definição de done. Cheque cobertura de requisitos, integração cross-fase e fluxos end-to-end.

**Este comando É o orchestrator.** Lê arquivos VERIFICACAO.md existentes (fases já verificadas durante execute-fase), agrega tech debt e gaps adiados, então spawn integration checker para cross-fase wiring.
</objective>


<context>
Version: $ARGUMENTS (opcional — defaults para current milestone)

Arquivos core de planning são resolvidos in-workflow (`init milestone-op`) e carregados apenas quando necessário.

**Trabalho Concluído:**
Glob: .fase-ai-local/fases/*/*-SUMARIO.md
Glob: .fase-ai-local/fases/*/*-VERIFICACAO.md
</context>

<process>
Execute o workflow audit-milestone end-to-end.
Preserve todas as gates do workflow (determinação de escopo, leitura de verificação, integration check, cobertura de requisitos, routing).
</process>
