---
name: fase:adicionar-todo
description: Captura ideia ou task como todo do contexto atual da conversa
argument-hint: [descrição opcional]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
Capturar uma ideia, task, ou issue que surge durante uma sessão F.A.S.E. como um todo estruturado para trabalho posterior.

Roteia para o workflow add-todo que gerencia:
- Criação de estrutura de diretório
- Extração de conteúdo dos argumentos ou conversa
- Inferência de área dos file paths
- Detecção e resolução de duplicados
- Criação de arquivo todo com frontmatter
- Atualizações no STATE.md
- Commits git
</objective>

<execution_context>
@~/.claude/fase/workflows/add-todo.md
</execution_context>

<context>
Argumentos: $ARGUMENTS (descrição do todo opcional)

Estado é resolvido in-workflow via `init todos` e reads direcionados.
</context>

<process>
**Siga o workflow add-todo** de `@~/.claude/fase/workflows/add-todo.md`.

O workflow gerencia toda a lógica incluindo:
1. Garantia de diretório
2. Checagem de área existente
3. Extração de conteúdo (argumentos ou conversa)
4. Inferência de área
5. Checagem de duplicados
6. Criação de arquivo com geração de slug
7. Atualizações no STATE.md
8. Commits git
</process>
