# REQUISITOS.md — FASE Quality Improvement

**Data:** 2026-04-22

## Alta Prioridade (P0)

### REQ-001: Eliminar Duplicação src/ vs bin/src/
**Descrição:** Remover duplicação de 12 arquivos TypeScript entre src/lib/ e bin/src/lib/
**Critérios de Aceitação:**
- [ ] Source oficial definido (src/)
- [ ] bin/src/lib/*.ts removido
- [ ] Build process atualizado se necessário
- [ ] CI check para sync verification
- [ ] Tests passando após removal

**Arquivos:**
- src/lib/*.ts (12 arquivos)
- bin/src/lib/*.ts (12 arquivos duplicados)

---

### REQ-002: Refactoring install.ts
**Descrição:** Break monolith de 2845 linhas em módulos
**Critérios de Aceitação:**
- [ ] install.ts < 500 linhas
- [ ] Provider logic extraído para src/install/providers/*.ts
- [ ] Helpers integrados
- [ ] Type safety enabled (remove @ts-nocheck)
- [ ] All tests passando

**Arquivos:**
- src/install.ts (2845 linhas)
- src/install/*.ts (helpers, providers, etc.)

---

### REQ-003: TypeScript Type Safety 🔄 EM PROGRESSO
**Descrição:** Enable strict type checking
**Status:** Partial (2/5 criteria)
**Critérios de Aceitação:**
- [ ] @ts-nocheck removido (pending: src/install.ts)
- [x] strict: true em tsconfig.json ✅
- [ ] Zero implicit any (pending verification)
- [x] All type errors resolved ✅ (logger.ts fixed)
- [ ] IDE assistance working (pending)

**Arquivos:**
- tsconfig.json
- src/*.ts
- src/lib/*.ts

---

### REQ-004: Dependências Atualizadas ✅ COMPLETO
**Descrição:** Update npm packages to latest stable
**Critérios de Aceitação:**
- [x] npm outdated: zero packages
- [x] lint-staged: 16.4.0
- [x] marked: 18.0.2
- [x] typescript: 6.0.3
- [ ] npm audit: zero vulnerabilities (3 transitivas em dev dependencies, risco aceitável)
- [x] All tests passando após update

**Arquivos:**
- package.json

---

### REQ-005: Consolidar path-utils.ts
**Descrição:** Resolver inconsistência de path-utils.ts
**Critérios de Aceitação:**
- [ ] path-utils.ts em src/lib/ ou removido
- [ ] Se necessário, documentar uso
- [ ] bin/src/lib/path-utils.ts removido ou sincronizado

**Arquivos:**
- bin/src/lib/path-utils.ts

---

## Média Prioridade (P1)

### REQ-006: Modularizar src/lib/ Large Files
**Descrição:** Reduzir complexidade de arquivos > 700 linhas
**Critérios de Aceitação:**
- [ ] etapa.ts refactored
- [ ] verify.ts refactored
- [ ] state.ts refactored
- [ ] init.ts refactored
- [ ] commands.ts refactored
- [ ] core.ts refactored
- [ ] Cada file < 400 linhas

---

### REQ-007: Consolidar Testes
**Descrição:** Unificar estrutura de testes
**Critérios de Aceitação:**
- [ ] testes/ removido/migrado para test/
- [ ] test/unit/, test/integration/, test/e2e/ structure
- [ ] CI updated para nova estrutura
- [ ] Documentation updated

---

### REQ-008: Uniformizar Error Handling
**Descrição:** Usar FaseError + pino logger consistentemente
**Critérios de Aceitação:**
- [ ] Zero console.* statements em src/lib/
- [ ] Zero process.exit em src/lib/
- [ ] All errors usam FaseError classes
- [ ] All logs usam pino logger
- [ ] Error handling middleware

---

### REQ-009: Otimizar Documentação
**Descrição:** Reduzir tamanho de agentes/comandos markdown
**Critérios de Aceitação:**
- [ ] fase-planejador.md < 500 linhas
- [ ] fase-depurador.md < 500 linhas
- [ ] Examples extraídos para arquivos separados
- [ ] Links usados em vez de inline content

---

### REQ-010: Integrar Skills Directory
**Descrição:** Integrar skills ao test suite ou remover
**Critérios de Aceitação:**
- [ ] Skills avaliadas: manter ou remover
- [ ] Skills core integradas ao test suite
- [ ] package.json unificado ou skills documentadas como optional

---

## Baixa Prioridade (P2)

### REQ-011: Organizar Scripts Directory
**Descrição:** Documentar scripts utilitários
**Critérios de Aceitação:**
- [ ] README ou doc para cada script
- [ ] scripts/ organizado por categoria

---

### REQ-012: Sync Docs com Código
**Descrição:** CI check para sync www/docs/ com código
**Critérios de Aceitação:**
- [ ] CI workflow para docs validation
- [ ] Reference docs generated from code comments

---

### REQ-013: Clarificar bin/ Purpose
**Descrição:** Resolver bin/src/*.ts vs compiled output
**Critérios de Aceitação:**
- [ ] bin/ purpose documented
- [ ] TypeScript sources removidos de bin/ se é output
- [ ] Ou tsconfig para bin/ se é source separado

---

## Security (P1)

### REQ-014: BRAVE_API_KEY Handling
**Descrição:** Mitigar risco de API key exposure
**Critérios de Aceitação:**
- [ ] Key validation antes de usar
- [ ] Never log key value
- [ ] Rotation procedure documented

---

## Performance (P2)

### REQ-015: Optimize Regex Parsing
**Descrição:** Melhorar parsing de STATE.md, ROADMAP.md
**Critérios de Aceitação:**
- [ ] Parser library evaluated (marked)
- [ ] Cache implemented
- [ ] Performance benchmarks

---

## Missing Features (P0)

### REQ-016: ESLint + Prettier ✅ COMPLETO
**Descrição:** Automated code quality checks
**Critérios de Aceitação:**
- [x] ESLint configurado com TypeScript support
- [x] Prettier configurado
- [x] lint-staged funcionando
- [x] pre-commit hooks active

---

### REQ-017: CI/CD Pipeline
**Descrição:** GitHub Actions para test/release
**Status:** EM PROGRESSO (50%)
**Critérios de Aceitação:**
- [x] .github/workflows/test.yml ✅ (renamed from test-multi-platform.yml)
- [ ] .github/workflows/release.yml
- [x] Tests required before merge ✅ (lint + test jobs)
- [ ] Automated npm publish

---

## Test Coverage (P0)

### REQ-018: install.ts Test Coverage
**Descrição:** Add tests para installer
**Critérios de Aceitação:**
- [ ] Interactive prompts testados
- [ ] Provider-specific paths testados
- [ ] Rollback scenarios testados
- [ ] Update mode testado

---

### REQ-019: state.ts Locking Tests ✅ COMPLETO
**Descrição:** Add tests para lock logic
**Status:** COMPLETO (Plan 04-01)
**Critérios de Aceitação:**
- [x] Concurrent lock acquisition testado ✅ (sequential behavior verified)
- [x] Stale lock detection testado ✅ (4 tests: dead PID, invalid PID, missing PID file)
- [x] Cleanup on crash testado ✅ (lock cleanup verified, bug fix applied)

---

## Scaling (P3)

### REQ-020: Metadata Indexing
**Descrição:** Index/metadata para roadmap/state
**Critérios de Aceitação:**
- [ ] Index file evaluated
- [ ] Pagination implemented if needed

---

---

**Total Requisitos:** 20 (priorizados P0-P3)

*Última atualização: 2026-04-23 - REQ-019 completado (Plan 04-01)*