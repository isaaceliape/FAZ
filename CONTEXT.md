# 🇧🇷 F.A.S.E. — Contexto do Projeto

**Framework de Automação Sem Enrolação**

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

O F.A.S.E. mantém a mesma estrutura do GSD original:

```
FASE/
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
| `fase-executor` | Executa planos com commits atômicos |
| `fase-planner` | Cria planos baseados em specs |
| `fase-verifier` | Verifica se o trabalho está correto |
| `fase-researcher` | Pesquisa contexto do projeto |
| `fase-roadmapper` | Cria roadmaps de alto nível |
| `fase-debugger` | Debuga problemas complexos |
| `fase-integration-checker` | Verifica integrações |

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

Os comandos usam o prefixo `/fase:`:

```
/fase:ajuda          # Ajuda
/fase:novo-projeto   # Inicializa projeto
/fase:planejar-fase  # Cria plano
/fase:executar-fase  # Executa plano
/fase:verificar-trabalho  # Verifica trabalho
```

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

- **Nome:** F.A.S.E. (Framework de Automação Sem Enrolação)
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
- [x] Todos os agents traduzidos (12/12)
- [x] Todos os comandos traduzidos (32/32)
- [x] Hooks traduzidos para PT-BR
- [x] Documentação técnica traduzida
- [x] **Refatoração de nome: FAZ → FASE**

### ✅ Refatoração FASE — COMPLETA
- [x] Branding atualizado (README, CONTEXT, docs)
- [x] CLI (bin/install.js) atualizado
- [x] Hooks atualizados
- [x] Diretório `commands/fase/` renomeado
- [x] Agentes renomeados para `fase-*.pt.md`
- [x] Documentação técnica atualizada

---

**"Chega de enrolação. Descreve o que quer e FASE acontecer."** 🇧🇷🚀
