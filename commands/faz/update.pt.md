---
name: faz:update
description: Atualizar FAZ para versão mais recente com exibição de changelog
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
Verificar atualizações do FAZ, instalar se disponível e exibir o que mudou.

Direciona para o workflow update que lida com:
- Detecção de versão (instalação local vs global)
- Checagem de versão npm
- Busca e exibição de changelog
- Confirmação do usuário com aviso de clean install
- Execução de atualização e limpeza de cache
- Lembrete de restart
</objective>

<execution_context>
@~/.faz/workflows/update.md
</execution_context>

<process>
**Seguir workflow update** em `@~/.faz/workflows/update.md`.

O workflow lida com toda lógica incluindo:
1. Detecção de versão instalada (local/global)
2. Checagem de versão mais recente via npm
3. Comparação de versões
4. Busca e extração de changelog
5. Exibição de aviso de clean install
6. Confirmação do usuário
7. Execução de atualização
8. Limpeza de cache
</process>
