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
Verifique se o milestone atingiu sua definição de done. Cheque cobertura de requirements, integração cross-phase e fluxos end-to-end.

**Este comando É o orchestrator.** Lê arquivos VERIFICATION.md e SUMMARY.md existentes em paralelo (para marcos com 8+ fases), agrega tech debt e gaps adiados, então spawn integration checker para cross-phase wiring.

**Paralelização:** Para marcos grandes (8+ fases), spawn múltiplos agentes leitores em paralelo, cada um resumindo um batch de fases, reduzindo consumo de contexto do orquestrador. Speedup esperado: mantém orquestrador enxuto (~15% contexto) para marcos de qualquer tamanho.
</objective>

<execution_context>
@~/.fase/workflows/audit-milestone.md
</execution_context>

<context>
Version: $ARGUMENTS (opcional — defaults para current milestone)

Arquivos core de planning são resolvidos in-workflow (`init milestone-op`) e carregados apenas quando necessário.

**Trabalho Concluído:**
Glob: .fase-ai-local/phases/*/*-SUMMARY.md
Glob: .fase-ai-local/phases/*/*-VERIFICATION.md
</context>

<process>
**Fluxo com Leitura Paralela (marcos com 8+ fases):**
1. Execute init milestone-op para determinar escopo (quais phases existem)
2. Particionar phases em batches de 3
3. Spawn um leitor paralelo por batch: cada um lê SUMMARY.md + VERIFICATION.md para suas fases, retorna estrutura JSON com tech_debt[], gaps[], deferred[]
4. Orquestrador agrega respostas estruturadas (não carrega arquivo completo)
5. Continue com integration check e requirements coverage normalmente

**Fluxo Serial (marcos com <8 fases):**
- Execute o workflow audit-milestone de @~/.fase/workflows/audit-milestone.md end-to-end normalmente (compatibilidade)

Preserve todas as gates do workflow (determinação de escopo, leitura de verificação paralela, integration check, cobertura de requirements, routing).
</process>
