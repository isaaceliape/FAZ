---
name: fase:adicionar-testes
description: Gera testes para uma fase completada baseado em critérios UAT e implementação
argument-hint: "<fase> [instruções adicionais]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
argument-instructions: |
  Parseie o argumento como um número de fase (inteiro, decimal, ou sufixo de letra), mais instruções opcionais em free-text.
  Exemplo: /fase:adicionar-testes 12
  Exemplo: /fase:adicionar-testes 12 focar em edge cases no módulo de pricing
---
<objective>
Gerar testes unit e E2E para uma fase completada, usando seu SUMMARY.md, CONTEXT.md, e VERIFICATION.md como especificações.

Analisa arquivos de implementação, classifica em TDD (unit), E2E (browser), ou Skip categories, apresenta um plano de teste para aprovação do usuário, então gera testes seguindo convenções RED-GREEN.

Output: Arquivos de teste commitados com mensagem `test(phase-{N}): add unit and E2E tests from add-tests command`
</objective>

<execution_context>
@~/.claude/fase/workflows/add-tests.md
</execution_context>

<context>
Fase: $ARGUMENTS

@.planning/STATE.md
@.planning/ROADMAP.md
</context>

<process>
Execute o workflow add-tests de @~/.claude/fase/workflows/add-tests.md ponta a ponta.
Preserve todos os gates do workflow (aprovação de classificação, aprovação de plano de teste, verificação RED-GREEN, relatório de gaps).
</process>
