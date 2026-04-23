---
description: Valida features construídas através de UAT conversacional
argument-hint: "[número da fase, ex: '4']"
tools:
  read: true
  bash: true
  glob: true
  grep: true
  edit: true
  write: true
  task: true
---
<objective>
Validar features construídas através de testing conversacional com estado persistente.

Propósito: Confirmar que o que o Claude construiu realmente funciona da perspectiva do usuário. Um teste por vez, respostas em texto simples, sem interrogação. Quando issues são encontradas, automaticamente diagnosticar, planejar correções, e preparar para execução.

Output: {phase_num}-UAT.md rastreando todos os resultados de teste. Se issues encontradas: gaps diagnosticados, planos de correção verificados prontos para /fase-executar-etapa
</objective>


<context>
Fase: $ARGUMENTS (opcional)
- Se fornecido: Testar fase específica (ex: "4")
- Se não fornecido: Verificar por sessões ativas ou perguntar pela fase

Arquivos de contexto são resolvidos dentro do workflow (`init verify-work`) e delegados via blocos `<files_to_read>`.
</context>

<process>
Execute o workflow verify-work ponta a ponta.
Preserve todos os gates do workflow (gerenciamento de sessão, apresentação de testes, diagnóstico, planejamento de correções, roteamento).
</process>
