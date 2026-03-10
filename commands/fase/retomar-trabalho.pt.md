---
name: fase:retomar-trabalho
description: Retomar trabalho da sessão anterior com restauração completa de contexto
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
  - SlashCommand
---

<objective>
Restaurar contexto completo do projeto e retomar trabalho sem interrupção da sessão anterior.

Direciona para o workflow resume-project que lida com:

- Carregamento STATE.md (ou reconstrução se ausente)
- Detecção de checkpoint (arquivos .continue-here)
- Detecção de trabalho incompleto (PLAN sem SUMMARY)
- Apresentação de status
- Roteamento de próxima ação consciente de contexto
  </objective>

<execution_context>
@~/.fase/workflows/resume-project.md
</execution_context>

<process>
**Seguir workflow resume-project** em `@~/.fase/workflows/resume-project.md`.

O workflow lida com toda lógica de resumo incluindo:

1. Verificação de existência do projeto
2. Carregamento ou reconstrução do STATE.md
3. Detecção de checkpoint e trabalho incompleto
4. Apresentação visual de status
5. Oferta de próxima ação consciente de contexto (verifica CONTEXT.md antes de sugerir plan vs discuss)
6. Roteamento para próximo comando apropriado
7. Atualizações de continuidade de sessão
   </process>
