---
title: Claude Code
description: Features nativas e integração com Claude Code da Anthropic
---

# FASE no Claude Code

**Claude Code** é o AI coding assistant da Anthropic, e é o ambiente com **maior integração** com FASE.

## Features Nativas Disponíveis

### 1. MCP Servers 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

MCP (Model Context Protocol) permite integrar Claude Code com ferramentas externas:

#### GitHub MCP
```json
{
  "mcp": {
    "github": {
      "url": "https://github.com/anthropics/mcp-servers/tree/main/src/github",
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}
```

**Use para:**
- Linkar fases com PRs e issues
- Persistar estado do FASE no GitHub
- Pesquisar histórico de commits

#### Slack MCP
```json
{
  "mcp": {
    "slack": {
      "url": "https://github.com/anthropics/mcp-servers/tree/main/src/slack",
      "env": {
        "SLACK_BOT_TOKEN": "$SLACK_BOT_TOKEN"
      }
    }
  }
}
```

**Use para:**
- Notificações de fase completa
- Updates assíncronos para o time
- Escalação de issues críticas

#### Git MCP
```json
{
  "mcp": {
    "git": {
      "url": "https://github.com/anthropics/mcp-servers/tree/main/src/git"
    }
  }
}
```

**Use para:**
- Pesquisa de padrões no histórico
- Identificar especialistas (git blame)
- Análise de decisões arquiteturais

#### Linear MCP
```json
{
  "mcp": {
    "linear": {
      "url": "https://github.com/anthropics/mcp-servers/tree/main/src/linear",
      "env": {
        "LINEAR_API_KEY": "$LINEAR_API_KEY"
      }
    }
  }
}
```

**Use para:**
- Traceabilidade de requisitos
- Atualizar status de tickets
- Linkar fases com milestones

---

### 2. Hooks 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

Hooks rodam comandos shell em pontos específicos do lifecycle:

#### Hook de Testes Pós-Edição
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --bail 2>/dev/null && echo 'Tests pass' || echo 'WARNING: tests failing'"
          }
        ]
      }
    ]
  }
}
```

#### Hook de Contexto de Fase (SessionStart)
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "resume",
        "hooks": [
          {
            "type": "command",
            "command": "cat .planejamento/phases/current-phase.txt && echo '\\n---\\nPhase context loaded.'"
          }
        ]
      }
    ]
  }
}
```

#### Hook de Validação de Plano (UserPromptSubmit)
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if grep -q '/fase-executar-fase' <<< \"$PROMPT\"; then node .fase/bin/validate-plan.cjs && exit 0 || exit 1; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

> **Nota:** Variáveis de ambiente como `$CLAUDE_CWD` e `$SLACK_WEBHOOK` devem ser explicitamente exportadas no contexto de execução do hook.

---

### 3. Skills 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

Skills são instruções e comandos customizados:

#### Skill de Terminologia FASE
Arquivo: `.claude/skills/fase-terminologia.md`

```markdown
# FASE Terminology

**Fase**: Uma entrega major/feature do projeto (ex: "User Auth", "Payment Integration")

**Etapa**: Estágio de execução. Planos na mesma etapa rodam em paralelo; etapas executam sequencialmente.

**Plano**: Blueprint de implementação para 2-3 tarefas em uma fase.

**Pesquisa**: Output de pesquisa sobre como implementar uma fase.

**Sumário**: Após execução, resumo do que foi built, arquivos mudados, desvios.

**Verificação**: Análise pós-execução: a fase atingiu o goal? Lacunas encontradas?
```

#### Skills por Stack
- `.claude/skills/react-conventions.md` — Padrões React
- `.claude/skills/api-design.md` — Padrões de API
- `.claude/skills/v3-milestone.md` — Contexto do milestone

---

### 4. Extended Context (1M Tokens) 🟢

**Status:** <i class="fa fa-check-circle"></i> Disponível em planos Max, Team, Enterprise

#### Análise Multi-Fase em Único Agent

Antes: Cada fase analisada independentemente.

Depois: Single agent analisa 4-5 fases de uma vez.

```markdown
<files_to_read>
@.planejamento/phases/1-*/PLAN*.md
@.planejamento/phases/2-*/PLAN*.md
@.planejamento/phases/3-*/PLAN*.md
@.planejamento/phases/4-*/PLAN*.md
@.planejamento/phases/5-*/PLAN*.md
</files_to_read>
```

**Benefícios:**
- Detectar issues de integração entre fases
- Reduzir overhead de coordenação
- Análise de dependências cruzadas

---

### 5. Voice Mode 🟢

**Status:** <i class="fa fa-check-circle"></i> Disponível

Push-to-talk voice input (segurar spacebar para falar).

**Use para:**
- Brainstorm durante pesquisa
- Debugging sessions
- Notas rápidas (transcritas automaticamente)

---

### 6. Plan Mode 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

Plan Mode alinha perfeitamente com filosofia FASE:

| FASE Concept | Claude Code Equivalent |
|--------------|----------------------|
| `fase-verificador-plano` | Plan Mode approval |
| `fase-planejador` breakdown | Transparent reasoning |
| Checkpoints before execution | Wait for approval |

---

## Instalação

```bash
# Instalar apenas para Claude Code
npx fase-ai --claude

# Instalar globalmente
npx fase-ai --claude --global

# Instalar localmente (projeto atual)
npx fase-ai --claude --local
```

## Configuração Recomendada

Arquivo: `~/.claude/settings.json`

```json
{
  "mcp": {
    "github": {
      "url": "https://github.com/anthropics/mcp-servers/tree/main/src/github",
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    }
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_CWD\" | grep -q 'VERIFICATION\\|SUMMARY'; then echo 'Phase verification complete' || true; fi"
          }
        ]
      }
    ]
  },
  "skills": [
    ".claude/skills/fase-terminologia.md",
    ".claude/skills/react-conventions.md"
  ]
}
```

## Comandos

No Claude Code, use o prefixo `/fase-`:

```bash
/fase-ajuda
/fase-novo-projeto
/fase-planejar-fase
/fase-executar-fase
/fase-verificar-trabalho
```

## Roadmap de Implementação

### Quick Wins (1-2 semanas)
1. <i class="fa fa-check-circle"></i> Hooks para notificações
2. <i class="fa fa-check-circle"></i> Skills para terminologia
3. 🔲 Slack MCP integration

### Medium Effort (2-4 semanas)
4. 🔲 GitHub MCP para workflow tracking
5. 🔲 Git MCP para pesquisa
6. 🔲 Extended context experiments

### Scaling (Ongoing)
7. 🔲 Linear MCP integration
8. 🔲 Per-milestone skills
9. 🔲 /loop automation

---

## Próximos Passos

- [Instalação](/FASE/docs/getting-started/installation/)
- [Quick Start](/FASE/docs/getting-started/quick-start/)
- [Comandos](/FASE/docs/reference/commands/)
