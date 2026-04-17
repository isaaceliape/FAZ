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
- `.fase-ai/PROJETO.md` — contexto do projeto
- `.fase-ai/config.json` — preferências de workflow
- `.fase-ai/pesquisa/` — pesquisa de domínio (opcional)
- `.fase-ai/REQUISITOS.md` — requisitos definidos
- `.fase-ai/ROTEIRO.md` — estrutura de fases
- `.fase-ai/ESTADO.md` — memória do projeto

**Após este comando:** Execute `/fase-planejar-etapa 1` para iniciar a execução.
</objective>


<process>
Execute o workflow new-project ponta a ponta.
Preservar todos os gates do workflow (validação, aprovações, commits, roteamento).
</process>
