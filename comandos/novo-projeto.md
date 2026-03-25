---
name: fase:novo-projeto
description: Inicializa um novo projeto com coleta profunda de contexto e PROJECT.md
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---
<context>
**Flags:**
- `--auto` — Modo automático. Após perguntas de configuração, executa research → requirements → roadmap sem interação adicional. Espera documento de ideia via @ reference.
</context>

<objective>
Inicializar um novo projeto através de fluxo unificado: questionamento → research (opcional) → requirements → roadmap.

**Cria:**
- `.fase-ai-local/PROJECT.md` — contexto do projeto
- `.fase-ai-local/config.json` — preferências de workflow
- `.fase-ai-local/research/` — pesquisa de domínio (opcional)
- `.fase-ai-local/REQUIREMENTS.md` — requisitos definidos
- `.fase-ai-local/ROADMAP.md` — estrutura de fases
- `.fase-ai-local/STATE.md` — memória do projeto

**Após este comando:** Execute `/fase-planejar-fase 1` para iniciar a execução.
</objective>

<execution_context>
@~/.fase/workflows/new-project.md
@~/.fase/references/questioning.md
@~/.fase/references/ui-brand.md
@~/.fase/templates/project.md
@~/.fase/templates/requirements.md
</execution_context>

<process>
Execute o workflow new-project de @~/.fase/workflows/new-project.md ponta a ponta.
Preservar todos os gates do workflow (validação, aprovações, commits, roteamento).
</process>
