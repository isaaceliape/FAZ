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
Verifique se o milestone atingiu sua definição de done. Cheque cobertura de requisitos, integração cross-phase e fluxos end-to-end.

**Este comando É o orchestrator.** Lê arquivos VERIFICACAO.md existentes (fases já verificadas durante execute-phase), agrega tech debt e gaps adiados, então spawn integration checker para cross-phase wiring.
</objective>

<execution_context>
@~/.fase/workflows/audit-milestone.md
</execution_context>

<context>
Version: $ARGUMENTS (opcional — defaults para current milestone)

Arquivos core de planning são resolvidos in-workflow (`init milestone-op`) e carregados apenas quando necessário.

**Trabalho Concluído:**
Glob: .planejamento/fases/*/*-SUMARIO.md
Glob: .planejamento/fases/*/*-VERIFICACAO.md
</context>

<process>
Execute o workflow audit-milestone de @~/.fase/workflows/audit-milestone.md end-to-end.
Preserve todas as gates do workflow (determinação de escopo, leitura de verificação, integration check, cobertura de requisitos, routing).
</process>
