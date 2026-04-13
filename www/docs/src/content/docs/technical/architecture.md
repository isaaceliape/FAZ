---
title: Arquitetura
description: Design e arquitetura do FASE
---

# Arquitetura do FASE

## Estrutura de Diretórios

```
bin/
  agentes/          # 13 definições de agentes (.md)
  comandos/         # 34 comandos invocáveis (.md)
  lib/              # Código Node.js (state.cjs, etapa.cjs, core.cjs)
  fase-shared/
    references/     # Schemas autoritativos (plano-schema.md, validacao-schema.md)
    templates/      # Templates de arquivos gerados (summary.md, contexto.md)
  install.js        # Instalador multi-provider
```

## Pipeline de Agentes

```
novo-projeto
  └── pesquisador-projeto ×4 (paralelo)
        └── sintetizador-pesquisa
              └── roadmapper → PLANO-ENTREGAS.md

planejar-fase N
  ├── [opcional] arquiteto → ARQUITETURA.md
  ├── pesquisador-fase → PESQUISA.md
  ├── planejador → PLANO.md(s)
  └── verificador-plano → loop até PASS (máx. 3×)

executar-fase N
  ├── Onda 1: executor(s) em paralelo → commits
  ├── Onda 2: executor(s) dependentes → commits
  └── verificador → VERIFICACAO.md
        └── se gaps: planejar-fase --gaps → executor → verificador
              (máx. 3 tentativas → escalação humana)
```

## Persistência de Estado

Todos os arquivos de estado ficam em `.fase-ai-local/` no projeto do usuário:

| Arquivo | Produzido por | Consumido por |
|---------|--------------|---------------|
| `PROJETO.md` | novo-projeto | todos os agentes |
| `ESTADO.md` | state.cjs | executor, verificador |
| `CONTEXTO.md` | executor (fim de sessão) | executor, planejador, depurador |
| `config.json` | novo-projeto / configuracoes | install.js, agentes |
| `fases/XX/PESQUISA.md` | pesquisador-fase | planejador |
| `fases/XX/PLANO.md` | planejador | executor |
| `fases/XX/VERIFICACAO.md` | verificador | planejar-fase --gaps |
| `fases/XX/VALIDACAO.md` | auditor-nyquist | verificador-plano |

## Locking de Estado Concorrente

`bin/lib/state.cjs` usa um lockfile exclusivo (`.fase-ai-local/.state-lock`) em torno de todas as escritas em ESTADO.md. Locks com mais de 30 segundos são tratados como stale e removidos automaticamente. Isso evita race conditions durante execução paralela de múltiplos executores.

## Schemas de Referência

- **PLANO.md** — `bin/fase-shared/references/plano-schema.md`
  Spec completa do frontmatter YAML, tipos de task XML (auto/tdd/checkpoint), formato `<verify>` e estrutura `must_haves`.

- **VALIDACAO.md** — `bin/fase-shared/references/validacao-schema.md`
  Estrutura produzida pelo auditor-nyquist: frontmatter com `requirements[]`, campos `req_id`, `test_file`, `test_command`, `status`.

## Gap Closure Loop com Escalação

O loop verificador → planejar-fase --gaps → executor → verificador tem limite de 3 iterações. O `fase-verificador` incrementa `re_verification.closure_attempts` no frontmatter do VERIFICACAO.md a cada rodada. Na 3ª tentativa com gaps restantes, o verificador adiciona uma seção `## <i class="fa fa-warning"></i> Escalação Humana Necessária` e o orchestrator de planejar-fase para de gerar novos planos.

## Providers Suportados

`bin/install.js` converte os arquivos `.md` para o formato de cada provider:

| Provider | Formato |
|---------|---------|
| Claude Code | `.claude/commands/` (`.md`) |
| OpenCode | `.opencode/commands/` (`.md`) |
| Gemini | `.gemini/commands/` (`.md`) |
| Codex | `.codex/commands/` (`.md`) |
