---
name: faz:discuss-phase
description: Reúne context da phase através de questioning adaptativo antes do planning
argument-hint: "<phase> [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
---

<objective>
Extraia decisões de implementação que downstream agents precisam — researcher e planner usarão CONTEXT.md para saber o que investigar e quais escolhas estão locked.

**Como funciona:**
1. Carregue context anterior (PROJECT.md, REQUIREMENTS.md, STATE.md, arquivos CONTEXT.md anteriores)
2. Scout codebase por reusable assets e patterns
3. Analise phase — pule gray areas já decididas em phases anteriores
4. Apresente gray areas restantes — usuário seleciona quais discutir
5. Deep-dive cada área selecionada até satisfazer
6. Crie CONTEXT.md com decisões que guiam research e planning

**Output:** `{phase_num}-CONTEXT.md` — decisões claras o suficiente para downstream agents agirem sem perguntar ao usuário novamente
</objective>

<execution_context>
@~/.faz/workflows/discuss-phase.md
@~/.faz/templates/context.md
</execution_context>

<context>
Phase number: $ARGUMENTS (required)

Arquivos de context são resolvidos in-workflow usando `init phase-op` e tool calls de roadmap/state.
</context>

<process>
1. Valide phase number (erro se ausente ou não está no roadmap)
2. Cheque se CONTEXT.md existe (ofereça update/view/skip se sim)
3. **Carregue context anterior** — Leia PROJECT.md, REQUIREMENTS.md, STATE.md, e todos arquivos CONTEXT.md anteriores
4. **Scout codebase** — Encontre reusable assets, patterns, e integration points
5. **Analise phase** — Cheque decisões anteriores, pule áreas já decididas, gere gray areas restantes
6. **Apresente gray areas** — Multi-select: quais discutir? Anote com decisões anteriores + context do código
7. **Deep-dive cada área** — 4 perguntas por área, opções code-informed, Context7 para library choices
8. **Escreva CONTEXT.md** — Seções matching áreas discutidas + seção code_context

**CRÍTICO: Scope guardrail**
- Phase boundary do ROADMAP.md é FIXO
- Discussão clarifica COMO implementar, não SE deve adicionar mais
- Se usuário sugerir novas capacidades: "Isso é sua própria phase. Vou anotar para depois."
- Capture ideias deferidas — não perca elas, não aja sobre elas

**Gray areas domain-aware:**
Gray areas dependem do que está sendo built. Analise o phase goal:
- Algo que usuários VEEM → layout, density, interações, states
- Algo que usuários CALL → responses, errors, auth, versioning
- Algo que usuários RUN → output format, flags, modes, error handling
- Algo que usuários READ → structure, tone, depth, flow
- Algo sendo ORGANIZED → criteria, grouping, naming, exceptions

Gere 3-4 **gray areas phase-specific**, não categorias genéricas.

**Profundidade de probing:**
- Faça 4 perguntas por área antes de checar
- "Mais perguntas sobre [área], ou mover para próxima?"
- Se mais → faça 4 mais, cheque novamente
- Após todas áreas → "Pronto para criar context?"

**NÃO pergunte sobre (Claude handles these):**
- Implementação técnica
- Escolhas de arquitetura
- Performance concerns
- Scope expansion
</process>

<success_criteria>
- Context anterior carregado e aplicado (sem re-perguntar questões decididas)
- Gray areas identificadas através de análise inteligente
- Usuário escolheu quais áreas discutir
- Cada área selecionada explorada até satisfazer
- Scope creep redirecionado para ideias deferidas
- CONTEXT.md captura decisões, não visão vaga
- Usuário sabe próximos passos
</success_criteria>
