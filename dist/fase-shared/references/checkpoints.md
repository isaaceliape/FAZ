# Padrões de Checkpoint para Automação First

## Filosofia

Checkpoints são momentos onde a automação para e solicita input humano. Em uma abordagem **automation-first**, esses momentos devem ser:

1. **Raros** — apenas quando decisão humana é necessária
2. **Bem-justificados** — claro por que automação não pode continuar
3. **Com contexto** — fornecer o máximo de informação possível
4. **Com opções** — deixar explícitas as escolhas disponíveis

---

## Tipos de Checkpoint

### `checkpoint:review`

Parar para **revisão visual** do que foi gerado.

```markdown
**CHECKPOINT: Review**
Verifique o código gerado em [arquivo].
- ✅ Parece correto?
- ❌ Precisa ajustes?
```

Use quando: Resultado visual é subjetivo (UI, formatting) ou requer julgamento estético.

### `checkpoint:decision`

Parar para **decisão de negócio/arquitetura**.

```markdown
**CHECKPOINT: Decision**
Escolha a estratégia de autenticação:
1. OAuth 2.0 (recomendado)
2. JWT (simples)
3. Session-based (legacy)
```

Use quando: Multiple valid paths and human should choose based on project goals.

### `checkpoint:verification`

Parar para **verificar que efeitos colaterais** não ocorreram.

```markdown
**CHECKPOINT: Verification**
Antes de continuar, confirme:
- ✅ Database migration completada sem erros
- ✅ Tests ainda passando
- ✅ No breaking changes em produção
```

Use quando: Sistema externo foi modificado e precisa de validação.

### `checkpoint:input`

Parar para **coletar informação** que automação não pode obter.

```markdown
**CHECKPOINT: Input Required**
Insira as credenciais da API:
- API Key: [_______]
- API Secret: [_______]
```

Use quando: Precisa de secrets, config, ou informação externa.

---

## Server Lifecycle Management

### Pre-Server Startup

```bash
# Antes de qualquer `checkpoint:review` que dependa do servidor,
# SEMPRE adicione startup do servidor
npm run dev
# Aguarde logs "server running on port X"
```

**Regra:** Se plan menciona "testar visualmente" ou "verificar no browser", o servidor DEVE estar rodando antes do checkpoint.

### Post-Server Verification

```bash
# Após checkpoint validation, verificar que servidor ainda está saudável
curl -s http://localhost:3000/health | jq .
# Confirmar: { "status": "healthy" }
```

---

## CLI Manipulation (Automation-First)

Em vez de pedir pro usuário rodar comandos, **a automação roda**:

```bash
# ❌ ERRADO:
# "Execute: npm run build"

# ✅ CERTO:
npm run build  # Com erro handling
if [ $? -ne 0 ]; then
  echo "Build falhou, checando logs..."
  npm run build -- --verbose
fi
```

**Exceção:** Commands que requerem credenciais ou input do usuário.

---

## Human-Verify Checkpoint Pattern

Quando FASE termina automação significativa:

```markdown
## Human Verification Required

✅ **Automação Completada:**
- Implementados 5 endpoints
- 12 testes adicionados (11/12 passando)
- Documentation atualizada

⚠️ **Requer Validação Humana:**

**Checkpoint: Review Code**
- [ ] Review dos 5 endpoints em `src/api/`
- [ ] Validar nomes de rota seguem convenção
- [ ] Confirmar error handling é robusto

**Checkpoint: Test Verification**
- [ ] Verificar por que 1 teste está falhando
- [ ] Corrigir fixture ou assertion?

**Proceder?** [Sim] [Não - Reabrir discussão]
```

---

## Anti-Patterns to Avoid

❌ **"Click here to continue"** — muito vago

✅ **"Verifique se login funciona em http://localhost:3000/login com user:pass, então continue"**

---

❌ **Checkpoint todo passo** — automação demais parada

✅ **1 checkpoint por decisão principal** — fluxo fluido

---

❌ **"Desculpa, preciso que você rode isto"** — abdicando de automação

✅ **Rodar é automático, pedir confirmação se preciso** — automação-first

---

## Implementação em FASE Agents

Quando escrevendo agents que usam checkpoints:

1. Use `AskUserQuestion` tool (Claude Code nativo)
2. Forneça options explícitas — não pergunte aberto
3. Tenha um plano B se resposta não for esperada
4. Log a decisão em ESTADO.md para auditoria

```javascript
AskUserQuestion([
  {
    header: "Arquitetura",
    question: "Qual database usar?",
    options: [
      { label: "PostgreSQL", description: "Production-ready, recomendado" },
      { label: "SQLite", description: "Dev rápido" },
    ]
  }
])
```
