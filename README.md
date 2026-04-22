<div align="center">

# FASE. v4.0.2

## Framework de Automação Sem Enrolação

**🇧🇷 Tradução brasileira do [get-shit-done](https://github.com/gsd-build/get-shit-done) para Claude Code, OpenCode, Gemini, Codex e Qwen Code.**

Spec-driven development, context engineering e meta-prompting — agora em português brasileiro.

[![Original](https://img.shields.io/badge/Original-get--shit--done-blue?style=for-the-badge&logo=github)](https://github.com/gsd-build/get-shit-done)
[![npm version](https://img.shields.io/npm/v/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![npm downloads](https://img.shields.io/npm/dm/fase-ai?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/fase-ai)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
<br>

**Funciona no Mac e Linux. Node.js 20+**

<br>

> *"Chega de enrolação. Descreve o que quer e FASE acontecer."*

**[🌐 Visite a Landing Page](https://isaaceliape.github.io/FASE/)** — Conheça o projeto de forma visual

**[📖 Documentação Completa](https://isaaceliape.github.io/FASE/docs/)** — Guias, referência e exemplos

<br>

</div>

---

## 🤔 O Que É Isso?

O **FASE.** é a versão em português brasileiro do **Get Shit Done (GSD)** — um sistema de meta-prompting e context engineering que faz os assistentes de IA (Claude Code, OpenCode, Gemini, Codex, Qwen Code) funcionarem de verdade em projetos de software.

Ele traz:
- 🎯 **Spec-driven development** — descreva o que quer, o AI constrói
- 🧠 **Context engineering avançado** — organize prompts para máximo proveito
- 🔄 **Meta-prompting** — direcione o AI com precisão
- 📊 **Workflow estruturado** — 13 agentes especializados
- 💬 **34 comandos** em português brasileiro para um fluxo contínuo

**Traduzimos:**
- ✅ 13 agentes de prompt (pesquisadores, verificadores, planejadores, executores)
- ✅ 34 comandos interativos
- ✅ Documentação completa
- ✅ Mensagens e outputs

**Mantivemos em inglês:**
- 🔧 Termos técnicos consolidados (ex: "context window", "checkpoint", "hooks")
- 💻 Comandos de terminal e código-fonte
- 📦 Nomes de pacotes npm e APIs

**Suportados agora:**
- 🤖 6 provedores de IA: Claude Code, OpenCode, Gemini, Codex, GitHub Copilot, Qwen Code
- ⌨️ Navegação interativa com setas (↑↓) no menu
- 🚪 Opção de saída graceful do instalador

---

## 🚀 Instalação Rápida

### Instalação Interativa (Recomendado)

```bash
npx fase-ai
```

O instalador perguntará:
1. **Runtime** — qual assistente você quer usar (Claude Code, OpenCode, Gemini, Codex, Qwen Code, ou todos)
2. **Escopo** — local (apenas projeto atual)

### Instalação Direta por Runtime

```bash
# Claude Code
npx fase-ai --claude

# OpenCode
npx fase-ai --opencode

# Gemini
npx fase-ai --gemini

# Codex
npx fase-ai --codex

# Qwen Code
npx fase-ai --qwen

# Todos os runtimes
npx fase-ai --all
```

### Instalação via Dev Dependency (Recomendado para Times)

Para projetos em equipe, instale FASE como dev dependency para garantir **versão consistente** entre todos os desenvolvedores:

```bash
# Instalar como dev dependency
npm install --save-dev fase-ai@4.0.0

# Ou com yarn
yarn add --dev fase-ai@4.0.0

# Ou com pnpm
pnpm add --save-dev fase-ai@4.0.0
```

O FASE será instalado automaticamente via `postinstall` após o `npm install`. Para configurar quais runtimes instalar, crie `.fase-ai/config.json`:

```json
{
  "runtimes": ["claude", "opencode"],
  "auto_install": true
}
```

**Benefícios:**
- ✅ **Versão fixa** no `package.json` — todo time usa a mesma versão
- ✅ **Funciona offline** após instalação inicial
- ✅ **CI/CD friendly** — instalação automática no pipeline
- ✅ **Sem conflitos** — cada projeto pode usar versão diferente

### Verificar Instalação

Após instalar, teste o comando de ajuda:

```bash
# Claude Code / OpenCode / Gemini / Qwen Code
/fase-ajuda

# Codex
$fase-ajuda
```

Se vir a mensagem de boas-vindas, FASE foi instalado com sucesso! ✅

### Desinstalação

```bash
# Remove FASE do seu sistema
npx fase-ai --uninstall
```

### Atualizar FASE

```bash
# Dentro do Claude Code / assistente
/fase-atualizar
```

Ou via npx (sempre usa a versão mais recente):

```bash
npx fase-ai@latest
```

### Verificação Automática de Versão

O FASE verifica automaticamente por atualizações em cada sessão:

- **Hook em background**: Um hook `SessionStart` verifica silenciosamente se há novas versões no npm
- **Notificação**: Quando há atualização disponível, você verá uma mensagem ao iniciar
- **Prompt interativo**: O FASE pergunta se deseja atualizar automaticamente
- **Statusline**: A versão disponível também aparece na statusline (`⬆ /fase:atualizar`)

Para verificar manualmente:
```bash
node ~/.claude/fase-ai/hooks/fase-check-update.js
```

---

## 📚 Exemplos de Uso

Quer ver FASE em ação? Temos **3 exemplos reais** mostrando diferentes níveis de complexidade:

### 🟢 Beginner: [CLI Pomodoro Timer](./examples/01-cli-pomodoro/)
Construir uma ferramenta de linha de comando simples com FASE.

### 🟡 Intermediate: [Refatoração de Código Legacy](./examples/02-refactor-legacy/)
Refatorar um script grande em partes menores e testáveis.

### 🔴 Advanced: [JWT Authentication Feature](./examples/03-full-feature/)
Implementar uma feature completa com testes, documentação e múltiplas dependências.

👉 **[Explorar todos os exemplos →](./examples/)**

---

## 🎬 In Action

Watch FASE in action. Below are terminal recordings showing real workflows:

### Installation & Setup

```bash
# Record your installation session
asciinema rec assets/demo-install.cast

# Then embed in README as:
# <asciinema-player src="assets/demo-install.cast"></asciinema-player>
```

### Complete Workflow: From Idea to Deployment

```bash
# Record a workflow session with these steps:
# 1. /fase-novo-projeto
# 2. /fase-planejar-etapa 1
# 3. /fase-executar-etapa 1
# 4. /fase-validar-etapa 1

asciinema rec assets/demo-workflow.cast
```

**Tools to record your own demos:**

- **[asciinema](https://asciinema.org/)** — Interactive recordings, embeddable, shareable
  ```bash
  npm install -g asciinema
  asciinema rec my-recording.cast
  asciinema upload my-recording.cast
  ```

- **[termtosvg](https://github.com/nbedos/termtosvg)** — Generates SVG animations
  ```bash
  pip install termtosvg
  termtosvg record my-recording.svg
  ```

---

## ✨ Novidades em v3.3.0

### 🔔 Verificação Automática de Versão
O FASE agora verifica automaticamente por atualizações:
- **Hook SessionStart**: Verifica silenciosamente no npm registry
- **Notificação visível**: Caixa estilizada mostra versão atual e disponível
- **Prompt interativo**: Pergunta se deseja atualizar automaticamente
- **Statusline integrada**: Mostra `⬆ /fase:atualizar` quando há atualização

### 🎯 Path Standardization
Todos os comandos e agentes agora usam um padrão universal `@~/.fase/` que é convertido automaticamente para caminhos específicos de cada runtime durante a instalação:

- **Claude Code**: `~/.claude/fase/`
- **OpenCode**: `~/.config/opencode/fase/`
- **Gemini**: `~/.gemini/fase/`
- **Codex**: `~/.codex/fase/`

Isso garante que FASE funciona identicamente em todos os 4 runtimes, sem duplicação de código.
### 📈 Melhorias de Testes

- ✅ 41 testes de edge cases (test/edge-cases.test.cjs)
- ✅ 17 arquivos de testes legacy (testes/)
- ✅ Testes para path standardization em todos os runtimes
- ✅ Validação de segurança (path traversal, race conditions, timeout)
- ✅ Documentação expandida de testes (docs/TESTING.md)

### 📚 Documentação Melhorada
- ✅ Novos documentos explicando path standardization
- ✅ Documentação expandida em test/ com rastreamento detalhado
- ✅ Seções expandidas em guias de testes

---

## 🏗️ Arquitetura

FASE é organizado em **4 camadas principais**:

### 1. **Agentes (12 especializados)**
Cada agente tem um propósito específico no ciclo de desenvolvimento:

- **Planejadores**: `fase-planejador`, `fase-roadmapper`
- **Pesquisadores**: `fase-pesquisador-fase`, `fase-pesquisador-projeto`, `fase-sintetizador-pesquisa`
- **Executores**: `fase-executor`, `fase-mapeador-codigo`
- **Verificadores**: `fase-verificador`, `fase-verificador-plano`, `fase-verificador-integracao`
- **Especialistas**: `fase-depurador`, `fase-auditor-nyquist`

### 2. **Comandos (32 operacionais)**
Organize em categorias por função (planning, research, execution, verification, debug, utility)

### 3. **Sistema de Hooks**
Context monitoring para gerenciar estado e histórico automaticamente via integração nativa (settings.json)

### 4. **Instalador Universal**
Suporta múltiplos runtimes (Claude Code, OpenCode, Gemini, Codex, Qwen Code) com detecção automática

## 📖 Por Que "FASE."?

**FASE.** = **Framework de Automação Sem Enrolação**

É um trocadilho com "fases de desenvolvimento" porque cada entrega é uma fase concluída, sem burocracia.

A filosofia:
- 🚫 Sem teatro enterprise (reunião que podia ser email)
- 🚫 Sem burocracia desnecessária
- 🚫 Sem story points, sprint ceremonies, retrospectives
- ✅ Só você, sua visão, e o assistente de IA construindo

---

## 📋 Comandos Disponíveis

FASE oferece **34 comandos em português brasileiro**, organizados por função:

### 🎯 Core / Inicialização
```bash
/fase-ajuda              # Mostra ajuda completa
/fase-novo-projeto       # Inicializa novo projeto com FASE
/fase-configuracoes      # Abre painel de configurações
```

### 📐 Planning & Roadmapping
```bash
/fase-novo-marco         # Cria novo milestone
/fase-planejar-etapa      # Detalha planejamento de uma fase
/fase-adicionar-etapa     # Adiciona fase ao roadmap
/fase-inserir-etapa       # Insere fase em posição específica
/fase-remover-etapa       # Remove fase do plano
/fase-progresso          # Mostra status de conclusão
/fase-roadmapper         # Cria roadmap visual (via agente)
```

### 🔍 Research & Analysis
```bash
/fase-pesquisar-etapa     # Pesquisa contexto para uma fase
/fase-mapear-codigo      # Mapeia codebase existente
/fase-listar-premissas   # Lista assunções da fase
/fase-planejar-lacunas   # Identifica gaps no plano
```

### ✅ Verification & Validation
```bash
/fase-verificar-trabalho # Valida código executado
/fase-validar-etapa       # Verifica completude de fase
/fase-auditar-marco      # Audita um milestone
/fase-checar-tarefas     # Revisa task list
```

### 🔧 Execution & Development
```bash
/fase-executar-etapa      # Executa uma fase completa
/fase-rapido             # Modo fast-track para tarefas simples
/fase-adicionar-testes   # Gera testes para código
/fase-adicionar-tarefa   # Adiciona task ao histórico
```

### 🐛 Debug & Troubleshooting
```bash
/fase-debug              # Diagnostica problemas
/fase-depurador          # Invoca agente debugger (via agente)
/fase-discutir-etapa      # Abre discussão estruturada
```

### 🛠️ Maintenance & Administration
```bash
/fase-pausar-trabalho    # Pausa execução
/fase-retomar-trabalho   # Continua de onde parou
/fase-completar-marco    # Marca milestone como concluído
/fase-reaplicar-patches  # Reaplica correções versionadas
/fase-definir-perfil     # Configura perfil de modelo/agente
/fase-limpar             # Remove arquivos temporários
/fase-saude              # Checkup de saúde do projeto
/fase-atualizar          # Atualiza FASE para versão latest
/fase-verificar-instalacao  # Verifica instalação e sugere correções
```

**→ Documentação completa:** [📚 COMANDOS.md](docs/COMANDOS.md)

---

## 🎯 Pra Quem É Isso?

### Perfil Ideal
- **Solo devs** que não querem fingir que são uma empresa de 50 pessoas
- **Devs brasileiros** que preferem trabalhar em português
- **Pessoas criativas** que querem construir coisas que *funcionam*
- **Quem cansou** de descrever algo e receber respostas inconsistentes do AI

### Casos de Uso
✅ Projetos pessoais com requisitos bem definidos
✅ MVPs que precisam ir para produção rápido
✅ Refatorações estruturadas de legacies
✅ Automation scripts e ferramentas internas
✅ Prototipagem rápida de ideias
✅ Aprendizado de novas tecnologias/linguagens

### O Que FASE Não É
❌ Substituto para design de sistema em time
❌ Solução para requisitos vagos ou mal definidos
❌ Ferramenta para escrever documentação de produto
❌ Gerenciador de sprint/kanban (use Jira/Linear para isso)

---

## 📚 Documentação Completa

### Guias Essenciais
- [📖 Guia do Usuário](docs/GUIA-DO-USUARIO.md) — Como usar FASE passo-a-passo
- [🔧 Todos os Comandos](docs/COMANDOS.md) — Referência completa com exemplos
- [🔌 System Hooks](docs/HOOKS.md) — Como adicionar automações

### Para Contribuidores
- [🤝 Como Contribuir](CONTRIBUTING.md) — Instruções para contribuições
- [🔧 Path Standardization](docs/technical/COMMAND_PATHS.md) — Como comandos funcionam em diferentes runtimes
- [📚 Testes](docs/TESTING.md) — Guia de testes, como rodar e contribuir
- [✅ Resultados de Testes](TEST_RESULTS.md) — Últimos resultados de validação

### Build & Development
- **Build:** `npm run build` — Compila TypeScript e copia static files
- **Test:** `npm test` — Executa testes de edge cases
- **Test All:** `npm run test:all` — Executa todos os testes (legacy + moderno)
- **Estrutura:** `src/` (TypeScript) → `dist/` (compilado com static files)

### 🚀 GitHub Actions & CI/CD

FASE possui um pipeline completo de CI/CD automatizado:

#### **Multi-Platform Testing** (test-multi-platform.yml)
- ✅ **Plataformas suportadas:** Linux (ubuntu-latest) e macOS (macos-latest)
- ✅ **Versões Node.js:** 20 e 22 (total de 4 combinações)
- ✅ **Testes:** Build, unit tests, e verificação de instalação
- ✅ **Integração:** Testa instalação multi-provider (--claude, --opencode)
- ✅ **Performance:** Matriz otimizada com 60% mais rápida que versões anteriores

**Execução:** Automaticamente em cada push para `main` ou pull request

#### **Smart npm Publishing** (publicar-npm.yml)
- ✅ **Detecção de versão:** Compara `package.json` com npm registry
- ✅ **Publicação condicional:** Só publica se versão mudou
- ✅ **Git tags automáticos:** Cria `v{version}` automaticamente
- ✅ **GitHub Releases:** Geradas automaticamente de `CHANGELOG.md`
- ✅ **Sem erro em push sem versão:** Skip silencioso se versão não mudou

**Como usar:**
```bash
# 1. Atualize versão em package.json
echo '"version": "4.0.3"' > package.json

# 2. Atualize CHANGELOG.md
echo '## 4.0.3\n- New feature' >> CHANGELOG.md

# 3. Commit e push
git add package.json CHANGELOG.md
git commit -m "chore: bump version 4.0.2 → 4.0.3"
git push origin main

# Workflow automaticamente:
# ✓ Detecta mudança de versão
# ✓ Publica no npm
# ✓ Cria tag v4.0.3
# ✓ Cria GitHub Release
```

#### **Outras Workflows**
- **deploy-pages.yml:** Deploy de documentação para GitHub Pages
- **track-adoption.yml:** Rastreamento de adoção e métricas

**Documentação detalhada:** Ver [specs/PUBLICAR_NPM_WORKFLOW.md](specs/PUBLICAR_NPM_WORKFLOW.md)

### Informações do Projeto
- [📊 Histórico de Mudanças](CHANGELOG.md) — Todas as versões
- [👥 Maintainers](docs/maintainers/MAINTAINERS.md) — Quem cuida do projeto

---

## ✨ Recursos Principais

### 🎯 Spec-Driven Development
Trabalhe com especificações claras e deixe o AI transformar em código funcional. Cada fase é uma entrega concreta.

### 🧠 Context Engineering
FASE organiza automaticamente o contexto da sua sessão para que o AI sempre tenha as informações certas no local certo.

### 🔄 Ciclo de Vida Estruturado
**Pesquisa → Planejamento → Execução → Verificação → Iteração**

Cada etapa tem seu agente especializado.

### 📋 Rastreamento de Estado
Histórico automático de fases, tarefas e checkpoints. Retome trabalho de onde parou, semanas depois.

### 🔌 Extensível
Crie seus próprios hooks e customize o comportamento via `settings.json` nativa.

### 🌍 Multi-Runtime
Funciona com:
- **Claude Code** (Anthropic)
- **OpenCode** (OpenAI)
- **Gemini Code** (Google)
- **Codex** (Microsoft)

---

## 🙏 Créditos & Origem

**FASE.** é uma **tradução comunitária em português brasileiro** do projeto original:

- **Original:** [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) por TÂCHES
- **Tradução & Manutenção:** Isaac Eliape
- **Licença:** MIT (mesma do original)

Sem o trabalho incrível da comunidade GSD, isso não existiria. 🙌

**Compatibilidade com GSD:** FASE mantém total compatibilidade com GSD — todos os agents e comandos usam a mesma arquitetura subjacente, apenas traduzidos para português.

---

## 🤝 Como Contribuir

Quer ajudar a traduzir ou melhorar o FASE.?

1. **Fork** este repo
2. **Traduza** um agent ou documento
3. **Abra um PR** descrevendo o que mudou

**Precisa de ajuda?** Abre uma issue no GitHub.

---

## ⚡ Quick Start

1. **Instale FASE:**
   ```bash
   npx fase-ai
   ```

2. **Abra seu IDE e inicie um novo projeto:**
   ```bash
   /fase-novo-projeto
   ```

3. **Descreva o que quer construir:**
   - Use `/fase-planejar-etapa` para quebrar em fases
   - Cada fase é uma entrega concreta

4. **Execute as fases:**
   ```bash
   /fase-executar-etapa
   ```

5. **Verifique o trabalho:**
   ```bash
   /fase-verificar-trabalho
   ```

Para mais detalhes, veja [📖 Guia do Usuário](docs/GUIA-DO-USUARIO.md).

---

## 📞 Comunidade & Suporte

### Reportar Issues
- 🐛 [Bugs](https://github.com/isaaceliape/FASE/issues/new?labels=bug)
- ✨ [Sugestões](https://github.com/isaaceliape/FASE/issues/new?labels=enhancement)
- 🌐 [Traduções](https://github.com/isaaceliape/FASE/issues/new?labels=traducao)

### Discussões
- 💬 [Discussions no GitHub](https://github.com/isaaceliape/FASE/discussions)
- 🎓 Compartilhe workflows, dicas e best practices

---

<div align="center">

### 💡 Filosofia FASE

**"Se você sabe claramente o que quer, isso VAI construir pra você. Sem burocracia, sem enrolação."**

---

Feito com 🇧🇷 e 💙 para a comunidade brasileira de devs.

[⭐ Dê uma star se FASE foi útil!](https://github.com/isaaceliape/FASE)

</div>
