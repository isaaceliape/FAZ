# fase-ai

**F.A.S.E. v3.3.1** — Framework de Automação Sem Enrolação

Instalador do sistema de meta-prompting, context engineering e desenvolvimento spec-driven para Claude Code, OpenCode, Gemini e Codex. Tradução brasileira do [get-shit-done-cc](https://www.npmjs.com/package/get-shit-done-cc).

[![npm version](https://img.shields.io/npm/v/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![npm downloads](https://img.shields.io/npm/dm/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## <i class="fa fa-rocket"></i> Instalação

Este pacote é **apenas o instalador**. Use via `npx`:

```bash
# Instalação interativa (recomendado)
npx fase-ai

# Ou instale para um runtime específico
npx fase-ai --opencode
```

### Pré-requisitos

- Node.js >= 14.0.0
- npm ou yarn
- Um dos runtimes: Claude Code, OpenCode, Gemini CLI, ou Codex

---

## <i class="fa fa-box"></i> Uso

### Comando Principal

```bash
npx fase-ai [opções]
```

### Opções

| Opção | Descrição |
|-------|-----------|
| `--claude` | Instalar apenas para Claude Code |
| `--opencode` | Instalar apenas para OpenCode |
| `--gemini` | Instalar apenas para Gemini |
| `--codex` | Instalar apenas para Codex |
| `--all` | Instalar para todos os runtimes |
| `-u, --uninstall` | Desinstalar o FASE (remover todos os arquivos) |
| `-v, --verificar` | Verificar instalação e gerar relatório |
| `--atualizar` | Atualizar FASE para versão mais recente |
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
# Claude Code
npx fase-ai --claude

# OpenCode
npx fase-ai --opencode

# Gemini
npx fase-ai --gemini

# Codex
npx fase-ai --codex

# Todos os runtimes
npx fase-ai --all

# Diretório customizado
npx fase-ai --codex --config-dir ~/.codex-work
```

### Desinstalar

```bash
# Desinstalar de um runtime
npx fase-ai --opencode --uninstall

# Desinstalar de todos
npx fase-ai --all --uninstall
```

---

## <i class="fa fa-wrench"></i> O Que É Instalado

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
- **Statusline** com uso de contexto e tarefa atual
- **Check de atualizações** — verifica automaticamente no npm registry
- **Monitor de contexto** — alerta quando o contexto está acabando

---

## <i class="fa fa-arrows-rotate"></i> Verificação Automática de Versão

O FASE verifica automaticamente por atualizações:

### Como funciona

1. **Hook SessionStart**: Executa em segundo plano a cada sessão
2. **Cache local**: Salva resultado em `~/.claude/cache/fase-update-check.json`
3. **Notificação**: Mostra caixa estilizada quando há atualização disponível
4. **Prompt interativo**: Pergunta se deseja atualizar (`npx fase-ai --atualizar`)

### Verificação manual

```bash
# Via fase-tools
node ~/.claude/fase-ai/fase-tools.js check-update 3.3.0

# Ou diretamente
node ~/.claude/fase-ai/hooks/fase-check-update.js
```

## <i class="fa fa-bullseye"></i> Verificar Instalação

### Verificação Automática

Use o comando de verificação para gerar um relatório completo:

```bash
npm run verificar-instalacao
# ou
node bin/verificar-instalacao.js
```

O comando verifica:
- <i class="fa fa-check-circle"></i> Instalação do pacote global
- <i class="fa fa-check-circle"></i> Configuração de cada runtime (Claude Code, OpenCode, Gemini, Codex)
- <i class="fa fa-check-circle"></i> Comandos FASE instalados
- <i class="fa fa-check-circle"></i> Hooks e workflows
- <i class="fa fa-check-circle"></i> Sugere ações corretivas para problemas encontrados

### Verificação Manual

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
- [Guia do Usuário](https://github.com/isaaceliape/FASE/blob/main/docs/GUIA-DO-USUARIO.md)
- [Comandos Disponíveis](https://github.com/isaaceliape/FASE/blob/main/docs/COMANDOS.md)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Abra uma issue ou PR no [GitHub](https://github.com/isaaceliape/FASE).

---

## <i class="fa fa-file"></i> Licença

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
