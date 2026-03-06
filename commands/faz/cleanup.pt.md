---
name: faz:cleanup
description: Arquiva diretórios de phases acumulados de milestones completados
---
<objective>
Arquive diretórios de phases de milestones completados em `.planning/milestones/v{X.Y}-phases/`.

Use quando `.planning/phases/` acumulou diretórios de milestones passados.
</objective>

<execution_context>
@~/.faz/workflows/cleanup.md
</execution_context>

<process>
Siga o workflow cleanup em @~/.faz/workflows/cleanup.md.
Identifique milestones completados, mostre um resumo dry-run e arquive após confirmação.
</process>
