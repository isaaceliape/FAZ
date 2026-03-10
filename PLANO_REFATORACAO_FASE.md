# Plano de Refatoração: FASE → FASE

**Objetivo:** Renomear o projeto de FASE (Framework de Automação com Zelo) para FASE (Framework de Automação Sem Enrolação).

---

## Escopo total identificado

| Categoria | Quantidade |
|-----------|-----------|
| Agentes a renomear (`faz-*.pt.md`) | 12 arquivos |
| Diretório de comandos a renomear | `commands/fase/` → `commands/fase/` |
| Arquivos com padrão `/fase:` | 27 arquivos |
| Arquivos com "FASE" (maiúsculo) | 18 arquivos, 61 ocorrências |
| Hooks com referências `/fase:` | 2 arquivos |

---

## Parte 1 — Branding principal e documentação do projeto

**Arquivos:**
- `README.md` — nome do projeto, acrônimo, descrição
- `CONTEXT.md` — visão e arquitetura
- `TRANSLATION_GUIDE.md` — guia de tradução
- `PROGRESSO.md` — rastreamento de progresso
- `PLANO_DE_TRADUCAO.md` — plano original de tradução

**O que muda:**
- "FASE" → "FASE" em todos os títulos e referências
- "Framework de Automação com Zelo" → "Framework de Automação Sem Enrolação"
- Referências a `/fase:` → `/fase:`

---

## Parte 2 — CLI: bin/install.js

**Arquivo:** `bin/install.js`

**O que muda:**
- ASCII art: letras "FASE" → letras "FASE"
- Linha de descrição do banner: "com Zelo" → "Sem Enrolação"
- Comando de conclusão: `/fase:novo-projeto` → `/fase:novo-projeto`
- Mensagens de desinstalação que mencionam "FASE" → "FASE"
- Texto de statusline interativa: referências ao FASE → FASE

---

## Parte 3 — Hooks JavaScript

**Arquivos:**
- `hooks/gsd-context-monitor.js` — `/fase:pausar-trabalho` → `/fase:pausar-trabalho`
- `hooks/gsd-statusline.js` — `/fase:atualizar` → `/fase:atualizar`
- `hooks/gsd-check-update.js` — referências ao nome do projeto

---

## Parte 4 — Diretório e conteúdo dos comandos

**O que muda:**
- Renomear diretório: `commands/fase/` → `commands/fase/`
- Atualizar conteúdo de todos os 31 arquivos `.pt.md`:
  - `/fase:` → `/fase:` (namespace de comandos)
  - Referências ao nome "FASE" → "FASE"

---

## Parte 5 — Agentes

**O que muda:**
- Renomear 12 arquivos: `faz-*.pt.md` → `fase-*.pt.md`
- Atualizar conteúdo interno com `/fase:` → `/fase:` e "FASE" → "FASE"

---

## Parte 6 — Documentação técnica (docs/)

**Arquivos:**
- `docs/USER-GUIDE.md` — ~120+ ocorrências de `/fase:` + 9 de "FASE"
- `docs/COMANDOS.md` — ~30+ ocorrências de `/fase:` + 2 de "FASE"
- `docs/context-monitor.md` — 2 ocorrências de `/fase:` + 1 de "FASE"

---

## Parte 7 — Verificação final

- Grep por `/fase:` e `"FASE"` em todo o repositório
- Corrigir quaisquer ocorrências residuais
- Commit final de verificação

---

## Ordem de execução

```
Parte 1 → Parte 2 → Parte 3 → Parte 4 → Parte 5 → Parte 6 → Parte 7
```

Cada parte terá seu próprio commit com mensagem descritiva.
