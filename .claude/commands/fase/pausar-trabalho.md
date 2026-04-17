---
name: fase:pausar-trabalho
description: Cria handoff de context ao pausar trabalho mid-fase
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Crie arquivo de handoff `.continue-here.md` para preservar estado completo do trabalho cross-sessions.

Roteia para workflow pause-work que lida com:
- Detecção de fase atual de arquivos recentes
- Gathering de estado completo (posição, trabalho completado, trabalho restante, decisões, blockers)
- Criação de arquivo de handoff com todas seções de context
- Git commit como WIP
- Instruções de resume
</objective>


<context>
Estado e fase progress são gathered in-workflow com reads direcionados.
</context>

<process>
**Siga o workflow pause-work** de .

O workflow lida com toda lógica incluindo:
1. Detecção de fase directory
2. Gathering de estado com clarifications do usuário
3. Escrita de arquivo de handoff com timestamp
4. Git commit
5. Confirmação com instruções de resume
</process>
