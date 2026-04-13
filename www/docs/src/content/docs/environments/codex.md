---
title: Codex
description: Features nativas e integração com Codex da Microsoft
---

# FASE no Codex

**Codex** é o AI coding assistant da Microsoft, focado em ambientes enterprise e times.

## Features Nativas Disponíveis

### 1. Multi-Agent Orchestration 🟢

**Status:** <i class="fa fa-check-circle"></i> Nativo

Codex suporta múltiplos agents trabalhando em paralelo:

#### Agent Roles
```json
{
  "agents": [
    {
      "role": "researcher",
      "skill": "fase-pesquisador-fase"
    },
    {
      "role": "planner",
      "skill": "fase-planejador"
    },
    {
      "role": "executor",
      "skill": "fase-executor"
    },
    {
      "role": "verifier",
      "skill": "fase-verificador"
    }
  ]
}
```

**Benefícios:**
- Paralelismo nativo
- Separação clara de responsabilidades
- Melhor escalabilidade

---

### 2. Skills 🟢

**Status:** <i class="fa fa-check-circle"></i> Totalmente suportado

Codex usa `<codex_skill_adapter>` para skills:

#### Skill Adapter
```xml
<codex_skill_adapter>
  <skill name="fase-terminologia">
    # FASE Terminology
    **Fase**: Uma entrega major/feature do projeto
    **Etapa**: Estágio de execução
    **Plano**: Blueprint de implementação
  </skill>
</codex_skill_adapter>
```

#### Agent Role Header
```xml
<codex_agent_role>
You are a FASE executor agent. Your role is to implement a phase...
</codex_agent_role>
```

---

### 3. VS Code Integration 🟢

**Status:** <i class="fa fa-check-circle"></i> Nativo

Codex integra nativamente com VS Code:

#### Features
- Inline code suggestions
- Chat integrado na IDE
- Terminal commands via chat
- File navigation aware

#### Comandos no VS Code
```bash
# No terminal integrado
$fase-ajuda
$fase-novo-projeto
```

---

### 4. Enterprise Features 🟢

**Status:** <i class="fa fa-check-circle"></i> Nativo

#### Segurança e Compliance
- Data residency controls
- Enterprise SSO
- Audit logging
- Private deployments

#### Microsoft Ecosystem
- Azure integration
- GitHub Enterprise
- Office 365
- Teams notifications

---

### 5. Extended Context 🟡

**Status:** <i class="fa fa-warning"></i> Variável por plano

Context window varia por plano/subscription. Verifique seu plano para detalhes.

---

## Instalação

```bash
# Instalar apenas para Codex
npx fase-ai --codex

# Instalar globalmente
npx fase-ai --codex --global

# Instalar localmente
npx fase-ai --codex --local

# Com diretório customizado
npx fase-ai --codex --config-dir /custom/path
```

## Configuração Recomendada

Arquivo: `~/.codex/settings.json`

```json
{
  "agents": {
    "enabled": true,
    "maxParallel": 4
  },
  "skills": [
    "fase-terminologia",
    "enterprise-conventions"
  ],
  "integrations": {
    "azure": true,
    "github": true,
    "teams": true
  }
}
```

## Estrutura de Diretórios

```
~/.codex/
├── settings.json
├── agents/
│   └── fase/
├── skills/
│   ├── fase-terminologia.md
│   └── enterprise-conventions.md
└── projects/
    └── [projeto-atual]/
```

## Comandos

No Codex, use o prefixo `$fase-`:

```bash
$fase-ajuda
$fase-novo-projeto
$fase-planejar-fase
$fase-executar-fase
$fase-verificar-trabalho
```

> **Nota:** Codex usa `$` ao invés de `/` para comandos customizados.

## Vantagens do Codex

- <i class="fa fa-check-circle"></i> **Multi-Agent:** Orquestração nativa
- <i class="fa fa-check-circle"></i> **VS Code:** Integração IDE profunda
- <i class="fa fa-check-circle"></i> **Enterprise:** Segurança, compliance, SSO
- <i class="fa fa-check-circle"></i> **Microsoft Stack:** Azure, GitHub, Office, Teams
- <i class="fa fa-check-circle"></i> **Skills:** Sistema adaptativo

## Limitações

- <i class="fa fa-warning"></i> Context window varia por plano
- <i class="fa fa-warning"></i> Menor flexibilidade que Claude Code
- <i class="fa fa-warning"></i> Foco em enterprise (pode ser overkill para solo devs)

---

## Comparação com Outros Ambientes

| Feature | Claude Code | OpenCode | Gemini | Codex |
|---------|-------------|----------|--------|-------|
| Multi-Agent | <i class="fa fa-warning"></i> | <i class="fa fa-times-circle"></i> | <i class="fa fa-times-circle"></i> | <i class="fa fa-check-circle"></i> |
| VS Code Native | <i class="fa fa-times-circle"></i> | <i class="fa fa-times-circle"></i> | <i class="fa fa-times-circle"></i> | <i class="fa fa-check-circle"></i> |
| Enterprise SSO | <i class="fa fa-times-circle"></i> | <i class="fa fa-times-circle"></i> | <i class="fa fa-warning"></i> | <i class="fa fa-check-circle"></i> |
| Context Window | 1M | Variável | 2M | Variável |
| Command Prefix | `/` | `/` | `/` | `$` |

---

## Próximos Passos

- [Instalação](/FASE/docs/getting-started/installation/)
- [Quick Start](/FASE/docs/getting-started/quick-start/)
- [Visão Geral de Ambientes](/FASE/docs/environments/overview/)
