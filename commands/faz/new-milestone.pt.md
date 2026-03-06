---
name: faz:new-milestone
description: Inicia um novo ciclo de milestone — atualiza PROJECT.md e roteia para requirements
argument-hint: "[nome do milestone, ex: 'v1.1 Notifications']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
Iniciar um novo milestone: questionamento → research (opcional) → requirements → roadmap.

Equivalente brownfield de new-project. Projeto existe, PROJECT.md tem histórico. Coleta "o que vem depois", atualiza PROJECT.md, então executa ciclo requirements → roadmap.

**Cria/Atualiza:**
- `.planning/PROJECT.md` — atualizado com novos objetivos do milestone
- `.planning/research/` — pesquisa de domínio (opcional, apenas features NOVAS)
- `.planning/REQUIREMENTS.md` — requisitos definidos para este milestone
- `.planning/ROADMAP.md` — estrutura de fases (continua numeração)
- `.planning/STATE.md` — resetado para novo milestone

**Depois:** `/faz:plan-phase [N]` para iniciar execução.
</objective>

<execution_context>
@~/.claude/faz/workflows/new-milestone.md
@~/.claude/faz/references/questioning.md
@~/.claude/faz/references/ui-brand.md
@~/.claude/faz/templates/project.md
@~/.claude/faz/templates/requirements.md
</execution_context>

<context>
Nome do milestone: $ARGUMENTS (opcional - vai perguntar se não fornecido)

Arquivos de contexto de projeto e milestone são resolvidos dentro do workflow (`init new-milestone`) e delegados via blocos `<files_to_read>` onde subagents são usados.
</context>

<process>
Execute o workflow new-milestone de @~/.claude/faz/workflows/new-milestone.md ponta a ponta.
Preserve todos os gates do workflow (validação, questionamento, research, requirements, aprovação de roadmap, commits).
</process>
