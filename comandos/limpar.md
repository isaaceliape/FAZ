---
name: fase:limpar
description: Arquiva diretórios de phases acumulados de milestones completados
---
<objective>
Arquive diretórios de phases de milestones completados em `.fase-ai-local/milestones/v{X.Y}-phases/`.

Use quando `.fase-ai-local/phases/` acumulou diretórios de milestones passados.
</objective>

<execution_context>
@~/.fase/workflows/cleanup.md
</execution_context>

<process>
Siga o workflow cleanup em @~/.fase/workflows/cleanup.md.
Identifique milestones completados, mostre um resumo dry-run e arquive após confirmação.
</process>
