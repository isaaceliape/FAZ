# 📋 Plano de Tradução — F.A.S.E.

Este documento mapeia **toda a estrutura do GSD original** e define a ordem de tradução.

---

## 🗺️ Estrutura do Projeto Original

```
get-shit-done/
├── README.md                    # Apresentação
├── package.json                 # Config npm
├── bin/
│   └── install.js               # Script de instalação
├── agents/                      # AGENTS (12 arquivos)
│   ├── gsd-executor.md
│   ├── gsd-planner.md
│   ├── gsd-verifier.md
│   ├── gsd-debugger.md
│   ├── gsd-roadmapper.md
│   ├── gsd-project-researcher.md
│   ├── gsd-phase-researcher.md
│   ├── gsd-research-synthesizer.md
│   ├── gsd-codebase-mapper.md
│   ├── gsd-plan-checker.md
│   ├── gsd-integration-checker.md
│   └── gsd-nyquist-auditor.md
├── commands/gsd/                # COMANDOS (32 arquivos)
│   ├── help.md
│   ├── new-project.md
│   ├── new-milestone.md
│   ├── plan-phase.md
│   ├── execute-phase.md
│   ├── research-phase.md
│   ├── debug.md
│   ├── verify-work.md
│   └── ... (24 mais)
├── hooks/                       # HOOKS (3 arquivos)
│   ├── gsd-check-update.js
│   ├── gsd-statusline.js
│   └── gsd-context-monitor.js
├── docs/                        # DOCUMENTAÇÃO
│   ├── USER-GUIDE.md
│   └── context-monitor.md
├── scripts/
│   └── build-hooks.js
├── tests/                       # TESTES
├── assets/                      # ASSETS (imagens, SVGs)
└── get-shit-done/               # REFERÊNCIAS INTERNAS
    ├── workflows/
    ├── templates/
    └── references/
```

---

## 📊 Tamanho dos Arquivos

### Agents (prioridade: ALTA)

| Arquivo | Tamanho | Prioridade |
|---------|---------|------------|
| `gsd-planner.md` | 43KB | 🔴 Crítica |
| `gsd-debugger.md` | 38KB | 🔴 Crítica |
| `gsd-plan-checker.md` | 23KB | 🟡 Alta |
| `gsd-executor.md` | 19KB | 🔴 Crítica |
| `gsd-phase-researcher.md` | 18KB | 🟡 Alta |
| `gsd-verifier.md` | 19KB | 🔴 Crítica |
| `gsd-roadmapper.md` | 17KB | 🟡 Alta |
| `gsd-codebase-mapper.md` | 16KB | 🟡 Alta |
| `gsd-project-researcher.md` | 16KB | 🟡 Alta |
| `gsd-integration-checker.md` | 13KB | 🟢 Média |
| `gsd-research-synthesizer.md` | 7KB | 🟢 Média |
| `gsd-nyquist-auditor.md` | 5KB | 🟢 Baixa |

**Total agents:** ~230KB

### Commands (prioridade: ALTA)

| Categoria | Arquivos |
|-----------|----------|
| **Core** | `help.md`, `new-project.md`, `settings.md` |
| **Planning** | `new-milestone.md`, `plan-phase.md`, `add-phase.md`, `insert-phase.md`, `remove-phase.md` |
| **Execution** | `execute-phase.md`, `resume-work.md`, `pause-work.md`, `progress.md` |
| **Research** | `research-phase.md`, `map-codebase.md`, `list-phase-assumptions.md` |
| **Verification** | `verify-work.md`, `validate-phase.md`, `audit-milestone.md` |
| **Debug** | `debug.md`, `check-todos.md`, `add-todo.md`, `add-tests.md` |
| **Discussion** | `discuss-phase.md`, `complete-milestone.md`, `plan-milestone-gaps.md` |
| **Utility** | `cleanup.md`, `health.md`, `update.md`, `quick.md`, `join-discord.md` |
| **Advanced** | `reapply-patches.md`, `set-profile.md` |

**Total commands:** 32 arquivos

### Hooks (prioridade: MÉDIA)

| Arquivo | Função |
|---------|--------|
| `gsd-check-update.js` | Verifica updates do GSD |
| `gsd-statusline.js` | Status line no terminal |
| `gsd-context-monitor.js` | Monitora uso de contexto |

### Docs (prioridade: ALTA)

| Arquivo | Tamanho |
|---------|---------|
| `USER-GUIDE.md` | 22KB |
| `context-monitor.md` | 3KB |

---

## 🎯 Ordem de Tradução Sugerida

### **Fase 1: Core (MVP)** 🚀

O mínimo pra funcionar:

1. ✅ `README.md` (JÁ FEITO)
2. ✅ `TRANSLATION_GUIDE.md` (JÁ FEITO)
3. ✅ `CONTEXT.md` (JÁ FEITO)
4. 🔲 `agents/gsd-executor.md` — Quem executa os planos
5. 🔲 `agents/gsd-planner.md` — Quem cria os planos
6. 🔲 `agents/gsd-verifier.md` — Quem verifica o trabalho
7. 🔲 `commands/gsd/help.md` — Ajuda
8. 🔲 `commands/gsd/new-project.md` — Inicia projeto
9. 🔲 `commands/gsd/execute-phase.md` — Executa fase
10. 🔲 `commands/gsd/plan-phase.md` — Planeja fase
11. 🔲 `docs/USER-GUIDE.md` — Guia do usuário

**Resultado:** Já dá pra usar o básico!

---

### **Fase 2: Planning & Research** 📐

12. 🔲 `agents/gsd-roadmapper.md`
13. 🔲 `agents/gsd-project-researcher.md`
14. 🔲 `agents/gsd-phase-researcher.md`
15. 🔲 `agents/gsd-research-synthesizer.md`
16. 🔲 `agents/gsd-codebase-mapper.md`
17. 🔲 `commands/gsd/new-milestone.md`
18. 🔲 `commands/gsd/add-phase.md`
19. 🔲 `commands/gsd/research-phase.md`
20. 🔲 `commands/gsd/map-codebase.md`

---

### **Fase 3: Verification & Debug** 🔍

21. 🔲 `agents/gsd-plan-checker.md`
22. 🔲 `agents/gsd-integration-checker.md`
23. 🔲 `agents/gsd-debugger.md`
24. 🔲 `commands/gsd/verify-work.md`
25. 🔲 `commands/gsd/validate-phase.md`
26. 🔲 `commands/gsd/debug.md`
27. 🔲 `commands/gsd/check-todos.md`
28. 🔲 `commands/gsd/add-todo.md`
29. 🔲 `commands/gsd/add-tests.md`

---

### **Fase 4: Advanced & Utility** ⚙️

30. 🔲 `agents/gsd-nyquist-auditor.md`
31. 🔲 `hooks/gsd-check-update.js`
32. 🔲 `hooks/gsd-statusline.js`
33. 🔲 `hooks/gsd-context-monitor.js`
34. 🔲 `commands/gsd/discuss-phase.md`
35. 🔲 `commands/gsd/complete-milestone.md`
36. 🔲 `commands/gsd/audit-milestone.md`
37. 🔲 `commands/gsd/reapply-patches.md`
38. 🔲 `commands/gsd/set-profile.md`
39. 🔲 `commands/gsd/update.md`
40. 🔲 `commands/gsd/health.md`
41. 🔲 `commands/gsd/cleanup.md`
42. 🔲 `commands/gsd/quick.md`
43. 🔲 `commands/gsd/progress.md`
44. 🔲 `commands/gsd/pause-work.md`
45. 🔲 `commands/gsd/resume-work.md`
46. 🔲 `commands/gsd/insert-phase.md`
47. 🔲 `commands/gsd/remove-phase.md`
48. 🔲 `commands/gsd/list-phase-assumptions.md`
49. 🔲 `commands/gsd/join-discord.md`
50. 🔲 `commands/gsd/settings.md`
51. 🔲 `docs/context-monitor.md`

---

## 📝 Estrutura de Pastas do F.A.S.E.

```
FAZ/
├── README.md
├── CONTEXT.md
├── TRANSLATION_GUIDE.md
├── PLANO_DE_TRADUCAO.md       # ESTE ARQUIVO
├── agents/
│   ├── fase-executor.pt.md
│   ├── fase-planner.pt.md
│   └── ...
├── commands/
│   └── faz/
│       ├── help.pt.md
│       ├── new-project.pt.md
│       └── ...
├── hooks/
│   └── ...
├── docs/
│   ├── USER-GUIDE.pt.md
│   └── ...
├── scripts/
├── bin/
└── tests/
```

---

## 🔄 Processo de Tradução (Por Arquivo)

1. **Copiar** arquivo original do `gsd-original/`
2. **Traduzir** seguindo o `TRANSLATION_GUIDE.md`
3. **Renomear** de `gsd-*.md` → `faz-*.pt.md`
4. **Atualizar** frontmatter (name, description)
5. **Revisar** termos técnicos (manter em inglês quando apropriado)
6. **Commitar** com mensagem descritiva
7. **Testar** (se aplicável)

---

## ✅ Checklist Geral

- [ ] **Fase 1 (Core)** — 11 arquivos
- [ ] **Fase 2 (Planning & Research)** — 9 arquivos
- [ ] **Fase 3 (Verification & Debug)** — 9 arquivos
- [ ] **Fase 4 (Advanced & Utility)** — 22 arquivos

**Total:** ~51 arquivos

---

## 🚀 Próximo Passo Imediato

**Começar pela Fase 1!**

Sugestão de ordem:

1. `agents/gsd-executor.md` → `agents/fase-executor.pt.md`
2. `commands/gsd/help.md` → `commands/fase/help.pt.md`
3. `commands/gsd/new-project.md` → `commands/fase/new-project.pt.md`

**Quer que eu comece a traduzir o primeiro agent agora?** 🐙
