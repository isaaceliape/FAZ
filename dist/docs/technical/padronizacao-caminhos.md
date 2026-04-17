# Padronização de Caminhos de Comandos

> **Versão**: 3.2.0 | Última atualização: 2026-03-25

## Visão Geral

Os comandos do FASE usam referências de caminho agnósticas ao ambiente que são convertidas para caminhos específicos do runtime durante a instalação. Isso permite que as mesmas definições de comando funcionem em múltiplos ambientes (Claude Code, OpenCode, Gemini, Codex).

## Convenção de Caminhos

### Arquivos Fonte (`comandos/*.md`)

Os arquivos de comando fonte usam referências de caminho universal:
- **Workflows**: `@~/.fase/workflows/workflow-name.md`
- **Templates**: `@~/.fase/templates/template-name.md`
- **Referências**: `@~/.fase/references/reference-name.md`
- **Ferramentas do runtime**: `$HOME/.fase/bin/fase-tools.cjs`

Esses caminhos são **agnósticos ao ambiente** e usados em:
1. Blocos `<execution_context>` (para carregamento de contexto do Claude Code)
2. Referências inline nas seções `<process>`
3. Blocos de código bash para execução de scripts

### Conversão de Caminhos Durante Instalação

Quando FASE é instalado via `npx fase-ai [--runtime]`, o instalador (`bin/install.js`) converte esses caminhos universais para localizações específicas do runtime:

| Runtime | Caminho Convertido |
|---------|---|
| **Claude Code** | `~/.claude/fase/` |
| **Gemini** | `~/.gemini/fase/` |
| **OpenCode** | `~/.config/opencode/fase/` |
| **Codex** | `~/.codex/fase/` |

#### Exemplos de Conversão

**Para Instalação no Gemini:**
```
Fonte:       @~/.fase/workflows/plan-phase.md
Instalado:   @~/.gemini/fase/workflows/plan-phase.md
```

**Para Instalação no OpenCode:**
```
Fonte:       $HOME/.fase/bin/fase-tools.cjs
Instalado:   $HOME/.config/opencode/fase/bin/fase-tools.cjs
```

**Para Instalação no Claude Code:**
```
Fonte:       ~/.fase/workflows/add-phase.md
Instalado:   ~/.claude/fase/workflows/add-phase.md
```

## Detalhes de Implementação

### Regras de Substituição de Caminhos do Instalador

O instalador aplica substituições de caminho em três funções:

1. **`copyFlattenedCommands`** - para OpenCode (estrutura de comando simples)
2. **`copyCommandsAsCodexSkills`** - para Codex (estrutura de skill)
3. **`copyWithPathReplacement`** - para Claude Code e Gemini

Padrões de substituição:
- `~/\.fase/` → `<pathPrefix>fase/` (por exemplo, `~/.claude/fase/`)
- `$HOME/.fase/` → `<homePrefix>fase/` (por exemplo, `$HOME/.claude/fase/`)

Para OpenCode especificamente:
- `~/.fase` → `~/.config/opencode/fase`
- `$HOME/.fase` → `$HOME/.config/opencode/fase`

### Arquivos Distribuídos (`bin/comandos/*.md`)

O diretório `bin/` contém arquivos de comando pré-construídos distribuídos via NPM. Esses arquivos:
- Têm blocos `<execution_context>` **removidos** (não necessários após instalação)
- Têm referências inline `~/.fase/` **preservadas** para o instalador substituir
- Contêm texto completamente traduzido para português
- São instalados em localizações específicas do runtime pelo instalador

## Arquivos de Workflow/Template

Os arquivos reais de workflow, template e referência são fornecidos por:
1. **GSD (projeto upstream)** - fornece os arquivos de workflow principal
2. **FASE** - fornece versões localizadas em português

Esses arquivos são instalados na localização de caminho convertido (por exemplo, `~/.claude/fase/workflows/`, `~/.gemini/fase/workflows/`).

## Uso em Desenvolvimento

Ao desenvolver localmente com arquivos de comando fonte do FASE (`comandos/*.md`), você precisa ter arquivos de workflow disponíveis em `~/.fase/` para que o Claude Code carregue via blocos `<execution_context>`. Opções:

1. **Symlink para instalação do GSD:**
   ```bash
   ln -s ~/.claude/fase ~/.fase
   ```

2. **Apontar para workflows de desenvolvimento:**
   Se estiver trabalhando em workflows do GSD localmente, ajuste o symlink para apontar para seu diretório local `workflows/` do GSD

3. **Instalar GSD primeiro:**
   Certifique-se de que o GSD está instalado em seu ambiente de runtime antes de desenvolver comandos do FASE

## Consistência em Múltiplos Ambientes

Todos os 32 comandos do FASE agora seguem a mesma convenção de caminho:
- <i class="fa fa-check-circle"></i> 13 comandos com referências de workflow usam `@~/.fase/`
- <i class="fa fa-check-circle"></i> 19 comandos sem referências externas (auto-contidos)
- <i class="fa fa-check-circle"></i> Instalador converte corretamente caminhos para cada runtime
- <i class="fa fa-check-circle"></i> OpenCode recebe caminhos corretamente formatados `~/.config/opencode/fase/`

Isso garante compatibilidade de comando em Claude Code, OpenCode, Gemini e Codex sem ramificação específica do ambiente na lógica do comando.
