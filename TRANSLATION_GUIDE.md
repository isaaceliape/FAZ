# 📘 Guia de Tradução — F.A.S.E.

Este documento define as diretrizes e o glossário para traduzir o **get-shit-done** para português brasileiro como **F.A.S.E.**

---

## 🎯 Princípios Gerais

### 1. **Traduza o Significado, Não as Palavras**

O objetivo é capturar o **espírito** e a **intenção**, não fazer tradução literal.

❌ Ruim: "Você é um executor de plano GSD"  
✅ Bom: "Você é um executor de planos do F.A.Z."

### 2. **Mantenha Termos Técnicos em Inglês**

Alguns termos são universais e traduzi-los causa mais confusão que ajuda.

### 3. **Seja Consistente**

Uma vez escolhido um termo, use-o em todo o projeto.

### 4. **Mantenha o Tom**

O original é direto, informal, sem frescura. A tradução deve ser igual.

---

## 📖 Glossário

### Termos que **NÃO** Traduzimos

| Termo | Por quê |
|-------|---------|
| `context window` | Termo técnico universal |
| `prompt` | Universal na área de IA |
| `checkpoint` | Já incorporado no PT-BR |
| `workflow` | Usado por todos os devs BR |
| `agent` / `subagent` | Termo padrão de IA |
| `skill` | Termo do Claude Code |
| `hook` | Termo técnico de programação |
| `commit` | Git universal |
| `PR` / `Pull Request` | Git universal |
| `README` | Convenção do GitHub |
| `TODO` | Convenção universal |
| `CLI` | Universal |
| `npm` / `npx` | Nomes de pacotes |
| `Claude Code` | Nome do produto |
| `Codex` | Nome do produto |
| `OpenCode` | Nome do produto |
| `Gemini CLI` | Nome do produto |

---

### Termos que **TRADUZIMOS**

| Inglês | Português | Notas |
|--------|-----------|-------|
| `Get Shit Done` | `F.A.S.E. / Fase Acontecer` | Nome do projeto |
| `executor` | `executor` | Mantém, mas explica em PT |
| `planner` | `planejador` | |
| `researcher` | `pesquisador` | |
| `verifier` | `verificador` | |
| `mapper` | `mapeador` | |
| `auditor` | `auditor` | |
| `roadmapper` | `planejador de roadmap` | |
| `synthesizer` | `sintetizador` | |
| `orchestrator` | `orquestrador` | |
| `phase` | `fase` | |
| `plan` | `plano` | |
| `task` | `tarefa` | |
| `objective` | `objetivo` | |
| `success criteria` | `critérios de sucesso` | |
| `verification` | `verificação` | |
| `execution` | `execução` | |
| `state` | `estado` | |
| `blocker` | `bloqueador` | |
| `decision` | `decisão` | |
| `deviation` | `desvio` | |
| `checkpoint` | `checkpoint` | Mantém em inglês |
| `atomic commit` | `commit atômico` | |
| `context engineering` | `context engineering` | Mantém (termo técnico) |
| `meta-prompting` | `meta-prompting` | Mantém (termo técnico) |
| `spec-driven development` | `desenvolvimento guiado por spec` | |
| `enterprise theatre` | `teatro enterprise` | Mantém "enterprise" |
| `vibe coding` | `vibe coding` | Mantém (gíria da área) |
| `solo developer` | `dev solo` | |
| `code` (verbo) | `codar` | Gíria comum entre devs BR |
| `build` | `construir` | |
| `ship` | `entregar / deploy` | |
| `rollback` | `rollback` | Mantém |
| `recovery` | `recuperação` | |
| `workspace` | `workspace` | Mantém |
| `working directory` | `diretório de trabalho` | |
| `file` | `arquivo` | |
| `directory` | `diretório / pasta` | |
| `command` | `comando` | |
| `flag` | `flag` | Mantém |
| `output` | `saída` | |
| `input` | `entrada` | |

---

## 📝 Diretrizes de Estilo

### 1. **Use "Você" em vez de "Tu"**

O original usa "you". Traduzimos como "você" (mais universal no BR).

❌ "Tu deves ler o arquivo primeiro"  
✅ "Você deve ler o arquivo primeiro"

### 2. **Imperativo Direto**

Mantenha o tom de instrução direta.

❌ "Seria bom se você lesse o STATE.md"  
✅ "Leia o STATE.md"

### 3. **Evite Formalidade Excessiva**

O GSD é anti-burocracia. A tradução também deve ser.

❌ "Solicita-se que o executor proceda com a leitura"  
✅ "O executor lê"

### 4. **Mantenha Exemplos de Código em Inglês**

Comandos, paths, e código **nunca** são traduzidos.

✅ Correto:
```bash
cat .planning/STATE.md
```

❌ Errado:
```bash
leia .planejamento/ESTADO.md
```

---

## 🔄 Estrutura de Arquivos

### Agents (`agents/`)

Cada agent mantém o nome original + versão PT:

```
agents/
├── gsd-executor.md       # Original (referência)
├── gsd-executor.pt.md    # Tradução
├── gsd-planner.md
├── gsd-planner.pt.md
└── ...
```

**Frontmatter do arquivo traduzido:**

```markdown
---
name: fase-executor
description: Executa planos do F.A.S.E. com commits atômicos, tratamento de desvios, checkpoints e gerenciamento de estado.
tools: Read, Write, Edit, Bash, Grep, Glob
color: yellow
skills:
  - fase-executor-workflow
---
```

### Comandos (`commands/`)

Mesma lógica dos agents.

### Documentação (`docs/`)

```
docs/
├── USER-GUIDE.md         # Original
├── USER-GUIDE.pt.md      # Tradução
├── COMMANDS.md
├── COMMANDS.pt.md
└── ...
```

---

## ✅ Checklist de Tradução

Antes de subir um PR, verifique:

- [ ] O arquivo segue a estrutura do original?
- [ ] Termos técnicos estão em inglês (quando apropriado)?
- [ ] Exemplos de código/comandos estão inalterados?
- [ ] O tom está consistente (direto, sem frescura)?
- [ ] Não há erros de português?
- [ ] Links para o original foram mantidos?
- [ ] Créditos ao TÂCHES estão presentes?

---

## 🤖 Traduzindo com AI

Se for usar o Claude Code pra ajudar na tradução:

1. **Use o CONTEXT.md** como referência de estilo
2. **Revise manualmente** — AI pode traduzir demais ou de menos
3. **Teste os prompts** — Rode o agent traduzido e veja se funciona
4. **Commit atômico** — Um agent por commit

---

## 📞 Dúvidas?

Abre uma issue ou entra em contato no Discord.

**Vamos fazer isso acontecer! 🇧🇷🚀**
