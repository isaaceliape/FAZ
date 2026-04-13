---
name: fase:planejar-fase
description: Cria plano detalhado da fase (PLANO.md) com loop de verificação
argument-hint: "[fase] [--auto] [--pesquisa] [--skip-pesquisa] [--gaps] [--skip-verify] [--prd <arquivo>]"
agent: fase-planejador
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


<context>
Número da fase: $ARGUMENTS (opcional — auto-detecta próxima fase não planejada se omitido)

**Flags:**
- `--pesquisa` — Força re-pesquisa mesmo se PESQUISA.md existir
- `--skip-pesquisa` — Pula pesquisa, vai direto para planejamento
- `--gaps` — Modo de fechamento de gaps (lê VERIFICACAO.md, pula pesquisa)
- `--skip-verify` — Pula loop de verificação
- `--prd <arquivo>` — Usa um arquivo PRD/critérios de aceitação em vez de discuss-fase. Parseia requisitos em CONTEXTO.md automaticamente. Pula discuss-fase completamente.

Normalizar input da fase no passo 2 antes de qualquer lookup de diretório.
</context>

<process>
Execute o workflow plan-fase ponta a ponta.
Preservar todos os gates do workflow (validação, pesquisa, planejamento, loop de verificação, roteamento).

**Gate de escalação (apenas no modo `--gaps`):**
Antes de gerar planos de gap closure, leia VERIFICACAO.md e verifique o campo `re_verification.closure_attempts`:

```bash
grep "closure_attempts:" comandos/fases/${PHASE_DIR}/*-VERIFICACAO.md 2>/dev/null
```

Se `closure_attempts >= 3` E existe seção `## <i class="fa fa-warning"></i> Escalação Humana Necessária` no VERIFICACAO.md:
- **NÃO gere novos planos de gap closure**
- Exiba a seção de escalação do VERIFICACAO.md para o usuário
- Oriente o usuário a resolver manualmente antes de retentar

Se `closure_attempts < 3` ou VERIFICACAO.md não existe: prossiga normalmente.
</process>
