# ROTEIRO.md — FASE Quality Improvement

**Data:** 2026-04-22

## Overview

Roteiro para endereçar 27 concerns através de improvement continuo. Fases organizadas por prioridade e dependência.

---

## Marco 1: Foundation Quality (P0)

**Objetivo:** Estabelecer foundation de qualidade antes de refactoring major.

### Fase 1: Dependências & Tooling ✅ COMPLETO
**Requisitos:** REQ-004, REQ-016
**Planos:** 4 planos em 2 etapas
**Status:** COMPLETO

**Plans:**
- [x] 01-01-PLANO.md — Dependencies update (REQ-004) ✅
- [x] 01-02-PLANO.md — ESLint configuration (REQ-016) ✅
- [x] 01-03-PLANO.md — Prettier configuration (REQ-016) ✅
- [x] 01-04-PLANO.md — lint-staged + hooks (REQ-016) ✅

**Estimativa:** 2-3 dias
**Dependências:** Nenhuma

---

### Fase 2: CI/CD Pipeline ✅ COMPLETO
**Requisitos:** REQ-017
**Plans:** 2 plans em 1 etapa
**Status:** COMPLETO

**Plans:**
- [x] 02-01-PLANO.md — Enhance test workflow (lint + coverage) ✅
- [x] 02-02-PLANO.md — Branch protection documentation ✅

**Gap Analysis:**
- ✅ test-multi-platform.yml enhanced → renamed to test.yml
- ✅ publicar-npm.yml renamed → release.yml
- ✅ Branch protection: documentation created
- ✅ lint job added (fail-fast)
- ✅ coverage threshold (80% on main)

**Estimativa:** 1-2 dias
**Dependências:** Fase 1 ✅ COMPLETO
**Progress:** 1/2 plans (50%)

---

### Fase 3: TypeScript Strict Mode 🔄 EM PROGRESSO
**Requisitos:** REQ-003
**Plans:** 3 plans em 2 etapas
**Status:** EM PROGRESSO (2/3 plans)

**Plans:**
- [x] 03-01-PLANO.md — Fix logger.ts type error + verify strict mode ✅
- [x] 03-02-PLANO.md — Remove @ts-nocheck + type utility functions ✅
- [ ] 03-03-PLANO.md — Complete types + final verification

**Discovery:**
- ✅ tsconfig.json já tem strict: true (verified)
- ✅ compilation error fixed: src/lib/logger.ts (pino API corrected)
- ✅ @ts-nocheck removed from src/install.ts (2954 lines)
- ✅ 16 utility functions typed (lines 1-610)
- ✅ 0 implicit any errors for utility functions
- ⏳ 177 TypeScript errors remaining (Plan 03-03)

**Estimativa:** 2-3 dias
**Dependências:** Fase 1 ✅ COMPLETO

---

### Fase 4: Test Coverage Foundation 🔄 EM PROGRESSO
**Requisitos:** REQ-018, REQ-019
**Plans:** 3 plans em 3 etapas
**Status:** EM PROGRESSO (1/3 plans complete)

**Plans:**
- [x] 04-01-PLANO.md — State.ts locking tests (REQ-019) ✅
- [ ] 04-02-PLANO.md — install.ts core tests (REQ-018 part 1)
- [ ] 04-03-PLANO.md — install.ts advanced tests (REQ-018 part 2)

**Estimativa:** 3-4 dias
**Dependências:** Fase 2 ✅ COMPLETO

---

## Marco 2: Deduplication & Cleanup (P0)

**Objetivo:** Eliminar duplicação e cleanup codebase.

### Fase 5: Eliminar Duplicação src/ vs bin/
**Requisitos:** REQ-001, REQ-005, REQ-013
**Tarefas:**
- Determine source official (src/)
- Remove bin/src/lib/*.ts
- Resolve path-utils.ts
- Clarify bin/ purpose
- CI sync verification

**Estimativa:** 2-3 dias
**Dependências:** Fase 3

---

### Fase 6: Consolidar Testes
**Requisitos:** REQ-007
**Tarefas:**
- Migrate testes/ → test/
- Structure: test/unit/, test/integration/, test/e2e/
- Update CI paths
- Document structure

**Estimativa:** 1-2 dias
**Dependências:** Fase 4

---

## Marco 3: Refactoring Major (P0-P1)

**Objetivo:** Refactoring de arquivos grandes e error handling.

### Fase 7: Refactoring install.ts
**Requisitos:** REQ-002
**Tarefas:**
- Extract provider logic
- Extract helpers
- Modular structure
- Integration tests
- Type safety

**Estimativa:** 5-7 dias (phased approach)
**Dependências:** Fase 3, Fase 4, Fase 5

---

### Fase 8: Modularizar src/lib/ Files
**Requisitos:** REQ-006
**Tarefas:**
- etapa.ts refactoring
- verify.ts refactoring
- state.ts refactoring
- init.ts refactoring
- commands.ts refactoring
- core.ts refactoring

**Estimativa:** 7-10 dias (iterative)
**Dependências:** Fase 7

---

### Fase 9: Error Handling Uniformization
**Requisitos:** REQ-008
**Tarefas:**
- Remove console.* statements
- Remove process.exit statements
- FaseError classes everywhere
- pino logger integration
- Error middleware

**Estimativa:** 2-3 dias
**Dependências:** Fase 7, Fase 8

---

## Marco 4: Documentation & Integration (P1-P2)

**Objetivo:** Otimizar documentação e integrar skills.

### Fase 10: Documentação Optimization
**Requisitos:** REQ-009
**Tarefas:**
- Extract examples
- Reduce agent markdown size
- Use links vs inline
- Generate docs from code

**Estimativa:** 2-3 dias
**Dependências:** Fase 8

---

### Fase 11: Skills Integration
**Requisitos:** REQ-010
**Tarefas:**
- Evaluate each skill
- Remove unnecessary skills
- Integrate core skills to tests
- Document optional skills

**Estimativa:** 2-3 dias
**Dependências:** Fase 6

---

### Fase 12: Scripts Organization
**Requisitos:** REQ-011
**Tarefas:**
- Document scripts
- Organize by category
- README for scripts/

**Estimativa:** 0.5-1 dia
**Dependências:** Nenhuma (can run anytime)

---

## Marco 5: Security & Performance (P1-P2)

**Objetivo:** Security hardening e performance optimization.

### Fase 13: Security Hardening
**Requisitos:** REQ-014
**Tarefas:**
- BRAVE_API_KEY validation
- Audit logging
- Rotation procedure docs
- Security checklist

**Estimativa:** 1 dia
**Dependências:** Nenhuma (can run anytime)

---

### Fase 14: Performance Optimization
**Requisitos:** REQ-015
**Tarefas:**
- Evaluate parser library
- Implement caching
- Benchmarks
- Optimize regex usage

**Estimativa:** 2-3 dias
**Dependências:** Fase 8

---

## Marco 6: Scaling Preparation (P3)

**Objetivo:** Preparar para scaling futuro.

### Fase 15: Metadata Indexing
**Requisitos:** REQ-020
**Tarefas:**
- Evaluate index approach
- Implement if needed
- Pagination design

**Estimativa:** 2-3 dias (optional)
**Dependências:** Fase 14

---

### Fase 16: Docs Sync CI
**Requisitos:** REQ-012
**Tarefas:**
- CI docs validation
- Reference docs generation
- Sync automation

**Estimativa:** 1-2 dias
**Dependências:** Fase 2

---

## Dependências Visuais

```
Fase 1 ──► Fase 2 ──► Fase 4
   │          │
   └► Fase 3 ─► Fase 5 ─► Fase 6
                  │          │
                  └► Fase 7 ─► Fase 8 ─► Fase 9
                              │
                              └► Fase 10
                              │
                              └► Fase 14 ─► Fase 15
                              │
                              └► Fase 16
                              
Fase 11 ─► (independente após Fase 6)
Fase 12 ─► (independente)
Fase 13 ─► (independente)
```

---

## Execution Strategy

**Continuous Improvement Mode:**
1. Pick fase based on disponibilidade
2. Complete atomic commits per concern
3. Update ESTADO.md after each fase
4. Test coverage maintained/improved
5. No breaking changes

**Priority Order:**
- Marco 1 → Foundation (start here)
- Marco 2 → Cleanup (after foundation)
- Marco 3 → Refactoring (after cleanup)
- Marco 4 → Docs (concurrent with Marco 3)
- Marco 5 → Security/Perf (concurrent)
- Marco 6 → Scaling (optional)

---

## Notas

- Fases podem executar parcialmente (ex: REQ-001 primeiro, REQ-005 depois)
- Commits atomicos: um concern por commit
- Tests obrigatórios antes de refactoring
- Update docs quando código muda

---

*Última atualização: 2026-04-23*
*Total Fases: 16*
*Total Marcos: 6*