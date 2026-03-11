<div align="center">

# F.A.S.E.

## Framework de Automação Sem Enrolação

**🇧🇷 Tradução brasileira do [get-shit-done](https://github.com/gsd-build/get-shit-done) para Claude Code.**

Spec-driven development, context engineering e meta-prompting — agora em português brasileiro.

[![Original](https://img.shields.io/badge/Original-get--shit--done-blue?style=for-the-badge&logo=github)](https://github.com/gsd-build/get-shit-done)
[![npm version](https://img.shields.io/npm/v/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![npm downloads](https://img.shields.io/npm/dm/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
<br>

**Funciona no Mac, Windows e Linux.**

<br>

> *"Chega de enrolação. Descreve o que quer e FASE acontecer."*

<br>

</div>

---

## 🤔 O Que É Isso?

O **F.A.S.E.** é a versão em português brasileiro do **Get Shit Done (GSD)** — um sistema de meta-prompting e context engineering que faz o Claude Code funcionar de verdade.

**Traduzimos:**
- ✅ Agents (arquivos de prompt)
- ✅ Comandos
- ✅ Documentação
- ✅ Mensagens e outputs

**Mantivemos em inglês:**
- 🔧 Termos técnicos consagrados (ex: "context window", "checkpoint", "prompt")
- 💻 Comandos e código
- 📦 Nomes de pacotes npm

---

## 🚀 Instalação

Execute o instalador:

```bash
# Instalação interativa (recomendado)
npx fase-ai

# Ou instale para um runtime específico
npx fase-ai --opencode --global
```

O instalador vai te perguntar:
1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, ou todos
2. **Localização** — Global (todos os projetos) ou local (projeto atual)

### Verificar Instalação

- Claude Code / Gemini: `/fase-ajuda`
- OpenCode: `/fase-ajuda`
- Codex: `$fase-ajuda`

### Opções de Instalação

```bash
# Claude Code global
npx fase-ai --claude --global

# OpenCode global
npx fase-ai --opencode --global

# Todos os runtimes
npx fase-ai --all --global

# Projeto local
npx fase-ai --claude --local

# Ver ajuda
npx fase-ai --help
```

### Via Instalador

O instalador vai te perguntar:
1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, ou todos
2. **Localização** — Global (todos os projetos) ou local (projeto atual)

### Verificar Instalação

- Claude Code / Gemini: `/fase-ajuda`
- OpenCode: `/fase-ajuda`
- Codex: `$fase-ajuda`

### Uso do CLI

```bash
# Usar o comando fase diretamente (se instalado globalmente)
fase-tools <comando> [args]

# Exemplos:
fase-tools state json
fase-tools resolve-model planner
fase-tools find-phase 1
```

---

## 📖 Por Que "F.A.S.E."?

**F.A.S.E.** significa **Framework de Automação Sem Enrolação**.

É um trocadilho com o conceito de "fases de desenvolvimento" — porque cada entrega é uma fase concluída, sem burocracia, sem enrolação.

A filosofia é a mesma do original:
- Sem teatro enterprise (reunião que podia ser email)
- Sem burocracia desnecessária
- Sem story points, sprint ceremonies, retrospective
- Só você, sua visão, e o Claude Code construindo

---

## 📋 Comandos Disponíveis

**32 comandos em português brasileiro:**

### Core
```bash
/fase-ajuda              # Mostra ajuda
/fase-novo-projeto       # Inicia novo projeto
/fase-planejar-fase      # Planeja uma fase
/fase-executar-fase      # Executa uma fase
/fase-configuracoes      # Ajusta configurações
```

### Planning
```bash
/fase-novo-marco         # Cria novo marco/milestone
/fase-adicionar-fase     # Adiciona uma fase
/fase-inserir-fase       # Insere fase em posição específica
/fase-remover-fase       # Remove uma fase
/fase-pausar-trabalho    # Pausa o trabalho
/fase-retomar-trabalho   # Retoma o trabalho
/fase-progresso          # Mostra progresso atual
```

### Research
```bash
/fase-pesquisar-fase     # Pesquisa para uma fase
/fase-mapear-codigo      # Mapeia codebase existente
/fase-listar-premissas   # Lista premissas da fase
```

### Verification
```bash
/fase-verificar-trabalho # Verifica trabalho feito
/fase-validar-fase       # Valida uma fase
/fase-auditar-marco      # Audita um marco
```

### Debug
```bash
/fase-debug              # Debuga problemas
/fase-checar-tarefas     # Checa lista de tarefas
/fase-adicionar-tarefa   # Adiciona uma tarefa
/fase-adicionar-testes   # Adiciona testes
```

### Utility
```bash
/fase-discutir-fase      # Discute uma fase
/fase-completar-marco    # Completa um marco
/fase-planejar-lacunas   # Planeja como fechar lacunas
/fase-limpar             # Limpa arquivos temporários
/fase-saude              # Checkup de saúde do projeto
/fase-atualizar          # Atualiza o F.A.S.E.
/fase-rapido             # Modo rápido para tarefas simples
/fase-reaplicar-patches  # Reaplica patches
/fase-definir-perfil     # Define perfil de modelo
```

**Veja a lista completa:** [📚 COMANDOS.md](docs/COMANDOS.md)

---

## 🎯 Pra Quem É Isso?

- **Devs brasileiros** que querem usar o GSD em português
- **Solo devs** que não querem fingir que são uma empresa de 50 pessoas
- **Pessoas criativas** que querem construir coisas que funcionam
- **Quem cansou** de descrever algo pro Claude e receber lixo inconsistente

---

## 📚 Documentação

- [📖 Guia do Usuário](docs/USER-GUIDE.md)
- [📝 Guia de Tradução](TRANSLATION_GUIDE.md)
- [🔧 Comandos Disponíveis](docs/COMANDOS.md)
- [📊 Progresso do Projeto](PROGRESSO.md)
- [🤔 FAQ](docs/FAQ.md)

---

## 🙏 Créditos

Este projeto é uma **tradução comunitária** do trabalho original do **TÂCHES**.

- **Original:** [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
- **Licença:** MIT (mesma do original)
- **Criador do GSD:** TÂCHES

Sem o trabalho incrível deles, isso não existiria. 🙌

---

## 🤝 Como Contribuir

Quer ajudar a traduzir ou melhorar o F.A.S.E.?

1. **Fork** este repo
2. **Traduza** um agent ou documento
3. **Abra um PR** descrevendo o que mudou

**Precisa de ajuda?** Abre uma issue no GitHub.

---

## 📞 Comunidade

- **GitHub Issues:** [Reportar bugs / sugerir melhorias](https://github.com/isaaceliape/FASE/issues)

---

<div align="center">

**"Se você sabe claramente o que quer, isso VAI construir pra você. Sem BS."**

Feito com 🇧🇷 e 💙 para a comunidade brasileira de devs.

</div>
