---
name: fase:novo-projeto
description: Inicializa um novo projeto com coleta profunda de contexto e PROJETO.md
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
- `--auto` — Modo automático. Após perguntas de configuração, executa pesquisa → requisitos → roteiro sem interação adicional. Espera documento de ideia via @ reference.
</context>

<objective>
Inicializar um novo projeto através de fluxo unificado: questionamento → pesquisa (opcional) → requisitos → roteiro.

**Cria:**
- `.planejamento/PROJETO.md` — contexto do projeto
- `.planejamento/config.json` — preferências de workflow
- `.planejamento/pesquisa/` — pesquisa de domínio (opcional)
- `.planejamento/REQUISITOS.md` — requisitos definidos
- `.planejamento/ROTEIRO.md` — estrutura de fases
- `.planejamento/ESTADO.md` — memória do projeto

**Após este comando:** Execute `/fase-planejar-fase 1` para iniciar a execução.
</objective>

<execution_context>
@~/.claude/fase/workflows/new-project.md
@~/.claude/fase/references/questioning.md
@~/.claude/fase/references/ui-brand.md
@~/.claude/fase/templates/project.md
@~/.claude/fase/templates/requisitos.md
</execution_context>

<process>
Execute o workflow new-project de @~/.claude/fase/workflows/new-project.md ponta a ponta.
Preservar todos os gates do workflow (validação, aprovações, commits, roteamento).
</process>
