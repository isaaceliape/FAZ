---
name: fase:saude
description: Diagnostica health do diretório de planning e opcionalmente repara issues
argument-hint: [--repair]
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---
<objective>
Valide integridade do diretório `.fase-ai-local/` e reporte issues acionáveis. Checa por arquivos ausentes, configurações inválidas, estado inconsistente, e plans orphaned.
</objective>


<process>
Execute o workflow health end-to-end.
Parse flag --repair dos argumentos e passe para workflow.
</process>
