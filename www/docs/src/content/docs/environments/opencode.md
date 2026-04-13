---
title: OpenCode
description: Features nativas e integração com OpenCode
---

# FASE no OpenCode

**OpenCode** é um AI coding assistant open source, focado em customização e extensibilidade.

## Features Nativas Disponíveis

### 1. Skills 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

Skills no OpenCode são similares ao Claude Code:

#### Skill de Terminologia FASE
Arquivo: `~/.config/opencode/skills/fase-terminologia.md`

```markdown
# FASE Terminology

**Fase**: Uma entrega major/feature do projeto

**Etapa**: Estágio de execução

**Plano**: Blueprint de implementação

**Verificação**: Análise pós-execução
```

#### Skills por Stack
- `~/.config/opencode/skills/react-conventions.md`
- `~/.config/opencode/skills/api-design.md`

---

### 2. Hooks 🟡

**Status:** <i class="fa fa-check-circle"></i> Suportado via settings.json

OpenCode segue o padrão de hooks do Claude Code:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --bail 2>/dev/null"
          }
        ]
      }
    ]
  }
}
```

**Local:** `~/.config/opencode/settings.json`

---

### 3. Flat Commands 🟢

**Status:** <i class="fa fa-check-circle"></i> Nativo

OpenCode usa estrutura de comandos plana (sem prefixo `:`):

| Claude Code | OpenCode |
|-------------|----------|
| `/fase:ajuda` | `/fase-ajuda` |
| `/fase:novo-projeto` | `/fase-novo-projeto` |

FASE automaticamente converte comandos durante instalação.

---

### 4. XDG Config Standard 🟢

**Status:** <i class="fa fa-check-circle"></i> Segue padrão XDG

OpenCode usa XDG Base Directory specification:

| Variável | Path |
|----------|------|
| `OPENCODE_CONFIG_DIR` | Custom directory |
| `OPENCODE_CONFIG` | Custom file |
| `XDG_CONFIG_HOME` | `~/.config` |
| Default | `~/.config/opencode/` |

**Prioridade:**
1. `OPENCODE_CONFIG_DIR`
2. `dirname(OPENCODE_CONFIG)`
3. `XDG_CONFIG_HOME/opencode`
4. `~/.config/opencode/` (default)

---

## Instalação

```bash
# Instalar apenas para OpenCode
npx fase-ai --opencode

# Instalar globalmente
npx fase-ai --opencode --global

# Instalar localmente
npx fase-ai --opencode --local

# Com diretório customizado
npx fase-ai --opencode --config-dir /custom/path
```

## Configuração Recomendada

Arquivo: `~/.config/opencode/settings.json`

```json
{
  "skills": [
    "fase-terminologia",
    "react-conventions"
  ],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm test 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

## Estrutura de Diretórios

```
~/.config/opencode/
├── settings.json
├── skills/
│   ├── fase-terminologia.md
│   └── react-conventions.md
└── fase/
    ├── commands/
    └── agents/
```

## Comandos

No OpenCode, use o prefixo `/fase-`:

```bash
/fase-ajuda
/fase-novo-projeto
/fase-planejar-fase
/fase-executar-fase
/fase-verificar-trabalho
```

## Diferenças do Claude Code

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| Config Path | `~/.claude/` | `~/.config/opencode/` |
| Command Format | `/fase:cmd` | `/fase-cmd` |
| MCP Servers | <i class="fa fa-check-circle"></i> | <i class="fa fa-times-circle"></i> |
| Voice Mode | <i class="fa fa-check-circle"></i> | <i class="fa fa-times-circle"></i> |
| Open Source | <i class="fa fa-times-circle"></i> | <i class="fa fa-check-circle"></i> |

## Vantagens do OpenCode

- <i class="fa fa-check-circle"></i> **Open Source:** Comunidade ativa, customizável
- <i class="fa fa-check-circle"></i> **XDG Standard:** Segue convenções Linux/Unix
- <i class="fa fa-check-circle"></i> **Gratuito:** Sem limits de uso
- <i class="fa fa-check-circle"></i> **Skills:** Sistema de extensão robusto
- <i class="fa fa-check-circle"></i> **Hooks:** Automação via settings.json

## Limitações

- <i class="fa fa-times-circle"></i> Sem MCP Servers (integração externa limitada)
- <i class="fa fa-times-circle"></i> Sem Voice Mode
- <i class="fa fa-times-circle"></i> Context window menor que Claude Code

---

## Próximos Passos

- [Instalação](/FASE/docs/getting-started/installation/)
- [Quick Start](/FASE/docs/getting-started/quick-start/)
- [Visão Geral de Ambientes](/FASE/docs/environments/overview/)
