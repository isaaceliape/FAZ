---
description: Trocar perfil de model para agents FASE (quality/balanced/budget)
argument-hint: <perfil>
tools:
  read: true
  write: true
  bash: true
---

<objective>
Trocar o perfil de model usado por agents FASE. Controla qual modelo Claude cada agent usa, balanceando qualidade vs gasto de tokens.

Direciona para o workflow set-profile que lida com:
- Validação de argumento (quality/balanced/budget)
- Criação de arquivo de config se ausente
- Atualização de perfil no config.json
- Confirmação com exibição de tabela de models
</objective>


<process>
**Seguir workflow set-profile**.

O workflow lida com toda lógica incluindo:
1. Validação de argumento de perfil
2. Garantia de arquivo de config
3. Leitura e atualização de config
4. Geração de tabela de models a partir de MODEL_PROFILES
5. Exibição de confirmação
</process>
