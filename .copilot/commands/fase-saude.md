---
description: Diagnostica health do diretório de planning e opcionalmente repara issues
argument-hint: [--repair]
tools:
  read_file: true
  run_shell_command: true
  write_file: true
  ask_user: true
---

<objective>
Valide integridade do diretório `.fase-ai/` e reporte issues acionáveis. Checa por arquivos ausentes, configurações inválidas, estado inconsistente, e plans orphaned.
</objective>


<process>
Execute o workflow health end-to-end.
Parse flag --repair dos argumentos e passe para workflow.
</process>
