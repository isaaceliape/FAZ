---
title: Instalação
description: Como instalar o FASE em seu ambiente
---

# Instalação do FASE

## Instalação Interativa (Recomendado)

Execute o instalador interativo para escolher seus runtimes preferidos:

```bash
npx fase-ai
```

O instalador vai te perguntar:

1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, ou todos
2. **Localização** — Global (todos os projetos) ou local (projeto atual)

## Instalação com Flags (Não-Interativa)

### Claude Code Global

```bash
npx fase-ai --claude --global
```

### OpenCode Local

```bash
npx fase-ai --opencode --local
```

### Todos os Runtimes Global

```bash
npx fase-ai --all --global
```

## Verificar Instalação

Após a instalação, verifique se tudo funcionou:

- **Claude Code / Gemini:** `/fase-ajuda`
- **OpenCode:** `/fase-ajuda`
- **Codex:** `$fase-ajuda`

Se o comando de ajuda funcionar, FASE está pronto para usar!

## Via CLI Diretamente

Se instalado globalmente, você pode usar:

```bash
fase-tools <comando> [args]

# Exemplos:
fase-tools state json
fase-tools resolve-model planner
fase-tools find-phase 1
```

## Requisitos

- **Node.js:** >= 14.0.0
- **npm:** Versão recente
- **Runtime suportado:** Claude Code, OpenCode, Gemini, ou Codex

## Solução de Problemas

Se encontrar problemas durante a instalação, veja a seção [Solução de Problemas](/FASE/docs/advanced/troubleshooting/).
