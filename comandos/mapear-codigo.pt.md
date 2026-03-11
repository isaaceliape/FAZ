---
name: fase:mapear-codigo
description: Analisa codebase com agents mapper paralelos para produzir documentos .planning/codebase/
argument-hint: "[opcional: área específica para mapear, ex: 'api' ou 'auth']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Analisar codebase existente usando agents faz-codebase-mapper paralelos para produzir documentos de codebase estruturados.

Cada agent mapper explora uma área de foco e **escreve documentos diretamente** em `.planning/codebase/`. O orquestrador apenas recebe confirmações, mantendo uso de contexto mínimo.

Output: pasta `.planning/codebase/` com 7 documentos estruturados sobre o estado do codebase.
</objective>

<execution_context>
@~/.claude/fase/workflows/map-codebase.md
</execution_context>

<context>
Área de foco: $ARGUMENTS (opcional - se fornecido, diz aos agents para focarem em subsystem específico)

**Carregar estado do projeto se existir:**
Verifique por .planning/STATE.md - carrega contexto se projeto já inicializado

**Este comando pode rodar:**
- Antes de /fase-novo-projeto (codebases brownfield) - cria mapa do codebase primeiro
- Depois de /fase-novo-projeto (codebases greenfield) - atualiza mapa do codebase conforme código evolui
- A qualquer momento para refrescar entendimento do codebase
</context>

<when_to_use>
**Use map-codebase para:**
- Projetos brownfield antes da inicialização (entenda código existente primeiro)
- Refrescar mapa do codebase após mudanças significativas
- Onboarding em codebase desconhecido
- Antes de refatoração major (entenda estado atual)
- Quando STATE.md referencia info desatualizada do codebase

**Pule map-codebase para:**
- Projetos greenfield sem código ainda (nada para mapear)
- Codebases triviais (<5 arquivos)
</when_to_use>

<process>
1. Verificar se .planning/codebase/ já existe (oferecer refrescar ou pular)
2. Criar estrutura de diretório .planning/codebase/
3. Spawnar 4 agents faz-codebase-mapper paralelos:
   - Agent 1: foco tech → escreve STACK.md, INTEGRATIONS.md
   - Agent 2: foco arch → escreve ARCHITECTURE.md, STRUCTURE.md
   - Agent 3: foco quality → escreve CONVENTIONS.md, TESTING.md
   - Agent 4: foco concerns → escreve CONCERNS.md
4. Aguardar agents completarem, coletar confirmações (NÃO conteúdos dos documentos)
5. Verificar se todos os 7 documentos existem com contagem de linhas
6. Commitar mapa do codebase
7. Oferecer próximos passos (tipicamente: /fase-novo-projeto ou /fase-planejar-fase)
</process>

<success_criteria>
- [ ] Diretório .planning/codebase/ criado
- [ ] Todos os 7 documentos de codebase escritos por mapper agents
- [ ] Documentos seguem estrutura do template
- [ ] Agents paralelos completaram sem erros
- [ ] Usuário sabe os próximos passos
</success_criteria>
