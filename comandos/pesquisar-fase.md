---
name: fase:pesquisar-fase
description: Pesquisa como implementar uma fase (standalone - geralmente use /fase-planejar-fase ao invés disso)
argument-hint: "[fase]"
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
Pesquisar como implementar uma fase. Spawna agent(s) faz-phase-researcher com contexto da fase.

**Nota:** Este é um comando de research standalone. Para a maioria dos workflows, use `/fase-planejar-fase` que integra research automaticamente.

**Use este comando quando:**
- Quer pesquisar sem planejar ainda
- Quer re-research após planejamento estar completo
- Precisa investigar antes de decidir se uma fase é viável
- Quer research profunda com múltiplos modos (`--deep`)

**Papel do orquestrador:** Parsear fase, validar contra roadmap, checar research existente, coletar contexto, spawnar agent(s) researcher, sintetizar resultados (se múltiplos), apresentar resultados.

**Por que subagent:** Research queima contexto rápido (WebSearch, queries Context7, verificação de sources). Contexto fresh de 200k para investigação. Contexto principal permanece enxuto para interação com usuário.

**Paralelização:** Use `--deep` para spawnar múltiplos researchers em paralelo (um por modo: ecosystem, comparison, feasibility, implementation) e sintetizar em RESEARCH.md único. Speedup esperado: 3–4× para research profunda.
</objective>

<context>
Número da fase: $ARGUMENTS (obrigatório)
Flags:
- `--deep` — Spawn múltiplos researchers em paralelo (um por modo), sintetizar resultados

Normalize input da fase no passo 1 antes de qualquer lookup de diretório.
</context>

<process>

## 0. Inicializar Contexto

```bash
INIT=$(node "$HOME/.fase/bin/fase-tools.cjs" init phase-op "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Extraia do init JSON: `phase_dir`, `phase_number`, `phase_name`, `phase_found`, `commit_docs`, `has_research`, `state_path`, `requirements_path`, `context_path`, `research_path`.

Resolva modelo do researcher:
```bash
RESEARCHER_MODEL=$(node "$HOME/.fase/bin/fase-tools.cjs" resolve-model faz-phase-researcher --raw)
```

## 1. Validar Fase

```bash
PHASE_INFO=$(node "$HOME/.fase/bin/fase-tools.cjs" roadmap get-phase "${phase_number}")
```

**Se `found` é false:** Erro e exit. **Se `found` é true:** Extraia `phase_number`, `phase_name`, `goal` do JSON.

## 2. Checar Research Existente

```bash
ls .fase-ai-local/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

**Se existe:** Ofereça: 1) Atualizar research, 2) Ver existente, 3) Pular. Aguarde resposta.

**Se não existe:** Continue.

## 3. Coletar Contexto da Fase

Use paths do INIT (não inline conteúdos de arquivos no contexto do orquestrador):
- `requirements_path`
- `context_path`
- `state_path`

Apresente sumário com descrição da fase e quais arquivos o researcher vai carregar.

## 4. Spawnar Agent faz-phase-researcher

Modos de research: ecosystem (padrão), feasibility, implementation, comparison.

```markdown
<research_type>
Etapa Research — investigando COMO implementar uma fase específica bem.
</research_type>

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
@.fase-ai-local/ROADMAP.md
@.fase-ai-local/REQUIREMENTS.md
@.fase-ai-local/STATE.md
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

**Modo Serial (padrão, sem `--deep`):**
Spawn um único researcher no modo determinado (4a).

Carregue apenas arquivos essenciais no `<files_to_read>`:
- ROADMAP.md (goal da fase)
- REQUIREMENTS.md (requisitos)
- STATE.md (decisões, tech stack)

NÃO carregue código-fonte completo (o researcher explora conforme necessário).

**Modo Paralelo (com `--deep`):**
Spawn 4 researchers em paralelo, um por modo (ecosystem, comparison, feasibility, implementation). Cada um recebe:
- Mesmos `<files_to_read>` (ROADMAP, REQUIREMENTS, STATE)
- `<research_mode>` específico (não permita ao researcher escolher)
- `<output_file>` = `RESEARCH-{mode}.md` (não sobrescrever RESEARCH.md principal)

## 5. Aguardar Resultados

**Modo Serial:**
O researcher retorna:
- **RESEARCH.md estruturado** (salvo na pasta da fase)
- **Resumo para orquestrador** (2-3 parágrafos)

**Modo Paralelo:**
4 researchers retornam em paralelo:
- **RESEARCH-{mode}.md** (each returns to specific file)
- **Resumos parciais** (um por modo)

Após todos completos: Spawn **fase-sintetizador-pesquisa** que lê os 4 RESEARCH-*.md e escreve RESEARCH.md único, consolidando insights e recomendações.

## 6. Apresentar Resultados

```markdown
## Research Completo para Fase {phase_number}

**Arquivo:** `.fase-ai-local/phases/{phase_dir}/RESEARCH.md`
**Modo:** {research_mode}

### Resumo
{2-3 parágrafos cobrindo stack padrão, padrões recomendados, armadilhas comuns}

### Decisões Recomendadas
{bullet points de decisões específicas}

### Próximos Passos
- Para planejamento: `/fase-planejar-fase {phase_number}`
- Para ver research completo: @.fase-ai-local/phases/{phase_dir}/RESEARCH.md
```

## 7. Roteamento

Após research:
- **Para planejar:** `/fase-planejar-fase {phase_number}` (integra RESEARCH.md automaticamente)
- **Para revisar:** User examina RESEARCH.md
- **Para re-research:** Execute `/fase-pesquisar-fase {phase_number}` novamente

**NÃO commite** — o orquestrador principal (plan-phase ou research-phase) faz bundle dos artefatos.

</process>

<success_criteria>
- [ ] Fase validada contra roadmap
- [ ] Research existente verificado (se houver)
- [ ] Agent researcher spawnado com contexto apropriado
- [ ] RESEARCH.md criado na pasta da fase
- [ ] Resultados apresentados ao usuário
- [ ] Roteamento claro para próximo passo
</success_criteria>
