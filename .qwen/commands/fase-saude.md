---
description: "Diagnostica health do diretório de planning e opcionalmente repara issues"
---

<objective>
Valide integridade do diretório `.fase-ai/` e reporte issues acionáveis. Checa por arquivos ausentes, configurações inválidas, estado inconsistente, e plans orphaned.
</objective>


<process>
Execute o workflow health end-to-end.
Parse flag --repair dos argumentos e passe para workflow.
</process>
