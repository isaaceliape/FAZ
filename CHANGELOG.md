# CHANGELOG

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

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
