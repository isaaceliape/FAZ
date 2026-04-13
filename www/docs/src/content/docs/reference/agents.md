---
title: Agentes de IA
description: 13 agentes especializados do FASE
---

# Agentes de IA

FASE possui **13 agentes especializados**, cada um com papel único no pipeline. Todos os agentes estão em `bin/agentes/`.

---

## Pipeline Principal

### `fase-roadmapper`
Cria o roadmap inicial do projeto: analisa o PROJETO.md, quebra em milestones e fases, escreve PLANO-ENTREGAS.md.

### `fase-pesquisador-projeto`
Roda em paralelo (×4) durante `/fase-novo-projeto`. Cada instância investiga um domínio diferente: stack, funcionalidades, arquitetura, armadilhas.

### `fase-sintetizador-pesquisa`
Agrega os 4 arquivos de pesquisa (STACK.md, FUNCIONALIDADES.md, ARQUITETURA.md, ARMADILHAS.md) em um SUMARIO.md coeso. Aborta com `PESQUISA INCOMPLETA` se algum arquivo estiver faltando.

### `fase-pesquisador-fase`
Pesquisa o domínio específico de uma fase antes do planejamento. Copia decisões locked do CONTEXTO.md para PESQUISA.md e valida que nenhuma foi omitida.

### `fase-planejador`
Gera os arquivos PLANO.md da fase a partir de PESQUISA.md + CONTEXTO.md. Valida que cada decisão locked aparece em pelo menos um `<action>`. Segue o schema em `bin/fase-shared/references/plano-schema.md`.

### `fase-verificador-plano`
Verifica planos em 8 dimensões antes da execução. VALIDACAO.md ausente gera WARNING (não falha) — checks Nyquist são ignorados, não reprovados.

### `fase-executor`
Executa os planos tarefa por tarefa. Valida o schema do PLANO.md na carga, escreve CONTEXTO.md ao final de cada sessão.

### `fase-verificador`
Verifica o trabalho executado contra os objetivos da fase. Mantém contador `closure_attempts` em VERIFICACAO.md. Após 3 tentativas sem fechar todos os gaps, emite `## <i class="fa fa-warning"></i> Escalação Humana Necessária`.

---

## Agentes de Suporte

### `fase-arquiteto`
Registra decisões arquiteturais em formato ADR. Define contratos de API, limites de módulo e modelo de dados. Produz ARQUITETURA.md.

### `fase-auditor-nyquist`
Mapeia requisitos da fase a comandos de teste concretos. Produz VALIDACAO.md seguindo o schema em `bin/fase-shared/references/validacao-schema.md`.

### `fase-verificador-integracao`
Verifica integração entre fases: contratos de API, compatibilidade de tipos, dependências satisfeitas.

### `fase-mapeador-codigo`
Analisa uma base de código existente em 4 dimensões (stack, arquitetura, convenções, integrações). Usado pelo `/fase-mapear-codigo`.

### `fase-depurador`
Sessão de debug estruturado com estado persistente. Coleta sintomas, propõe hipóteses, testa causas raiz.

---

## Referências de Schema

- **PLANO.md** — `bin/fase-shared/references/plano-schema.md`
- **VALIDACAO.md** — `bin/fase-shared/references/validacao-schema.md`
