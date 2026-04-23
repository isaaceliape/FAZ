---
description: Retomar trabalho da sessão anterior com restauração completa de contexto
tools:
  read: true
  bash: true
  write: true
  question: true
  skill: true
---

<objective>
Restaurar contexto completo do projeto e retomar trabalho sem interrupção da sessão anterior.

Direciona para o workflow resume-project que lida com:

- Carregamento ESTADO.md (ou reconstrução se ausente)
- Detecção de checkpoint (arquivos .continue-here)
- Detecção de trabalho incompleto (PLAN sem SUMMARY)
- Apresentação de status
- Roteamento de próxima ação consciente de contexto
  </objective>


<process>
**Seguir workflow resume-project**.

O workflow lida com toda lógica de resumo incluindo:

1. Verificação de existência do projeto
2. Carregamento ou reconstrução do ESTADO.md
3. Detecção de checkpoint e trabalho incompleto
4. Apresentação visual de status
5. Oferta de próxima ação consciente de contexto (verifica CONTEXTO.md antes de sugerir plan vs discuss)
6. Roteamento para próximo comando apropriado
7. Atualizações de continuidade de sessão
   </process>
