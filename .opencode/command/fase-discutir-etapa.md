---
description: Reúne context da fase através de questioning adaptativo antes do planning
argument-hint: "<fase> [--auto]"
tools:
  read: true
  write: true
  bash: true
  glob: true
  grep: true
  question: true
  task: true
  mcp__context7__resolve-library-id: true
  mcp__context7__query-docs: true
---

<objective>
Extraia decisões de implementação que downstream agents precisam — pesquisador e planner usarão CONTEXTO.md para saber o que investigar e quais escolhas estão locked.

**Como funciona:**
1. Carregue context anterior (PROJETO.md, REQUISITOS.md, ESTADO.md, arquivos CONTEXTO.md anteriores)
2. Scout codebase por reusable assets e patterns
3. Analise fase — pule gray areas já decididas em fases anteriores
4. Apresente gray areas restantes — usuário seleciona quais discutir
5. Deep-dive cada área selecionada até satisfazer
6. Crie CONTEXTO.md com decisões que guiam pesquisa e planning

**Output:** `{phase_num}-CONTEXTO.md` — decisões claras o suficiente para downstream agents agirem sem perguntar ao usuário novamente
</objective>


<context>
Fase number: $ARGUMENTS (required)

Arquivos de context são resolvidos in-workflow usando `init fase-op` e tool calls de roteiro/state.
</context>

<process>
1. Valide fase number (erro se ausente ou não está no roteiro)
2. Cheque se CONTEXTO.md existe (ofereça update/view/skip se sim)
3. **Carregue context anterior** — Leia PROJETO.md, REQUISITOS.md, ESTADO.md, e todos arquivos CONTEXTO.md anteriores
4. **Scout codebase** — Encontre reusable assets, patterns, e integration points
5. **Analise fase** — Cheque decisões anteriores, pule áreas já decididas, gere gray areas restantes
6. **Apresente gray areas** — Multi-select: quais discutir? Anote com decisões anteriores + context do código
7. **Deep-dive cada área** — 4 perguntas por área, opções code-informed, Context7 para library choices
8. **Escreva CONTEXTO.md** — Seções matching áreas discutidas + seção code_context

**CRÍTICO: Scope guardrail**
- Fase boundary do ROTEIRO.md é FIXO
- Discussão clarifica COMO implementar, não SE deve adicionar mais
- Se usuário sugerir novas capacidades: "Isso é sua própria fase. Vou anotar para depois."
- Capture ideias deferidas — não perca elas, não aja sobre elas

**Gray areas domain-aware:**
Gray areas dependem do que está sendo built. Analise o fase goal:
- Algo que usuários VEEM → layout, density, interações, states
- Algo que usuários CALL → responses, errors, auth, versioning
- Algo que usuários RUN → output format, flags, modes, error handling
- Algo que usuários READ → structure, tone, depth, flow
- Algo sendo ORGANIZED → criteria, grouping, naming, exceptions

Gere 3-4 **gray areas fase-specific**, não categorias genéricas.

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
- CONTEXTO.md captura decisões, não visão vaga
- Usuário sabe próximos passos
</success_criteria>
