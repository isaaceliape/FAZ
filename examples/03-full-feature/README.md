# Exemplo 3: Full Feature Implementation with JWT Auth

**Nível:** Advanced  
**Objetivo:** Implementar autenticação JWT em API Express  
**Tempo Estimado:** 4-6 horas com FASE  
**Complexidade:** Múltiplas dependências, testes obrigatórios, documentação

## <i class="fa fa-list-check"></i> Requisito Funcional

Adicionar autenticação JWT a uma API Express existente:
- Login/Register endpoints
- Token generation & refresh
- Protected routes com middleware
- Database integration (MongoDB)
- Testes unitários e E2E
- Documentação OpenAPI/Swagger

## <i class="fa fa-arrows-rotate"></i> Fluxo FASE Usado

### Phase 1: Research & Architecture

```bash
/fase-pesquisar-fase 1
```

FASE pesquisa padrões JWT, segurança, boas práticas.

### Phase 2: Design & Specification

```bash
/fase-planejar-fase 2
```

FASE cria spec detalhado com endpoints, schemas, fluxo de autenticação.

### Phase 3: Database Schema

```bash
/fase-executar-fase 3
```

Implementar modelo User com hash de senha.

### Phase 4: Auth Logic

```bash
/fase-executar-fase 4
```

Token generation, validation, refresh logic.

### Phase 5: API Endpoints

```bash
/fase-executar-fase 5
```

Login, register, protected routes.

### Phase 6: Tests

```bash
/fase-executar-fase 6
```

Testes de sucesso, erro, edge cases.

### Phase 7: Documentation

```bash
/fase-executar-fase 7
```

OpenAPI spec, README, exemplos cURL.

---

## 📁 Arquivos Aqui

```
03-full-feature/
├── README.md          (este arquivo)
└── .fase-ai-local/
    └── ROADMAP.md     (roadmap com milestones)
```

---

## 💡 Padrões Avançados

1. **Múltiplas dependências** — Roadmap mostra quais fases dependem de outras
2. **Marcos (milestones)** — v1.0 completo vs v1.1 melhorias
3. **Testes obrigatórios** — Nenhuma fase sem testes
4. **Documentação contínua** — Cada fase documenta seus outputs

---

**Quer voltar?** → [Lista de exemplos](../README.md)
