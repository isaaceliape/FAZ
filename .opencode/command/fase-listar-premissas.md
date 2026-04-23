---
description: Expõe suposições do Claude sobre abordagem da fase antes do planning
argument-hint: "[fase]"
tools:
  read: true
  bash: true
  grep: true
  glob: true
---

<objective>
Analise uma fase e apresente suposições do Claude sobre abordagem técnica, ordem de implementação, limites de escopo, áreas de risco e dependências.

Propósito: Ajudar usuários a ver o que Claude pensa ANTES do planning começar — permitindo course correction cedo quando suposições estão erradas.
Output: Apenas output conversacional (sem criação de arquivo) — termina com prompt "O que você acha?"
</objective>


<context>
Fase number: $ARGUMENTS (required)

Estado do projeto e roteiro são carregados in-workflow usando reads direcionados.
</context>

<process>
1. Valide argumento fase number (erro se ausente ou inválido)
2. Cheque se fase existe no roteiro
3. Siga workflow list-fase-assumptions.md:
   - Analise descrição do roteiro
   - exponha suposições sobre: abordagem técnica, ordem de implementação, escopo, riscos, dependências
   - Apresente suposições claramente
   - Prompt "O que você acha?"
4. Reúna feedback e ofereça próximos passos
</process>

<success_criteria>

- Fase validada contra roteiro
- Suposições expostas em cinco áreas
- Usuário prompted para feedback
- Usuário sabe próximos passos (discutir context, planejar fase, ou corrigir suposições)
  </success_criteria>
