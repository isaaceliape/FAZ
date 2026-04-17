---
name: fase:rapido
description: Executar tarefa rápida com garantias FASE (commits atômicos, rastreamento de estado) mas pular agents opcionais
argument-hint: "[--full] [--discuss]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
Executar tarefas pequenas e ad-hoc com garantias FASE (commits atômicos, rastreamento ESTADO.md).

Modo rápido é o mesmo sistema com caminho mais curto:
- Spawn fase-planner (modo rápido) + fase-executor(s)
- Tarefas rápidas vivem em `.fase-ai/quick/` separado de fases planejadas
- Atualiza tabela "Tarefas Rápidas Completas" do ESTADO.md (NÃO ROTEIRO.md)

**Padrão:** Pula pesquisa, discussão, plan-checker, verifier. Use quando souber exatamente o que fazer.

**Flag `--discuss`:** Fase de discussão leve antes do planejamento. Expõe suposições, clarifica áreas cinzentas, captura decisões no CONTEXTO.md. Use quando a tarefa tiver ambiguidade que valha resolver de antemão.

**Flag `--full`:** Habilita verificação de plano (máx 2 iterações) e verificação pós-execução. Use quando quiser garantias de qualidade sem cerimônia completa de milestone.

Flags são composáveis: `--discuss --full` dá discussão + verificação de plano + verificação.
</objective>


<context>
$ARGUMENTS

Arquivos de contexto são resolvidos dentro do workflow (`init quick`) e delegados via blocos `<files_to_read>`.
</context>

<process>
Executar o workflow quick em do início ao fim.
Preservar todos os gates do workflow (validação, descrição da tarefa, planejamento, execução, atualizações de estado, commits).
</process>
