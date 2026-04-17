---
name: fase:pesquisar-etapa
description: Pesquisa como implementar uma fase (standalone - geralmente use /fase-planejar-etapa ao invés disso)
argument-hint: "[fase]"
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
Pesquisar como implementar uma fase. Spawna agent faz-fase-pesquisador com contexto da fase.

**Nota:** Este é um comando de pesquisa standalone. Para a maioria dos workflows, use `/fase-planejar-etapa` que integra pesquisa automaticamente.

**Use este comando quando:**
- Quer pesquisar sem planejar ainda
- Quer re-pesquisa após planejamento estar completo
- Precisa investigar antes de decidir se uma fase é viável

**Papel do orquestrador:** Parsear fase, validar contra roteiro, checar pesquisa existente, coletar contexto, spawnar agent pesquisador, apresentar resultados.

**Por que subagent:** Research queima contexto rápido (WebSearch, queries Context7, verificação de sources). Contexto fresh de 200k para investigação. Contexto principal permanece enxuto para interação com usuário.
</objective>

<context>
Número da fase: $ARGUMENTS (obrigatório)

Normalize input da fase no passo 1 antes de qualquer lookup de diretório.
</context>

<process>

## 0. Inicializar Contexto

```bash
INIT=$(node "$HOME/.fase/bin/fase-tools.cjs" init fase-op "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extraia do init JSON: `phase_dir`, `phase_number`, `phase_name`, `phase_found`, `commit_docs`, `has_pesquisa`, `state_path`, `requisitos_path`, `context_path`, `pesquisa_path`.

Resolva modelo do pesquisador:
```bash
PESQUISAER_MODEL=$(node "$HOME/.fase/bin/fase-tools.cjs" resolve-model faz-fase-pesquisador --raw)
```

## 1. Validar Fase

```bash
PHASE_INFO=$(node "$HOME/.fase/bin/fase-tools.cjs" roteiro get-fase "${phase_number}")
```

**Se `found` é false:** Erro e exit. **Se `found` é true:** Extraia `phase_number`, `phase_name`, `goal` do JSON.

## 2. Checar Research Existente

```bash
ls .fase-ai/fases/${FASE}-*/PESQUISA.md 2>/dev/null
```

**Se existe:** Ofereça: 1) Atualizar pesquisa, 2) Ver existente, 3) Pular. Aguarde resposta.

**Se não existe:** Continue.

## 3. Coletar Contexto da Fase

Use paths do INIT (não inline conteúdos de arquivos no contexto do orquestrador):
- `requisitos_path`
- `context_path`
- `state_path`

Apresente sumário com descrição da fase e quais arquivos o pesquisador vai carregar.

## 4. Spawnar Agent faz-fase-pesquisador

Modos de pesquisa: ecosystem (padrão), feasibility, implementation, comparison.

```markdown
<pesquisa_type>
Fase Research — investigando COMO implementar uma fase específica bem.
</pesquisa_type>

<key_insight>
A questão NÃO é "qual biblioteca devo usar?"

A questão é: "O que eu não sei que eu não sei?"

Para esta fase, descubra:
- Qual é o padrão de arquitetura estabelecido?
- Quais bibliotecas formam o stack padrão?
- Quais problemas as pessoas normalmente encontram?
- O que é SOTA vs o que o treinamento do Claude pensa que é SOTA?
- O que NÃO deve ser feito manualmente?
</key_insight>

<objective>
Research de abordagem de implementação para Fase {phase_number}: {phase_name}
Modo: ecosystem
</objective>

<files_to_read>
@.fase-ai/ROTEIRO.md
@.fase-ai/REQUISITOS.md
@.fase-ai/ESTADO.md
</files_to_read>
```

### 4a. Determinar Modo de Research

| Situação | Modo | Foco |
|----------|------|------|
| Nova tecnologia/desconhecida | `ecosystem` | Stack padrão, padrões arquiteturais |
| Decisão entre opções | `comparison` | Trade-offs, benchmarks |
| Viabilidade incerta | `feasibility` | O que é possível, limitações |
| Já decidido, precisa de detalhes | `implementation` | APIs específicas, edge cases |

### 4b. Spawn com Contexto Enxuto

Carregue apenas arquivos essenciais no `<files_to_read>`:
- ROTEIRO.md (goal da fase)
- REQUISITOS.md (requisitos)
- ESTADO.md (decisões, tech stack)

NÃO carregue código-fonte completo (o pesquisador explora conforme necessário).

## 5. Aguardar Resultados

O pesquisador retorna:
- **PESQUISA.md estruturado** (salvo na pasta da fase)
- **Resumo para orquestrador** (2-3 parágrafos)

## 6. Apresentar Resultados

```markdown
## Research Completo para Fase {phase_number}

**Arquivo:** `.fase-ai/fases/{phase_dir}/PESQUISA.md`
**Modo:** {pesquisa_mode}

### Resumo
{2-3 parágrafos cobrindo stack padrão, padrões recomendados, armadilhas comuns}

### Decisões Recomendadas
{bullet points de decisões específicas}

### Próximos Passos
- Para planejamento: `/fase-planejar-etapa {phase_number}`
- Para ver pesquisa completo: @.fase-ai/fases/{phase_dir}/PESQUISA.md
```

## 7. Roteamento

Após pesquisa:
- **Para planejar:** `/fase-planejar-etapa {phase_number}` (integra PESQUISA.md automaticamente)
- **Para revisar:** User examina PESQUISA.md
- **Para re-pesquisa:** Execute `/fase-pesquisar-etapa {phase_number}` novamente

**NÃO commite** — o orquestrador principal (plan-fase ou pesquisa-fase) faz bundle dos artefatos.

</process>

<success_criteria>
- [ ] Fase validada contra roteiro
- [ ] Research existente verificado (se houver)
- [ ] Agent pesquisador spawnado com contexto apropriado
- [ ] PESQUISA.md criado na pasta da fase
- [ ] Resultados apresentados ao usuário
- [ ] Roteamento claro para próximo passo
</success_criteria>
