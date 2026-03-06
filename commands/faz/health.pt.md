---
name: faz:health
description: Diagnostica health do diretório de planning e opcionalmente repara issues
argument-hint: [--repair]
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
---
<objective>
Valide integridade do diretório `.planning/` e reporte issues acionáveis. Checa por arquivos ausentes, configurações inválidas, estado inconsistente, e plans orphaned.
</objective>

<execution_context>
@~/.faz/workflows/health.md
</execution_context>

<process>
Execute o workflow health de @~/.faz/workflows/health.md end-to-end.
Parse flag --repair dos argumentos e passe para workflow.
</process>
