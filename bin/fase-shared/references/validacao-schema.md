# Schema: VALIDACAO.md

Schema autoritativo para arquivos VALIDACAO.md produzidos por `fase-auditor-nyquist` e consumidos por `fase-verificador-plano` (check 8e).

---

## Frontmatter (YAML)

```yaml
---
phase: "02-auth"            # OBRIGATÓRIO — identificador da fase
generated: "2026-04-09T14:30:00Z"  # OBRIGATÓRIO — timestamp ISO de geração
coverage_pct: 85            # OBRIGATÓRIO — percentual de requisitos com teste automatizado (0-100)
requirements:               # OBRIGATÓRIO — lista de entradas por requisito
  - req_id: "AUTH-01"       # OBRIGATÓRIO — ID do requisito do ROTEIRO.md
    test_file: "tests/auth.test.ts"   # OBRIGATÓRIO — caminho do arquivo de teste
    test_command: "npm test -- --filter=auth-login"  # OBRIGATÓRIO — comando executável
    verified_at: "2026-04-09T14:28:00Z"  # OPCIONAL — quando o teste foi verificado como passando
    status: "passing"       # OBRIGATÓRIO — "passing" | "missing" | "failing"
  - req_id: "AUTH-02"
    test_file: "tests/auth.test.ts"
    test_command: "npm test -- --filter=auth-invalid"
    verified_at: "2026-04-09T14:28:00Z"
    status: "passing"
---
```

### Regras de Validação

| Campo | Regra |
|-------|-------|
| `requirements` | Deve conter uma entrada para cada requisito da fase listado no ROTEIRO.md. |
| `req_id` | Deve corresponder exatamente a um ID de requisito em REQUISITOS.md. |
| `test_command` | Deve ser um comando bash executável. Sem flags `--watchAll` ou similar. |
| `status` | `missing` = teste ainda não escrito; `failing` = teste existe mas falha; `passing` = verde. |
| `coverage_pct` | `(count de status=passing / total requirements) * 100`, arredondado. |

---

## Conteúdo (Markdown após frontmatter)

```markdown
# Validação Nyquist — Fase {N}: {Nome}

**Gerado:** {timestamp}
**Cobertura:** {coverage_pct}% ({N} de {M} requisitos com teste passando)

## Mapa de Requisitos → Testes

| Requisito | Arquivo de Teste | Comando | Status |
|-----------|-----------------|---------|--------|
| AUTH-01   | tests/auth.test.ts | `npm test -- --filter=auth-login` | <i class="fa fa-check"></i> passing |
| AUTH-02   | tests/auth.test.ts | `npm test -- --filter=auth-invalid` | <i class="fa fa-check"></i> passing |

## Gaps de Cobertura

<!-- Liste requisitos com status missing ou failing -->
- Nenhum gap identificado.

## Notas

<!-- Contexto adicional, limitações, ou decisões de design dos testes -->
```

---

## Exemplo Completo

```markdown
---
phase: "02-auth"
generated: "2026-04-09T14:30:00Z"
coverage_pct: 100
requirements:
  - req_id: "AUTH-01"
    test_file: "tests/auth.test.ts"
    test_command: "npm test -- --filter=auth-login"
    verified_at: "2026-04-09T14:28:00Z"
    status: "passing"
  - req_id: "AUTH-02"
    test_file: "tests/auth.test.ts"
    test_command: "npm test -- --filter=auth-invalid"
    verified_at: "2026-04-09T14:28:00Z"
    status: "passing"
---

# Validação Nyquist — Fase 02: Autenticação

**Gerado:** 2026-04-09T14:30:00Z
**Cobertura:** 100% (2 de 2 requisitos com teste passando)

## Mapa de Requisitos → Testes

| Requisito | Arquivo de Teste | Comando | Status |
|-----------|-----------------|---------|--------|
| AUTH-01   | tests/auth.test.ts | `npm test -- --filter=auth-login` | <i class="fa fa-check"></i> passing |
| AUTH-02   | tests/auth.test.ts | `npm test -- --filter=auth-invalid` | <i class="fa fa-check"></i> passing |

## Gaps de Cobertura

Nenhum gap identificado.
```
