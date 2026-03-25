---
title: Conceitos Fundamentais
description: Entenda os conceitos principais do FASE
---

# Conceitos Fundamentais

## Fases (Phases)

Uma **fase** é uma unidade de trabalho bem-definida que resulta em uma entrega concreta. Cada fase tem:

- Um objetivo claro (spec)
- Critérios de sucesso verificáveis
- Um milestone associado
- Um estado persistente

## Milestones

Um **milestone** é uma coleção de fases relacionadas que formam um ciclo de entrega. Cada milestone:

- Agrupa múltiplas fases logicamente relacionadas
- Rastreia progresso geral
- Pode ser auditado e arquivado

## Spec-Driven Development

FASE usa **spec-driven development** — descreva claramente o que você quer, e os agents trabalham para alcançar isso.

1. **Especificação Clara** — O que exatamente você quer construir?
2. **Critérios de Sucesso** — Como você sabe que está completo?
3. **Execução Automática** — FASE cria o plano e executa
4. **Verificação** — Valida se os critérios foram atingidos

## Context Engineering

FASE gerencia **contexto** através de:

- **Context Window** — O contexto compartilhado entre agents
- **State Files** — Arquivos persistentes (.fase-ai-local/) que rastreiam projeto
- **Checkpoints** — Marcos no progresso que podem ser retomados

## Agents Paralelos

FASE pode spawnar múltiplos **agents** simultaneamente para:

- **Pesquisa** — Investigar soluções técnicas em paralelo
- **Planejamento** — Criar planos detalhados
- **Execução** — Implementar mudanças
- **Verificação** — Validar resultados

## Roadmap

Um **roadmap** é a lista ordenada de milestones e fases que definem o caminho para seu projeto.

## Estado e Persistência

FASE mantém **estado** em arquivos estruturados:

- `.fase-ai-local/PROJECT.md` — Definição do projeto
- `.fase-ai-local/ROADMAP.md` — Roadmap de fases
- `.fase-ai-local/phase_*/*.md` — Arquivos de cada fase
- `.fase-ai-local/ESTADO.md` — Estado atual
- `.fase-ai-local/CONTEXTO.md` — Contexto persistente

## Goal-Backward Verification

FASE usa **goal-backward analysis** para verificar que fases realmente atingem seus objetivos:

1. Defina o objetivo da fase
2. Execute a implementação
3. Verifique se o código implementado satisfaz o objetivo
4. Se não, itere

Isso garante que você não completa "tarefas" enquanto perde de vista o objetivo real.
