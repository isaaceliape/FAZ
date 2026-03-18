---
name: fase:planejar-fase
description: Cria plano detalhado da fase (PLANO.md) com loop de verificação
argument-hint: "[fase] [--auto] [--pesquisa] [--skip-pesquisa] [--gaps] [--skip-verify] [--prd <arquivo>]"
agent: faz-planner
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - WebFetch
  - mcp__context7__*
---
<objective>
Criar prompts executáveis da fase (arquivos PLANO.md) para uma fase do roteiro com pesquisa e verificação integrados.

**Fluxo padrão:** Research (se necessário) → Plano → Verificar → Concluir

**Papel do orquestrador:** Analisar argumentos, validar fase, pesquisar domínio (a menos que pulado), spawnar faz-planner, verificar com faz-plan-checker, iterar até passar ou atingir max de iterações, apresentar resultados.
</objective>

<execution_context>
@~/.claude/fase/workflows/plan-phase.md
@~/.claude/fase/references/ui-brand.md
</execution_context>

<context>
Número da fase: $ARGUMENTS (opcional — auto-detecta próxima fase não planejada se omitido)

**Flags:**
- `--pesquisa` — Força re-pesquisa mesmo se RESEARCH.md existir
- `--skip-pesquisa` — Pula pesquisa, vai direto para planejamento
- `--gaps` — Modo de fechamento de gaps (lê VERIFICACAO.md, pula pesquisa)
- `--skip-verify` — Pula loop de verificação
- `--prd <arquivo>` — Usa um arquivo PRD/critérios de aceitação em vez de discuss-phase. Parseia requisitos em CONTEXT.md automaticamente. Pula discuss-phase completamente.

Normalizar input da fase no passo 2 antes de qualquer lookup de diretório.
</context>

<process>
Execute o workflow plan-phase de @~/.claude/fase/workflows/plan-phase.md ponta a ponta.
Preservar todos os gates do workflow (validação, pesquisa, planejamento, loop de verificação, roteamento).
</process>
