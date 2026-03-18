---
name: fase:checar-tarefas
description: Lista tarefas pendentes e seleciona uma para trabalhar
argument-hint: [filtro de área]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
Listar todas as tarefas pendentes, permitir seleção, carregar contexto completo para a tarefa selecionada, e rotear para ação apropriada.

Roteia para o workflow check-todos que gerencia:
- Contagem e listagem de tarefas com filtro de área
- Seleção interativa com carregamento de contexto completo
- Checagem de correlação com roteiro
- Roteamento de ação (trabalhar agora, adicionar à fase, brainstorm, criar fase)
- Atualizações no ESTADO.md e commits git
</objective>

<execution_context>
@~/.claude/fase/workflows/check-todos.md
</execution_context>

<context>
Argumentos: $ARGUMENTS (filtro de área opcional)

Estado de tarefas e correlação com roteiro são carregados in-workflow usando `init todos` e reads direcionados.
</context>

<process>
**Siga o workflow check-todos** de `@~/.claude/fase/workflows/check-todos.md`.

O workflow gerencia toda a lógica incluindo:
1. Checagem de existência de tarefas
2. Filtro de área
3. Listagem e seleção interativa
4. Carregamento de contexto completo com sumários de arquivos
5. Checagem de correlação com roteiro
6. Oferecimento e execução de ação
7. Atualizações no ESTADO.md
8. Commits git
</process>
</output>
