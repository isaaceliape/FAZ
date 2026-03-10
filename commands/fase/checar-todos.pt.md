---
name: fase:checar-todos
description: Lista todos pendentes e seleciona um para trabalhar
argument-hint: [filtro de área]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
Listar todos os todos pendentes, permitir seleção, carregar contexto completo para o todo selecionado, e rotear para ação apropriada.

Roteia para o workflow check-todos que gerencia:
- Contagem e listagem de todos com filtro de área
- Seleção interativa com carregamento de contexto completo
- Checagem de correlação com roadmap
- Roteamento de ação (trabalhar agora, adicionar à fase, brainstorm, criar fase)
- Atualizações no STATE.md e commits git
</objective>

<execution_context>
@~/.claude/fase/workflows/check-todos.md
</execution_context>

<context>
Argumentos: $ARGUMENTS (filtro de área opcional)

Estado de todos e correlação com roadmap são carregados in-workflow usando `init todos` e reads direcionados.
</context>

<process>
**Siga o workflow check-todos** de `@~/.claude/fase/workflows/check-todos.md`.

O workflow gerencia toda a lógica incluindo:
1. Checagem de existência de todos
2. Filtro de área
3. Listagem e seleção interativa
4. Carregamento de contexto completo com sumários de arquivos
5. Checagem de correlação com roadmap
6. Oferecimento e execução de ação
7. Atualizações no STATE.md
8. Commits git
</process>
