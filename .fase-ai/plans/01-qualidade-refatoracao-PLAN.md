---
phase: "01"
name: "Qualidade e Refatoração do Código"
created: 2026-04-18
status: planned
priority: high
estimated_duration: 4-6 weeks
---

# Fase 01: Qualidade e Refatoração do Código

## Visão Geral

**Objetivo:** Elevar a qualidade do código FASE para nível production-ready através de refatoração, padronização e melhoria de testes.

**Grade Alvo:** A+ (9/10) — partindo do atual B+ (7.5/10)

**Duração Estimada:** 4-6 semanas

**Riscos:**
- Breaking changes em hooks existentes
- Regressão em testes durante refatoração
- Tempo estimado pode ser otimista

---

## Critérios de Sucesso

- [ ] Todos os 155 testes passando (0 failing)
- [ ] Code coverage ≥ 80%
- [ ] Zero @ts-nocheck no código
- [ ] install.ts reduzido para < 500 linhas
- [ ] 100% das funções públicas documentadas com JSDoc
- [ ] Logging unificado com biblioteca dedicada
- [ ] Zero vulnerabilidades de segurança
- [ ] Documentação completa em docs/

---

## Tarefas

### Sprint 1: Fundação (Semana 1-2)

#### 1.1 Padronizar Error Handling
**Prioridade:** Critical
**Estimativa:** 2 dias
**Arquivos:** `src/lib/*.ts`, `src/install.ts`

**Descrição:**
- Criar módulo `src/lib/errors.ts` com classes de erro tipadas
- Substituir `process.exit(1)` por `throw` para melhor testabilidade
- Padronizar mensagens de erro em português
- Adicionar contexto (caminho, operação) em todos os erros

**Critérios de Aceite:**
- [ ] Criar `FaseError` base class
- [ ] Criar subclasses: `ConfigError`, `FileError`, `ValidationError`, `PathTraversalError`
- [ ] Substituir todas as chamadas `error()` por `throw new *Error()`
- [ ] Atualizar testes para capturar erros lançados
- [ ] Adicionar testes de erro para todos os caminhos de falha

**Riscos:**
- Quebra de comportamento em hooks que esperam `process.exit()`
- Necessário atualizar todos os catch blocks

---

#### 1.2 Split install.ts em Módulos
**Prioridade:** Critical
**Estimativa:** 3 dias
**Arquivos:** `src/install.ts` → múltiplos arquivos

**Descrição:**
Extrair responsabilidades únicas para arquivos separados:

```
src/install/
├── index.ts              # Entry point, orquestração
├── providers.ts          # Provider detection & config dirs
├── hooks.ts              # Hook file generation
├── settings.ts           # Settings.json management
├── attribution.ts        # Commit attribution handling
├── frontmatter.ts        # Frontmatter conversion (Claude→OpenCode→Gemini)
├── analytics.ts          # Analytics config & prompts
├── uninstall.ts          # Uninstall logic
└── interactive.ts        # Interactive prompts & menus
```

**Critérios de Aceite:**
- [ ] Cada arquivo < 400 linhas
- [ ] exports claros e documentados
- [ ] Tests passing para cada módulo
- [ ] Remover `@ts-nocheck` do install.ts
- [ ] Manter backward compatibility com CLI flags

**Riscos:**
- Circular dependencies entre módulos
- Perda de contexto compartilhado (variáveis globais)

---

#### 1.3 Adicionar Logging Library
**Prioridade:** High
**Estimativa:** 1 dia
**Arquivos:** Todo o código

**Descrição:**
- Instalar `pino` (fast, low-overhead)
- Criar `src/lib/logger.ts` com níveis: debug, info, warn, error
- Substituir `console.log/error` por `logger.*`
- Adicionar suporte a log files em `.fase-ai/logs/`

**Critérios de Aceite:**
- [ ] Logger configurável via `.fase-ai/config.json`
- [ ] Níveis: debug, info, warn, error, fatal
- [ ] Output formatado (JSON em production, pretty em dev)
- [ ] Rotação de logs (max 7 dias, 10MB cada)
- [ ] Substituir 100% dos console.* em src/

**Riscos:**
- Overhead de performance (pino é minimal)
- Logs podem expor dados sensíveis (validar outputs)

---

### Sprint 2: Type Safety & Validação (Semana 2-3)

#### 2.1 Remover @ts-nocheck
**Prioridade:** Critical
**Estimativa:** 2 dias
**Arquivos:** `src/install.ts`, `src/hooks/*.ts`

**Descrição:**
- Remover `// @ts-nocheck` de todos os arquivos
- Fix type errors incrementalmente
- Adicionar types explícitos onde necessário

**Critérios de Aceite:**
- [ ] `tsc --noEmit` passa sem errors
- [ ] Zero `@ts-ignore` ou `@ts-nocheck`
- [ ] Types explícitos em todas as funções públicas
- [ ] Generics usados apropriadamente

**Riscos:**
- Pode revelar bugs existentes
- Tempo pode expandir se muitos type errors

---

#### 2.2 Input Validation Robusta
**Prioridade:** High
**Estimativa:** 1.5 dias
**Arquivos:** `src/lib/config.ts`, `src/lib/template.ts`

**Descrição:**
- Adicionar validação de profundidade máxima em paths (max 5 níveis)
- Validar caracteres em nomes de fase/etapa
- Sanitizar inputs de usuário antes de usar em regex/fs
- Adicionar schema validation com `zod` ou `yup`

**Critérios de Aceite:**
- [ ] `config-set` rejeita paths > 5 níveis
- [ ] Nomes de fase validados (regex: `^[a-zA-Z0-9_-]+$`)
- [ ] Schema validation em config.json
- [ ] Tests para inputs maliciosos (path traversal, XSS em templates)

**Riscos:**
- Breaking changes para usuários com configs existentes
- Validação pode ser muito restritiva

---

#### 2.3 Path Handling Consistente
**Prioridade:** Medium
**Estimativa:** 1 dia
**Arquivos:** Todo o código

**Descrição:**
- Criar `src/lib/paths.ts` com helpers padronizados
- Enforcement via ESLint rule: sempre `path.join()`, nunca string concat
- Adicionar tests para paths com espaços, unicode, caracteres especiais

**Critérios de Aceite:**
- [ ] Zero string concatenation para paths
- [ ] Todos os paths normalizados com `path.normalize()`
- [ ] Tests para Windows, Linux, macOS path behaviors
- [ ] ESLint rule `fase/no-path-concat` criada

**Riscos:**
- Hooks existentes podem quebrar em Windows
- Necessário testar em múltiplos OS

---

### Sprint 3: Test Coverage (Semana 3-4)

#### 3.1 Cobrir Módulos Não Testados
**Prioridade:** High
**Estimativa:** 3 dias
**Arquivos:** `src/lib/analytics.ts`, `src/lib/template.ts`, `src/lib/init.ts`

**Descrição:**
- Adicionar unit tests para módulos sem cobertura
- Mock external dependencies (fs, child_process)
- Testar edge cases e error paths

**Critérios de Aceite:**
- [ ] analytics.ts: 100% coverage
- [ ] template.ts: 90%+ coverage
- [ ] init.ts: 90%+ coverage
- [ ] Todos os error paths testados
- [ ] Tests rodam em < 5 segundos

**Riscos:**
- Alguns módulos podem ser difíceis de testar (acoplamento)
- Pode exigir refatoração para testability

---

#### 3.2 Adicionar Code Coverage Reporting
**Prioridity:** Medium
**Estimativa:** 0.5 dias
**Arquivos:** `package.json`, CI config

**Descrição:**
- Instalar `c8` ou `nyc` para coverage
- Configurar threshold de 80%
- Adicionar coverage badge no README
- Integrar com GitHub Actions

**Critérios de Aceite:**
- [ ] `npm run test:coverage` gera relatório HTML
- [ ] Coverage threshold configurado (80%)
- [ ] Badge no README mostrando coverage atual
- [ ] Coverage report em CI/CD

**Riscos:**
- Threshold pode ser muito alto inicialmente
- Pode exigir ajuste de configs existentes

---

#### 3.3 Integration Tests para Workflows
**Prioridade:** Medium
**Estimativa:** 2 dias
**Arquivos:** `test/integration/*.test.cjs`

**Descrição:**
- Testar fluxo completo: init → plan → execute → verify
- Testar migração de configs antigas
- Testar instalação multi-provider

**Critérios de Aceite:**
- [ ] 5+ integration tests cobrindo workflows principais
- [ ] Tests rodam em ambiente isolado (Docker ou tmp dir)
- [ ] Tests validam outputs reais, não apenas exit codes

**Riscos:**
- Integration tests são lentos
- Podem ser flaky em CI

---

### Sprint 4: Documentação (Semana 4-5)

#### 4.1 JSDoc em Funções Públicas
**Prioridade:** High
**Estimativa:** 2 dias
**Arquivos:** `src/lib/*.ts`, `src/install/*.ts`

**Descrição:**
- Adicionar JSDoc completo em todas as funções exported
- Incluir: descrição, params, returns, throws, examples
- Gerar docs HTML com `typedoc`

**Critérios de Aceite:**
- [ ] 100% das funções exported documentadas
- [ ] JSDoc inclui @param, @returns, @throws
- [ ] Exemplos de uso em cada função
- [ ] `npm run docs` gera HTML em docs/api/

**Riscos:**
- Pode ser trabalhoso para código legado
- JSDoc pode ficar desatualizado

---

#### 4.2 Architecture Decision Records (ADRs)
**Prioridade:** Low
**Estimativa:** 1 dia
**Arquivos:** `docs/adr/`

**Descrição:**
- Criar ADRs para decisões arquiteturais importantes
- Template: contexto, decisão, consequências, status

**ADRs a Criar:**
- [ ] ADR-001: Estrutura de módulos e separação de responsabilidades
- [ ] ADR-002: Escolha de pino para logging
- [ ] ADR-003: Strategy de error handling (throw vs exit)
- [ ] ADR-004: Schema validation com zod
- [ ] ADR-005: Path handling cross-platform

**Critérios de Aceite:**
- [ ] 5 ADRs criados em `docs/adr/`
- [ ] Formato markdown consistente
- [ ] Links no README.md

**Riscos:**
- Pode ser visto como burocracia
- Requer disciplina para manter atualizado

---

#### 4.3 README e Docs de Migração
**Prioridade:** Medium
**Estimativa:** 1 dia
**Arquivos:** `README.md`, `docs/migration/`

**Descrição:**
- Atualizar README com nova estrutura
- Criar guia de migração para v4.0
- Documentar breaking changes

**Critérios de Aceite:**
- [ ] README reflete nova estrutura de módulos
- [ ] Migration guide para v3.x → v4.0
- [ ] Changelog atualizado
- [ ] Version bump para 4.0.0 (semver major)

**Riscos:**
- Breaking changes podem frustrar usuários existentes
- Necessário comunicar com antecedência

---

### Sprint 5: Polimento & Release (Semana 5-6)

#### 5.1 Performance Benchmarks
**Prioridade:** Low
**Estimativa:** 1 dia
**Arquivos:** `benchmarks/`

**Descrição:**
- Adicionar benchmarks para operações críticas
- Medir: config load, template render, file write
- Estabelecer baseline e monitorar regressões

**Critérios de Aceite:**
- [ ] Benchmarks rodam com `npm run bench`
- [ ] Baseline documentada em docs/performance.md
- [ ] CI falha se regressão > 20%

**Riscos:**
- Benchmarks podem ser flaky
- Overhead de manutenção

---

#### 5.2 Security Audit Final
**Prioridade:** Critical
**Estimativa:** 0.5 dias
**Arquivos:** Todo o código

**Descrição:**
- Rodar `npm audit` e fixar vulnerabilidades
- Revisar path traversal protections
- Validar que nenhum secret está hardcoded
- Rodar SAST tool (semgrep ou sonarqube)

**Critérios de Aceite:**
- [ ] Zero vulnerabilidades críticas/high
- [ ] SAST scan passa
- [ ] Security policy em SECURITY.md
- [ ] Processo de reporte de vulnerabilidades documentado

**Riscos:**
- Vulnerabilidades em dependencies podem exigir upgrades breaking

---

#### 5.3 Release v4.0.0
**Prioridade:** Critical
**Estimativa:** 0.5 dias
**Arquivos:** package.json, CHANGELOG.md

**Descrição:**
- Bump version para 4.0.0
- Atualizar CHANGELOG com breaking changes
- Tag e release no GitHub
- Publicar no npm

**Critérios de Aceite:**
- [ ] Version 4.0.0 no package.json
- [ ] CHANGELOG.md atualizado
- [ ] Git tag v4.0.0
- [ ] Publicado no npm
- [ ] Release notes no GitHub

**Riscos:**
- Usuários podem não ler migration guide
- Issues podem surgir pós-release

---

## Dependências entre Tarefas

```
1.1 Error Handling ──────────┬─────────→ 2.1 Remove @ts-nocheck
                             │
1.2 Split install.ts ────────┼─────────→ 2.1 Remove @ts-nocheck
                             │
1.3 Logging Library ─────────┴─────────→ 3.1 Test Coverage
                                        │
2.2 Input Validation ──────────────────→│
                                        │
2.3 Path Handling ─────────────────────→│
                                        ↓
                              4.1 JSDoc Documentation
                                        │
                                        ↓
                              5.2 Security Audit → 5.3 Release v4.0.0
```

---

## Métricas de Progresso

| Sprint | Tarefas | Status | Notes |
|--------|---------|--------|-------|
| Sprint 1 | 1.1, 1.2, 1.3 | ⬜ Pending | Fundação |
| Sprint 2 | 2.1, 2.2, 2.3 | ⬜ Pending | Type safety |
| Sprint 3 | 3.1, 3.2, 3.3 | ⬜ Pending | Test coverage |
| Sprint 4 | 4.1, 4.2, 4.3 | ⬜ Pending | Documentation |
| Sprint 5 | 5.1, 5.2, 5.3 | ⬜ Pending | Release |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Breaking changes em hooks | Alta | Alto | Version bump major, migration guide |
| Regressão em testes | Média | Alto | Rodar tests após cada tarefa |
| Tempo estimado otimista | Alta | Médio | Buffer de 20% em cada sprint |
| Dependencies com vulnerabilidades | Média | Alto | Audit semanal, dependabot |
| Complexidade de refatoração | Alta | Médio | Refatorar incrementalmente, não big-bang |

---

## Checklist de Definição de Pronto (DoD)

Para cada tarefa ser considerada completa:

- [ ] Código implementado
- [ ] Tests passing (incluindo novos tests)
- [ ] Code review feito
- [ ] JSDoc adicionado
- [ ] CHANGELOG atualizado (se aplicável)
- [ ] Docs atualizadas (se aplicável)
- [ ] Zero new TypeScript errors
- [ ] Zero new ESLint errors

---

## Recursos Necessários

- **Tempo:** 4-6 semanas (20-30 dias úteis)
- **Pessoas:** 1-2 desenvolvedores
- **Ferramentas:** pino, zod, c8/nyc, typedoc, semgrep
- **Ambiente:** Linux, macOS, Windows (testar cross-platform)

---

## Próximos Passos

1. **Imediato:** Criar issues no GitHub para cada tarefa
2. **Sprint 1:** Começar por 1.1 (Error Handling) — menor risco, maior impacto
3. **Semanal:** Review de progresso e ajuste de estimativas
4. **Contínuo:** Manter tests passing em cada commit

---

## Notas

- Este plano assume desenvolvimento full-time
- Ajustar estimativas se desenvolvimento for part-time
- Priorizar tarefas críticas se tempo for limitado
- Manter backward compatibility sempre que possível
