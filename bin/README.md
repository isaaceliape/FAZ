# fase-ai

**F.A.S.E.** — Framework de Automação Sem Enrolação

Instalador do sistema de meta-prompting, context engineering e desenvolvimento spec-driven para Claude Code, OpenCode, Gemini e Codex. Tradução brasileira do [get-shit-done-cc](https://www.npmjs.com/package/get-shit-done-cc).

[![npm version](https://img.shields.io/npm/v/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![npm downloads](https://img.shields.io/npm/dm/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🚀 Instalação

Este pacote é **apenas o instalador**. Use via `npx` (não precisa instalar globalmente):

```bash
# Instalação interativa (recomendado)
npx fase-ai

# Ou instale para um runtime específico
npx fase-ai --opencode --global
```

### Pré-requisitos

- Node.js >= 14.0.0
- npm ou yarn
- Um dos runtimes: Claude Code, OpenCode, Gemini CLI, ou Codex

---

## 📦 Uso

### Comando Principal

```bash
npx fase-ai [opções]
```

### Opções

| Opção | Descrição |
|-------|-----------|
| `-g, --global` | Instalar globalmente (no diretório de configuração) |
| `-l, --local` | Instalar localmente (no diretório atual) |
| `--claude` | Instalar apenas para Claude Code |
| `--opencode` | Instalar apenas para OpenCode |
| `--gemini` | Instalar apenas para Gemini |
| `--codex` | Instalar apenas para Codex |
| `--all` | Instalar para todos os runtimes |
| `-u, --uninstall` | Desinstalar o FASE (remover todos os arquivos) |
| `-c, --config-dir <caminho>` | Especificar diretório de configuração customizado |
| `-h, --help` | Exibir ajuda |
| `--force-statusline` | Substituir configuração de statusline existente |

---

## 📖 Exemplos

### Instalação Interativa

```bash
npx fase-ai
```

O instalador vai perguntar:
1. **Qual runtime** — Claude Code, OpenCode, Gemini, Codex, ou todos
2. **Localização** — Global (todos os projetos) ou local (projeto atual)

### Instalação Não-Interativa

```bash
# Claude Code global
npx fase-ai --claude --global

# OpenCode global
npx fase-ai --opencode --global

# Gemini global
npx fase-ai --gemini --global

# Codex global
npx fase-ai --codex --global

# Todos os runtimes
npx fase-ai --all --global

# Projeto local
npx fase-ai --claude --local

# Diretório customizado
npx fase-ai --codex --global --config-dir ~/.codex-work
```

### Desinstalar

```bash
# Desinstalar de um runtime
npx fase-ai --opencode --global --uninstall

# Desinstalar de todos
npx fase-ai --all --global --uninstall
```

---

## 🔧 O Que É Instalado

O instalador configura:

### Agents (Prompts)
- `fase-planejador` — Cria planos de implementação
- `fase-executor` — Executa planos em paralelo
- `fase-verificador` — Verifica trabalho concluído
- `fase-pesquisador` — Pesquisa domínio e stack
- `fase-mapeador-codigo` — Analisa codebase existente
- `fase-roteirizador` — Gerencia roteiro e fases
- `fase-depurador` — Debug sistemático
- E mais...

### Comandos
- `/fase-novo-projeto` — Inicia novo projeto
- `/fase-planejar-fase` — Planeja uma fase
- `/fase-executar-fase` — Executa fase
- `/fase-verificar-trabalho` — Verifica trabalho
- `/fase-progresso` — Mostra progresso
- `/fase-discutir-fase` — Discute implementação
- `/fase-completar-marco` — Completa marco
- E 25+ comandos...

### Hooks
- Statusline com uso de contexto
- Check de atualizações
- Monitor de contexto

---

## 🎯 Verificar Instalação

Após instalar, verifique no seu runtime:

| Runtime | Comando de Verificação |
|---------|------------------------|
| Claude Code | `/fase-ajuda` |
| OpenCode | `/fase-ajuda` |
| Gemini | `/fase-ajuda` |
| Codex | `$fase-ajuda` |

---

## 📚 Documentação

Para documentação completa do F.A.S.E.:

- [Repositório GitHub](https://github.com/isaaceliape/FASE)
- [Guia do Usuário](https://github.com/isaaceliape/FASE/blob/main/docs/USER-GUIDE.md)
- [Comandos Disponíveis](https://github.com/isaaceliape/FASE/blob/main/docs/COMANDOS.md)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Abra uma issue ou PR no [GitHub](https://github.com/isaaceliape/FASE).

---

## 📄 Licença

MIT — veja o arquivo [LICENSE](https://github.com/isaaceliape/FASE/blob/main/LICENSE) para detalhes.

---

## 🙏 Créditos

Este projeto é uma tradução e adaptação do incrível trabalho do [get-shit-done](https://github.com/gsd-build/get-shit-done) por TÂCHES.

- **Original:** [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
- **npm original:** [get-shit-done-cc](https://www.npmjs.com/package/get-shit-done-cc)

---

<div align="center">

**"Se você sabe claramente o que quer, isso VAI construir pra você. Sem BS."**

Feito com 🇧🇷 para a comunidade brasileira de devs.

</div>
