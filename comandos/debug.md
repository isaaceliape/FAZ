---
name: fase:debug
description: Debugging sistemático com estado persistente através de resets de contexto
argument-hint: [descrição da issue]
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
Debugar issues usando método científico com isolamento de subagent.

**Papel do orquestrador:** Coletar sintomas, spawnar agent faz-debugger, lidar com checkpoints, spawnar continuações.

**Por que subagent:** Investigação queima contexto rápido (lendo arquivos, formando hipóteses, testando). Contexto fresh de 200k por investigação. Contexto principal permanece enxuto para interação com usuário.
</objective>

<context>
Issue do usuário: $ARGUMENTS

Verifique por sessões ativas:
```bash
ls .fase-ai/debug/*.md 2>/dev/null | grep -v resolved | head -5
```
</context>

<process>

## 0. Inicializar Contexto

```bash
INIT=$(node "$HOME/.fase/bin/fase-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extraia `commit_docs` do init JSON. Resolva modelo do debugger:
```bash
debugger_model=$(node "$HOME/.fase/bin/fase-tools.cjs" resolve-model faz-debugger --raw)
```

## 1. Verificar Sessões Ativas

Se sessões ativas existirem E sem $ARGUMENTS:
- Liste sessões com status, hipótese, próxima ação
- Usuário escolhe número para resumir OU descreve nova issue

Se $ARGUMENTS fornecido OU usuário descreve nova issue:
- Continue para coleta de sintomas

## 2. Coletar Sintomas (se nova issue)

Use AskUserQuestion para cada:

1. **Comportamento esperado** - O que deveria acontecer?
2. **Comportamento atual** - O que acontece em vez disso?
3. **Mensagens de erro** - Algum erro? (cole ou descreva)
4. **Linha do tempo** - Quando isso começou? Já funcionou?
5. **Reprodução** - Como você dispara isso?

Depois de todos coletados, confirme pronto para investigar.

## 3. Spawnar Agent faz-debugger

Preencha prompt e spawn:

```markdown
<objective>
Investigar issue: {slug}

**Sumário:** {trigger}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
Criar: .fase-ai/debug/{slug}.md
</debug_file>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="faz-debugger",
  model="{debugger_model}",
  description="Debug {slug}"
)
```

## 4. Lidar com Checkpoints

O debugger retorna quando:
- **Checkpoint atingido** — apresente opções ao usuário
- **Hipótese confirmada** — mostre evidência, peça aprovação para fix
- **Precisa de mais info** — faça pergunta ao usuário
- **Fix identificado** — mostre plano, pergunte se executa

## 5. Lidar com Respostas

**Se usuário aprova fix:**
- Gere PLANO.md para correção
- Pergunte: executar agora ou adicionar à lista?

**Se usuário rejeita fix:**
- Volte ao debugger com feedback

**Se usuário pede para parar:**
- Salve estado atual no debug file
- Confirme onde retomar

## 6. Sessões Ativas

Quando usuário executa `/fase-debug` sem argumentos:

```bash
ls .fase-ai/debug/*.md 2>/dev/null | grep -v resolved | head -10
```

Liste cada sessão:
- Número, status, hipótese atual, próxima ação

Permita:
- Resumir sessão por número
- Ver detalhes completos
- Arquivar sessão (marcar como resolved)

## 7. Spawnar Continuação

Quando debugger retorna "checkpoint" ou precisa continuar:

```markdown
<objective>
Continuar investigação: {slug}
</objective>

<debug_file>
@.fase-ai/debug/{slug}.md
</debug_file>

<mode>
continue_from_checkpoint: true
previous_result: {result_summary}
</mode>
```

**Por que continuar:** Mantém contexto de investigação sem sobrecarregar orquestrador.

## 8. Apresentar Resultados

Quando debugging completa:

```markdown
## Debugging Completo: {slug}

**Status:** {resolved|needs_fix|needs_human}
**Hipótese confirmada:** {yes|no}
**Causa raiz:** {description}

### Evidência
{key findings}

### Fix Recomendado
{fix_description}

**Arquivo de debug:** .fase-ai/debug/{slug}.md
```

**Se precisar de ação humana:**
- Explique o que precisa ser feito manualmente
- Documente no debug file

**Se fix automatizado:**
- Gere PLANO.md com tasks específicas
- Coordene com `/fase-executar-etapa` se necessário

</process>

<success_criteria>
- [ ] Sessões ativas verificadas
- [ ] Sintomas coletados (se nova issue)
- [ ] Debugger spawnado com contexto apropriado
- [ ] Checkpoints gerenciados adequadamente
- [ ] Resultados apresentados claramente
- [ ] Arquivo de debug criado/atualizado
- [ ] Próximos passos claros para usuário
</success_criteria>
