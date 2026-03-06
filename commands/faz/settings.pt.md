---
name: faz:settings
description: Configurar toggles de workflow FAZ e perfil de model
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
Configuração interativa de agents e perfil de model do workflow FAZ via prompt multi-question.

Direciona para o workflow settings que lida com:
- Garantia de existência de config
- Leitura e parsing de configurações atuais
- Prompt interativo de 5 questões (model, research, plan_check, verifier, branching)
- Merge e escrita de config
- Exibição de confirmação com referências rápidas de comandos
</objective>

<execution_context>
@~/.faz/workflows/settings.md
</execution_context>

<process>
**Seguir workflow settings** em `@~/.faz/workflows/settings.md`.

O workflow lida com toda lógica incluindo:
1. Criação de arquivo de config com defaults se ausente
2. Leitura de config atual
3. Apresentação interativa de settings com pré-seleção
4. Parsing de resposta e merge de config
5. Escrita de arquivo
6. Exibição de confirmação
</process>
