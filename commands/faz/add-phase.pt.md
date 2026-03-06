---
name: faz:add-phase
description: Adiciona fase ao final do milestone atual no roadmap
argument-hint: <descrição>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Adicionar uma nova fase inteira ao final do milestone atual no roadmap.

Roteia para o workflow add-phase que gerencia:
- Cálculo do número da fase (próximo inteiro sequencial)
- Criação de diretório com geração de slug
- Atualizações na estrutura do roadmap
- Tracking de evolução do roadmap no STATE.md
</objective>

<execution_context>
@~/.claude/faz/workflows/add-phase.md
</execution_context>

<context>
Argumentos: $ARGUMENTS (descrição da fase)

Roadmap e state são resolvidos in-workflow via `init phase-op` e tool calls direcionadas.
</context>

<process>
**Siga o workflow add-phase** de `@~/.claude/faz/workflows/add-phase.md`.

O workflow gerencia toda a lógica incluindo:
1. Parse e validação de argumentos
2. Checagem de existência do roadmap
3. Identificação do milestone atual
4. Cálculo do próximo número de fase (ignorando decimais)
5. Geração de slug da descrição
6. Criação de diretório da fase
7. Inserção de entrada no roadmap
8. Atualizações no STATE.md
</process>
