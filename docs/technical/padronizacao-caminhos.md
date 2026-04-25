# Padronização de Caminhos de Comandos

> **Versão**: 5.1.1 ✅ | Última atualização: 2026-04-25

## Visão Geral

O FASE agora usa exclusivamente um modelo de instalação **local ao projeto**. Todos os arquivos de workflow, template, e configuração são armazenados no diretório `./.fase-ai/` na raiz do projeto, eliminando a necessidade de instalações globais na pasta home do usuário.

## Estrutura de Caminhos

### Diretório Raiz do Projeto

O FASE opera com a seguinte estrutura de diretórios no projeto:

```
.fase-ai/
├── workflows/          # Arquivos de workflow do FASE
├── templates/          # Templates de agente
├── references/         # Arquivos de referência
├── bin/
│   └── fase-tools.cjs # Ferramentas CLI do FASE
└── config/            # Arquivos de configuração
```

### Convenção de Caminhos nos Arquivos Fonte

Os arquivos de comando fonte (`comandos/*.md`) usam caminhos relativos ao projeto:

- **Workflows**: `./.fase-ai/workflows/workflow-name.md`
- **Templates**: `./.fase-ai/templates/template-name.md`
- **Referências**: `./.fase-ai/references/reference-name.md`
- **Ferramentas do runtime**: `./.fase-ai/bin/fase-tools.cjs`

Esses caminhos são usados em:
1. Blocos `<execution_context>` (para carregamento de contexto)
2. Referências inline nas seções `<process>`
3. Blocos de código bash para execução de scripts

## Detalhes de Implementação

### Como os Caminhos Funcionam

O FASE resolve todos os caminhos relativos ao diretório da raiz do projeto onde `./.fase-ai/` está localizado:

```bash
# Exemplo: Carregando um workflow
node ./.fase-ai/bin/fase-tools.cjs load-workflow workflows/planning

# Exemplo: Lendo um arquivo de template
cat ./.fase-ai/templates/agent-template.md
```

### Arquivos Distribuídos (`bin/comandos/*.md`)

O diretório `bin/` contém arquivos de comando pré-construídos distribuídos via NPM. Esses arquivos:
- Têm referências `./.fase-ai/` que funcionam quando executados do diretório do projeto
- Contêm texto completamente traduzido para português
- São auto-contidos ou referenciam arquivos em `./.fase-ai/`

## Arquivos de Workflow/Template

Os arquivos reais de workflow, template e referência residem em:

- **GSD (projeto upstream)** - fornece os arquivos de workflow principal
- **FASE** - fornece versões localizadas em português

Todos os arquivos são instalados no diretório `./.fase-ai/` da raiz do projeto.

## Uso em Desenvolvimento

Ao desenvolver localmente com arquivos de comando fonte do FASE (`comandos/*.md`), você precisa ter arquivos de workflow disponíveis em `./.fase-ai/`:

1. **Checkout do repositório inclui `.fase-ai/`** - A estrutura de diretório e arquivos são incluídos no repositório
2. **Executar em contexto do projeto** - Todos os comandos devem ser executados da raiz do projeto
3. **Referências relativas ao projeto** - Use caminhos `./.fase-ai/` relativos à raiz do projeto

## Consistência em Múltiplos Ambientes

Todos os 34 comandos do FASE seguem a mesma convenção de caminho:
- ✅ Todos os comandos usam caminhos `./.fase-ai/` relativos ao projeto
- ✅ Sem dependências em variáveis de ambiente de caminho
- ✅ Sem instalações globais na pasta home
- ✅ Funcionam consistentemente em Claude Code, OpenCode, Gemini, Codex e Qwen

Isso garante portabilidade de comando em todos os runtimes sem necessidade de ajustes específicos do ambiente.
