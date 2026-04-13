# Exemplo 2: Refatoração de Código Legacy

**Nível:** Intermediate  
**Objetivo:** Refatorar um script de 500+ linhas mantendo funcionalidade  
**Tempo Estimado:** 2-3 horas com FASE

## <i class="fa fa-list-check"></i> Cenário

Você herdou um script `data-processor.js` que:
- Processa arquivos CSV
- Transforma dados em JSON
- Integra com API externa
- Mas: sem testes, código desorganizado, sem tipos

Você quer refatorar mantendo a funcionalidade.

## <i class="fa fa-arrows-rotate"></i> Fluxo FASE Usado

### 1. Mapear o Código Existente

```bash
/fase-mapear-codigo
```

FASE lê o código e cria `CONTEXT.md` com:
- Funções identificadas
- Dependências
- Pontos de integração

### 2. Planejar Refatoração

```bash
/fase-planejar-fase 1
```

FASE propõe quebra em fases menores:
- Etapa 1: Extrair utilitários em módulos
- Etapa 2: Adicionar types (TypeScript)
- Etapa 3: Escrever testes

### 3. Executar por Fase

```bash
/fase-executar-fase 1
/fase-validar-fase 1
```

Cada fase é pequena e testável.

---

## 📁 Arquivos Aqui

```
02-refactor-legacy/
├── README.md          (este arquivo)
└── .fase-ai-local/
    └── ROADMAP.md     (plano de refatoração)
```

---

## 💡 Lições Aprendidas

1. **Refatoração estruturada** — FASE quebra código grande em fases menores
2. **Testes habilitados** — Cada fase inclui validação
3. **Zero risco de regressão** — PHASE valida que a funcionalidade se mantém

---

**Quer ver mais?** → [Voltar para a lista](../README.md)
