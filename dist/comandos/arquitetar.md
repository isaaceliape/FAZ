---
name: fase:arquitetar
description: Agente arquiteto para decisões de design — modelo de dados, contratos de API, fronteiras de módulo, seleção de tech stack. Produz ARQUITETURA.md com ADRs.
argument-hint: "[descrição da decisão arquitetural]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - Write
  - WebSearch
  - WebFetch
---

<objective>
Invocar o agente `fase-arquiteto` para tomar decisões arquiteturais documentadas em formato ADR (Architecture Decision Records).

O agente vai:
1. Ler o contexto existente do projeto (REQUISITOS.md, ROTEIRO.md, ARQUITETURA.md, CONTEXTO.md)
2. Coletar informações que faltarem via perguntas diretas
3. Analisar opções concretas com trade-offs contextualizados
4. Fazer uma recomendação clara e fundamentada
5. Documentar em `ARQUITETURA.md`
</objective>

<process>
Passe o argumento do comando (descrição da decisão) para o agente `fase-arquiteto` como contexto inicial.

Se nenhum argumento for fornecido, o agente vai coletar o contexto necessário diretamente.
</process>
