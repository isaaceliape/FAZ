---
name: fase:limpar
description: Arquiva diretórios de fases acumulados de marcos completados
---
<objective>
Arquive diretórios de fases de marcos completados em `.planejamento/marcos/v{X.Y}-fases/`.

Use quando `.planejamento/fases/` acumulou diretórios de marcos passados.
</objective>

<execution_context>
@~/.fase/workflows/cleanup.md
</execution_context>

<process>
Siga o workflow cleanup em @~/.fase/workflows/cleanup.md.
Identifique marcos completados, mostre um resumo dry-run e arquive após confirmação.
</process>
