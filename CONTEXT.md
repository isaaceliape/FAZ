# 🇧🇷 F.A.Z. — Contexto do Projeto

**Framework de Automação com Zelo**

Tradução brasileira do [get-shit-done](https://github.com/gsd-build/get-shit-done) para Claude Code.

---

## 🎯 Visão

Criar a versão em **português brasileiro** do GSD, mantendo:

- ✅ A mesma filosofia (anti-enterprise theatre, foco em resultado)
- ✅ A mesma estrutura (agents, commands, hooks, skills)
- ✅ A mesma eficácia (spec-driven development que funciona)

Adaptando:

- 🇧🇷 Linguagem natural em PT-BR
- 🇧🇷 Exemplos e referências culturais (quando fizer sentido)
- 🇧🇷 Tom direto e sem frescura (igual ao original)

---

## 🏗️ Arquitetura

O F.A.Z. mantém a mesma estrutura do GSD original:

```
FAZ/
├── agents/           # Agents de IA traduzidos
├── commands/         # Comandos slash traduzidos
├── hooks/            # Hooks de evento
├── skills/           # Skills do Claude Code
├── scripts/          # Scripts de automação
├── docs/             # Documentação
├── bin/              # Binários CLI
├── CONTEXT.md        # Este arquivo
├── README.md         # Apresentação
└── TRANSLATION_GUIDE.md  # Diretrizes de tradução
```

---

## 🤖 Agents Principais

| Agent | Função |
|-------|--------|
| `faz-executor` | Executa planos com commits atômicos |
| `faz-planner` | Cria planos baseados em specs |
| `faz-verifier` | Verifica se o trabalho está correto |
| `faz-researcher` | Pesquisa contexto do projeto |
| `faz-roadmapper` | Cria roadmaps de alto nível |
| `faz-debugger` | Debuga problemas complexos |
| `faz-integration-checker` | Verifica integrações |

---

## 📋 Princípios de Tradução

### 1. **Fidelidade ao Original**

Não reinvente a roda. O GSD já funciona. Traduza, não recrie.

### 2. **Termos Técnicos em Inglês**

`context window`, `prompt`, `checkpoint`, `workflow` ficam em inglês.

### 3. **Linguagem Natural em PT-BR**

Instruções, descrições, e explicações são em português brasileiro.

### 4. **Tom Consistente**

Direto, informal, sem burocracia. Igual ao original.

### 5. **Créditos ao Original**

Sempre mencione o [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done).

---

## 🚀 Comandos

Os comandos mantêm o prefixo original `/gsd:` para compatibilidade:

```
/gsd:help          # Ajuda
/gsd:init          # Inicializa projeto
/gsd:plan          # Cria plano
/gsd:execute       # Executa plano
/gsd:verify        # Verifica trabalho
```

**Futuro:** Podemos adicionar `/faz:` como alias.

---

## 📦 Instalação

Mesmo comando do original:

```bash
npx get-shit-done-cc@latest
```

O instalador detecta o idioma do sistema e oferece a versão em PT-BR.

---

## 🔄 Sincronização com o Original

O GSD original evolui rápido. Precisamos:

1. **Monitorar releases** do `gsd-build/get-shit-done`
2. **Traduzir mudanças** significativas
3. **Manter compatibilidade** com a versão original
4. **Testar** após cada atualização

---

## 🎨 Identidade Visual

- **Nome:** F.A.Z. (Framework de Automação com Zelo)
- **Emoji:** 🇧🇷
- **Cores:** Verde e amarelo (opcional, manter profissional)
- **Vibe:** Brasileiro, direto, sem frescura

---

## 📞 Comunidade

- **Discord Internacional:** https://discord.gg/gsd
- **GitHub:** https://github.com/isaaceliape/FAZ
- **Issues:** Reportar bugs e sugerir melhorias

---

## 🙏 Créditos

**Criador do GSD Original:** TÂCHES  
**Repo Original:** https://github.com/gsd-build/get-shit-done  
**Licença:** MIT (mesma do original)

Este projeto é uma **tradução comunitária**, não um fork oficial.

---

## 📝 Estado Atual

### ✅ Concluído
- [x] Repo criado
- [x] README.md criado
- [x] TRANSLATION_GUIDE.md criado
- [x] CONTEXT.md criado
- [x] Estrutura completa do GSD copiada
- [x] PROGRESSO.md com plano detalhado
- [x] `faz-executor.pt.md` traduzido
- [x] Commands core traduzidos:
  - [x] `help.pt.md`
  - [x] `new-project.pt.md`
  - [x] `plan-phase.pt.md`
  - [x] `execute-phase.pt.md`

### 🚧 Em Progresso (Fase 1 - Core)
- [ ] `faz-planner.pt.md` — tradução necessária (43KB)
- [ ] `faz-verifier.pt.md` — tradução necessária (19KB)

### ⏳ Pendentes
- [ ] Agents de planning (roadmapper, researchers)
- [ ] Agents de verification (plan-checker, integration-checker, debugger)
- [ ] Hooks e commands utilitários
- [ ] Documentação traduzida
- [ ] Primeiro release

---

**"Chega de enrolação. Descreve o que quer e FAZ acontecer."** 🇧🇷🚀
