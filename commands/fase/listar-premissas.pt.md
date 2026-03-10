---
name: fase:listar-premissas
description: Expõe suposições do Claude sobre abordagem da phase antes do planning
argument-hint: "[phase]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
Analise uma phase e apresente suposições do Claude sobre abordagem técnica, ordem de implementação, limites de escopo, áreas de risco e dependências.

Propósito: Ajudar usuários a ver o que Claude pensa ANTES do planning começar — permitindo course correction cedo quando suposições estão erradas.
Output: Apenas output conversacional (sem criação de arquivo) — termina com prompt "O que você acha?"
</objective>

<execution_context>
@~/.fase/workflows/list-phase-assumptions.md
</execution_context>

<context>
Phase number: $ARGUMENTS (required)

Estado do projeto e roadmap são carregados in-workflow usando reads direcionados.
</context>

<process>
1. Valide argumento phase number (erro se ausente ou inválido)
2. Cheque se phase existe no roadmap
3. Siga workflow list-phase-assumptions.md:
   - Analise descrição do roadmap
   - exponha suposições sobre: abordagem técnica, ordem de implementação, escopo, riscos, dependências
   - Apresente suposições claramente
   - Prompt "O que você acha?"
4. Reúna feedback e ofereça próximos passos
</process>

<success_criteria>

- Phase validada contra roadmap
- Suposições expostas em cinco áreas
- Usuário prompted para feedback
- Usuário sabe próximos passos (discutir context, planejar phase, ou corrigir suposições)
  </success_criteria>
