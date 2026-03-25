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
- `.fase-ai-local/PROJETO.md` — contexto do projeto
- `.fase-ai-local/config.json` — preferências de workflow
- `.fase-ai-local/pesquisa/` — pesquisa de domínio (opcional)
- `.fase-ai-local/REQUISITOS.md` — requisitos definidos
- `.fase-ai-local/ROTEIRO.md` — estrutura de fases
- `.fase-ai-local/ESTADO.md` — memória do projeto

**Após este comando:** Execute `/fase-planejar-fase 1` para iniciar a execução.
</objective>


<process>
Execute o workflow new-project ponta a ponta.
Preservar todos os gates do workflow (validação, aprovações, commits, roteamento).
</process>
