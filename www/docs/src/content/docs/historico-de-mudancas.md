---
title: Histórico de Mudanças
description: Registro completo de todas as versões e mudanças do FASE
---

# Histórico de Mudanças

Todas as mudanças notáveis do FASE são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) e o projeto segue [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

---

## [3.3.0] - 2026-04-09

### Adicionado
- **Novo agente `fase-arquiteto`**: registra decisões arquiteturais em formato ADR, define contratos de API, limites de módulo e modelo de dados
- **Novo comando `/fase-arquitetar`**: invoca o fase-arquiteto para qualquer tema arquitetural
- **Novo comando `/fase-contexto`**: exibe, limpa ou resume o contexto persistente da sessão (`.fase-ai-local/CONTEXTO.md`)
- **Schemas autoritativos**: `bin/fase-shared/references/plano-schema.md` e `validacao-schema.md` documentam PLANO.md e VALIDACAO.md em detalhe
- **Contexto de sessão persistente**: executores, planejadores e depuradores agora lêem e escrevem `.fase-ai-local/CONTEXTO.md` para continuidade entre sessões
- **Context probes**: agentes de planejamento, execução e debug agora fazem perguntas de orientação no início de cada sessão

### Corrigido
- **Locking de estado concorrente**: `bin/lib/state.cjs` usa lockfile exclusivo (`.state-lock`) em torno de todas as escritas em ESTADO.md, eliminando race conditions durante execução paralela
- **Validação de schema no executor**: `fase-executor` valida o PLANO.md na carga — detecta campos obrigatórios ausentes e corrige parsing de `<verify>`/`<automated>` antes de executar qualquer tarefa
- **Loop de gap closure com limite**: `fase-verificador` rastreia `closure_attempts` em VERIFICACAO.md; após 3 tentativas sem fechar gaps, emite `## <i class="fa fa-warning"></i> Escalação Humana Necessária` e para de gerar novos planos
- **Sintetizador com pré-voo**: `fase-sintetizador-pesquisa` aborta com `PESQUISA INCOMPLETA` se qualquer um dos 4 arquivos de pesquisa estiver faltando, em vez de produzir output silenciosamente incompleto
- **Verificação de plano não-bloqueante**: VALIDACAO.md ausente agora gera WARNING (não BLOCKING FAIL) — checks Nyquist são ignorados e o plano pode passar nas outras 7 dimensões
- **Propagação de decisões locked**: `fase-pesquisador-fase` valida que todas as decisões do CONTEXTO.md foram copiadas para PESQUISA.md; `fase-planejador` valida que cada decisão locked aparece em pelo menos um `<action>`
- **MCP degradação graciosa**: `fase-pesquisador-fase` e `fase-pesquisador-projeto` usam Context7 como opcional com fallback para WebSearch

### Alterado
- Diretórios raiz `agentes/` e `comandos/` removidos — `bin/agentes/` e `bin/comandos/` são agora a única fonte da verdade
- Script `sync-agentes` removido do package.json
- Documentação atualizada: COMANDOS.md (32→34), GUIA-DO-USUARIO.md, referências Astro e arquitectura

### Detalhes Técnicos
- 13 agentes (era 12) — adicionado `fase-arquiteto`
- 34 comandos (era 32) — adicionados `/fase-arquitetar` e `/fase-contexto`
- Todos os 132 testes passando

---

## [3.2.0] - 2026-03-21

### Adicionado
- Documentação de padronização de paths em todos os arquivos de teste
- `TEST_UPDATES_SUMMARY.md` com rastreamento completo de mudanças
- Seções de padronização de paths em `bin/test/README.md` e `bin/test/TESTING.md`
- `TEST_SETUP_SUMMARY.md` estendido com detalhes de conversão de paths do instalador

### Alterado
- **Interno**: Padronizados todos os paths de comandos para usar o padrão `@~/.fase/`
- **Interno**: Padronizados todos os paths de agentes para usar o padrão `@~/.fase/`
- Atualizada lógica de substituição de paths do instalador (`bin/install.js`) para todos os 4 runtimes
- Renomeados todos os arquivos de comandos de `.pt.md` para `.md` para consistência
- Arquivos de teste atualizados para refletir novas convenções de paths padronizados
- Documentação aprimorada do mecanismo de padronização de paths

### Corrigido
- Corrigidos dados de teste em `testes/phase.test.cjs` para usar paths padronizados
- Atualizadas asserções de teste em `testes/agent-frontmatter.test.cjs`
- Corrigidas referências de path em arquivos de agentes (`fase-roadmapper.md`, `fase-sintetizador-pesquisa.md`)

### Detalhes Técnicos
- Padronização de paths garante que comandos funcionem identicamente no Claude Code, OpenCode, Gemini e Codex
- O instalador converte transparentemente `@~/.fase/` para paths específicos de cada runtime durante a instalação
- Todos os 129 testes unitários passando com as novas convenções de paths
- Sem breaking changes — transparente para usuários finais

---

## [3.1.0] - 2026-03-20

### Corrigido
- Corrigida referência de agente no comando `planejar-fase`

---

## [3.0.0] - 2026-03-20

:::caution[Breaking Changes]
Esta versão remove o suporte a instalação global. O FASE agora instala apenas localmente no projeto.
:::

### Alterado
- **Breaking**: Removido suporte a instalação global — FASE agora instala apenas localmente
- **Breaking**: Flag `--global` removida (ignorada se fornecida)
- **Breaking**: Flag `--local` removida (redundante, instalação sempre foi local)

### Adicionado
- Agentes renomeados para refletir nomenclatura "fase" em toda a documentação
- Comandos com "phase" no nome atualizados para "fase"

---

## [2.5.0] - 2026-03-13

### Adicionado
- Pre-commit hooks com Husky para validar integridade do pacote npm
- GitHub Actions workflow para publicação automática no npm
- Templates de issues do GitHub (bug reports, feature requests, traduções)
- `CONTRIBUTING.md` com guia completo para contribuidores
- `SECURITY.md` com política de segurança
- `scripts/verificar-release.sh` para checklist pré-release
- `scripts/testar-local.sh` para testes locais
- `.npmignore` para otimizar pacote publicado
- `docs/README.md` como índice centralizado de documentação

### Alterado
- Reorganizada estrutura do pacote npm para melhor distribuição
- Atualizada validação de pre-commit para verificar arquivos essenciais

---

## [2.4.0] - 2026-03-13

### Alterado
- Reorganizada estrutura de arquivos do pacote npm para melhor distribuição
- Atualizado `bin/package.json` para incluir corretamente os diretórios `agentes/` e `comandos/`
- Corrigidos entry points do bin para usar caminhos relativos corretos

### Corrigido
- Corrigido instalador para usar estrutura de arquivos correta para agentes e comandos
- Garantido que todas as 12 definições de agentes estão incluídas no pacote npm publicado
- Garantido que todos os 32 comandos estão incluídos no pacote npm publicado

---

## [2.3.0] e anteriores

Consulte o [histórico do Git](https://github.com/isaaceliape/FASE/commits/main) para o changelog completo de versões anteriores.

---

## Convenções

| Símbolo | Significado |
|---------|-------------|
| **Breaking** | Mudança incompatível com versões anteriores |
| **Adicionado** | Nova funcionalidade |
| **Alterado** | Mudança em funcionalidade existente |
| **Descontinuado** | Funcionalidade que será removida em breve |
| **Removido** | Funcionalidade removida |
| **Corrigido** | Correção de bug |
| **Segurança** | Correção de vulnerabilidade |
