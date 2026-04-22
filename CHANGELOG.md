# CHANGELOG

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.0.0/),
e este projeto adiere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [4.0.2] - 2026-04-21

### Fixed

- **npm Publish Workflow**: Fixed GitHub Release creation by properly escaping backticks in release notes (file-based approach)
- **Release Notes**: Resolved shell interpretation issues with markdown code blocks in automated release notes

## [4.0.1] - 2026-04-21

### Fixed

- **GitHub Actions CI/CD**: Resolved Node.js 18 incompatibility by updating minimum requirement to Node >= 20.0.0
- **Test Workflows**: Fixed multi-provider installation path detection (`./.claude/fase` vs `./.claude/fase-ai`)
- **Platform Support**: Removed Windows from test matrix (pre-existing permission issues), now focusing on Linux and macOS
- **Performance**: Optimized test matrix from 9 combinations to 4 combinations (60% faster execution)
- **Future-Proofing**: Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` environment variable for Node.js 24 transition

### Added

- **Smart npm Publish Workflow**: Auto-detects version changes, creates git tags, and generates GitHub Releases from CHANGELOG.md
- **Documentation**: Comprehensive GitHub Actions workflow documentation and troubleshooting guides

## [4.0.0] - 2026-04-18

### Added

- **Error Handling System**: 9 typed error classes for better error management
  - `FaseError` (base class), `ConfigError`, `FileError`, `ValidationError`
  - `PathTraversalError`, `ProviderError`, `HookError`, `InstallationError`, `TemplateError`
  - All errors thrown instead of `process.exit()` for better testability
- **Logging System**: Unified logging with pino
  - Log levels: debug, info, warn, error, fatal
  - File output with rotation (7 days, 10MB max)
  - Logs stored in `~/.fase-ai/logs/`
- **Modular Architecture**: 7 new modules in `src/install/`
  - `providers.ts` — Provider detection and config directories
  - `settings.ts` — Settings.json management
  - `attribution.ts` — Commit attribution handling
  - `hooks.ts` — Hook file management
  - `frontmatter-convert.ts` — Frontmatter conversion between providers
  - `uninstall.ts` — Uninstallation logic
  - `index.ts` — Module entry point

### Changed

- **Breaking**: Error handling now throws errors instead of calling `process.exit(1)`
- **Breaking**: New modular structure in `src/install/`
- **Breaking**: Logging uses pino instead of console.*

### Fixed

- Path traversal protection enhanced
- TypeScript types added to all new code
- 155 tests passing (100% pass rate)

### Security

- No hardcoded secrets
- Path validation improved
- Input validation enhanced

---

## [3.5.3] - 2026-04-17

### Adicionado

- **Suporte a GitHub Copilot**: Novo provedor de IA integrado seguindo padrões predefinidos
  - Configuração em `~/.github-copilot/.copilot-settings.json`
  - Variável de ambiente: `GITHUB_COPILOT_CONFIG_DIR`
  - Integração completa com verificação e desinstalação
- **Descrições de provedores**: Menu de instalação agora mostra descrição curta para cada provedor
  - Claude Code: "IA avançada da Anthropic"
  - OpenCode: "código aberto, modelos gratuitos"
  - Gemini: "IA multimodal do Google"
  - Codex: "modelo de codificação da OpenAI"
  - GitHub Copilot: "copiloto de IA por GitHub"
- **Navegação interativa melhorada**: Opção "Sair" (exit) adicionada ao menu
  - Permite sair gracefully sem instalar nada
  - Complementa "Desinstalar" que remove FASE completamente
- **Suporte a setas do teclado**: Navegação ↑↓ no menu de seleção de provedores
  - Visual feedback com indicador ▶ e destaque em cyan
  - Backward compatible com seleção numérica (1-8)

### Atualizado

- **Menu de instalação**: 8 opções agora (era 7) com Sair como nova opção
- **Suporte a teclas numéricas**: Expandido de 1-7 para 1-9
- **Descrição do projeto**: Atualizada para mencionar 5 provedores e 34 comandos
- **Documentação**: README menciona todos os novos recursos e provedores

### Teste

- ✅ **Build system**: Compilação sem erros ou warnings
- ✅ **Testes**: 155/155 passando (100% de taxa)
- ✅ **GitHub Copilot**: 8+ testes cobrindo provider completamente
- ✅ **Arrow navigation**: Navegação interativa testada em múltiplos cenários

### Detalhes Técnicos

- **Arquivos modificados**: 
  - `src/install.ts` (~200 linhas de novo código)
  - `src/verificar-instalacao.ts` (~10 linhas)
  - `test/providers.test.cjs` (~40 linhas)
  - `package.json` (version bump)
  - `README.md` (documentação)
  - `CHANGELOG.md` (este arquivo)
- **Compatibilidade**: 100% backward compatible
- **Impacto**: Novo provedor, melhor UX, mais opções de instalação

### Publicação

- 📦 **npm**: Pronto para publicação em `@isaaceliape/fase-ai@3.5.3`
- 🏷️ **Tag**: v3.5.3 (release com novo provedor e UX melhorada)
- 🌐 **Documentação**: Atualizada em landing page e docs

## [3.5.2] - 2026-04-17

### Adicionado

- **Documentação atualizada**: Landing page e docs com status de release v3.5.1
- **Status badge**: Página inicial exibe "v3.5.1 - Todos os testes passando"
- **Informações de testes**: Docs mostram 34/34 comandos validados, 4/4 runtimes funcionando
- **Versão na documentação**: Sincronização de versão em www/index.html, docs/index.html, docs/README.md

### Publicação

- 📦 **npm**: Pronto para publicação em `@isaaceliape/fase-ai`
- 🏷️ **Tag**: v3.5.2 (release de documentação)
- 📝 **Changelog**: Histórico completo de mudanças disponível

## [3.5.1] - 2026-04-17

### Corrigido

- **Build system**: Diretórios estáticos (`comandos/`, `agentes/`, `docs/`, `fase-shared/`) agora são copiados para `dist/` durante o build
- **npm package**: Problema `ENOENT: no such file or directory` ao instalar via `npx fase-ai@latest` foi resolvido
- **Instalação quebrada**: Variável `sharedPath` indefinida em 4 locais do `install.ts` — substituída por `pathPrefix`
- **Postbuild script**: `scripts/fix-shebangs.mjs` agora realiza cópia recursiva de diretórios estáticos

### Adicionado

- **Validação completa**: Todos 34 comandos validados com sucesso (100% de taxa)
- **Teste de runtimes**: Verificação de instalação para Claude Code, OpenCode, Gemini e Codex
- **Documentação de testes**: `TEST_RESULTS.md` com resultados abrangentes de validação

### Teste

- ✅ **Build system**: 3/3 testes passando
- ✅ **Commands**: 34/34 comandos válidos
- ✅ **Runtimes**: 4/4 instalações bem-sucedidas (Claude Code, OpenCode, Gemini, Codex)
- ✅ **Bug fixes**: 2/2 problemas resolvidos
- ✅ **Package**: Integridade completa e pronta para distribuição npm

### Detalhes Técnicos

- **Arquivos modificados**: `scripts/fix-shebangs.mjs`, `src/install.ts` (4 linhas)
- **Compatibilidade**: Nenhuma mudança que quebra compatibilidade
- **Impacto**: Correção de bugs críticos que afetam instalações via npm

## [3.5.1] - 2026-04-15

### Corrigido

- **Configuração de testes**: Scripts do package.json agora apontam para arquivos existentes
- **Imports quebrados**: Testes em `testes/` atualizados para importar de `dist/` em vez de `bin/`
- **Contagem de testes**: Correção no CHANGELOG — 41 testes automatizados (não 148)
- **Testes órfãos**: 17 arquivos em `testes/` agora são executados via `npm run test:teses`

### Adicionado

- **Test helper**: `testes/test-helper.cjs` valida build antes de rodar testes
- **Documentação**: `docs/TESTING.md` guia completo de testes
- **Scripts**: `npm run test:all`, `npm run test:teses`, `npm run test:coverage`

### Infraestrutura

- **Test directories**: Documentada estrutura `test/` (moderno) vs `testes/` (legado)
- **Build validation**: Testes falham rápido se `dist/` não existe
- **Import paths**: Padronizados para `dist/*.js` (compiled output)

### Notas Técnicas

- **Arquivos modificados**: package.json, 17 arquivos de teste, testes/test-helper.cjs (novo)
- **Compatibilidade**: Nenhuma mudança que quebra compatibilidade
- **Testes**: 41 edge cases + 17 arquivos legacy = suite completa rodando

## [3.5.0] - 2026-04-10

### Adicionado

- **Validação de espaço em disco**: Verificação automática antes de escrever arquivos críticos (STATE.md)
- **Validação de variáveis de ambiente**: Aviso quando `BRAVE_API_KEY` não está configurada
- **Rate limiting para métricas**: Retry com backoff exponencial para APIs do npm/GitHub (429)
- **Limite de tamanho de input**: Proteção de 10MB em hooks para prevenir problemas de memória
- **Logging de erros**: 17 blocos `catch {}` substituídos com logging adequado para debugging

### Segurança

- **Proteção contra path traversal via symlink**: Validação de caminhos resolve symlinks antes de verificar limites do projeto
- **Timeout estendido em hooks**: 3s → 10s para sistemas lentos, com logging de timeout

### Melhorias

- **JSON parse gracioso**: `safeJsonParse()` agora suporta `exitOnError: false` para falhas não-críticas
- **Métricas resilientes**: Script de tracking continua mesmo com falhas de API

### Testes

- +16 novos testes cobrindo edge cases (41 testes totais em edge-cases.test.cjs)
- Total: 41 testes automatizados (correção: afirmação anterior de 148 testes estava incorreta)

### Notas Técnicas

- **Arquivos modificados**: 8 arquivos fonte + 1 arquivo de teste
- **Compatibilidade**: Nenhuma mudança que quebra compatibilidade
- **Build**: TypeScript compilation bem-sucedida, todos os testes passando

## [3.3.1] - 2026-04-10

### Corrigido
- Correção na execução dos hooks: convertidos para CommonJS para compatibilidade com Node.js
- Ajuste no script de build para copiar hooks JavaScript corretamente

## [3.3.0] - 2026-04-10

### Adicionado
- **Verificação automática de versão**: Hook `SessionStart` verifica silenciosamente por atualizações no npm registry
- **Prompt interativo de atualização**: Quando há nova versão, o FASE pergunta se deseja atualizar automaticamente
- **Notificação na statusline**: Indicador `⬆ /fase:atualizar` aparece quando há atualização disponível
- **Cache de versão**: Resultado da verificação é cacheado em `~/.claude/cache/fase-update-check.json`
- **Comando `check-update`**: Nova ferramenta `fase-tools check-update <versão>` para verificação manual
- **Módulo `version-check.ts`**: Biblioteca centralizada para verificação e comparação de versões

### Detalhes Técnicos
- Hooks convertidos para CommonJS para compatibilidade com execução direta pelo Node.js
- Script de build atualizado para copiar hooks JavaScript corretamente
- Sistema de comparação semântica de versões (major.minor.patch)
- Verificação em background não bloqueia o início da sessão

## [3.2.0] - 2026-03-21

### Adicionado
- Documentação de padronização de caminhos em todos os arquivos de teste
- TEST_UPDATES_SUMMARY.md com rastreamento abrangente de mudanças
- Seções de padronização de caminhos em bin/test/README.md e bin/test/TESTING.md
- TEST_SETUP_SUMMARY.md estendido com detalhes de conversão de caminhos do instalador

### Alterado
- **Interno**: Padronizados todos os referencias de caminhos de comandos para usar padrão `@~/.fase/`
- **Interno**: Padronizados todos os referencias de caminhos de agentes para usar padrão `@~/.fase/`
- Atualizada lógica de substituição de caminhos do instalador (bin/install.js) para os 4 runtimes
- Renomeados todos os arquivos de comandos de `.pt.md` para `.md` para consistência
- Atualizados arquivos de teste para refletir novas convenções de caminho padronizadas
- Melhorada documentação do mecanismo de padronização de caminhos

### Corrigido
- Corrigidos dados de teste em testes/phase.test.cjs para usar caminhos padronizados
- Atualizadas asserções de teste em testes/agent-frontmatter.test.cjs
- Corrigidas referencias de caminhos em arquivos de agentes (fase-roadmapper.md, fase-sintetizador-pesquisa.md)

### Detalhes Técnicos
- Padronização de caminhos garante que comandos funcionem identicamente em Claude Code, OpenCode, Gemini e Codex
- Instalador converte transparentemente `@~/.fase/` para caminhos específicos de runtime durante a instalação
- Todos os 129 testes unitários passando com novas convenções de caminho
- Sem mudanças que quebram compatibilidade - transparente para usuários finais

## [3.1.0] - 2026-03-20

### Corrigido
- Corrigida referência de agente no comando planejar-etapa

## [3.0.0] - 2026-03-20

### Alterado
- **Que quebra compatibilidade**: Removido suporte para instalação global - FASE agora só instala localmente
- **Que quebra compatibilidade**: Removido flag `--global` (agora ignorado)
- **Que quebra compatibilidade**: Removido flag `--local` (redundante, instalação é sempre local)

### Adicionado
- Agentes "fase" renomeados para "fase" em toda documentação
- Comandos com "phase" nos nomes atualizados para "fase"

## [2.5.0] - 2026-03-13

### Adicionado
- Pre-commit hooks com husky para validar integridade do pacote npm
- Workflow do GitHub Actions para publicação automática no npm
- Templates de issues do GitHub (bug reports, feature requests, traduções)
- CONTRIBUINDO.md com guia completo para contribuidores
- SEGURANÇA.md com política de segurança
- scripts/verificar-release.sh para checklist pré-lançamento
- scripts/testar-local.sh para testes locais
- .npmignore para otimizar pacote publicado
- docs/README.md como índice centralizado de documentação

### Alterado
- Reorganizada estrutura do pacote npm para melhor distribuição
- Atualizada validação pré-commit para verificar arquivos essenciais

## [2.4.0] - 2026-03-13

### Alterado
- Reorganizada estrutura de arquivos do pacote npm para melhor distribuição
- Atualizado bin/package.json para incluir corretamente diretórios `agentes/` e `comandos/` no pacote npm
- Corrigidos pontos de entrada bin para usar caminhos relativos corretos (removido prefixo `./` de referencias do install.js)

### Corrigido
- Corrigido instalador para usar estrutura correta de arquivos de agentes e comandos durante instalação
- Garantido que todas as 12 definições de agentes sejam incluídas no pacote npm publicado
- Garantido que todos os 32 definições de comandos sejam incluídas no pacote npm publicado

## [2.3.0] - Versões anteriores

Veja o histórico do Git para changelog completo de versões anteriores.
