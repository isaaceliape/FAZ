# Exemplo 1: CLI Pomodoro Timer

**Nível:** Beginner  
**Objetivo:** Construir um timer Pomodoro simples em Node.js  
**Tempo Estimado:** 30-45 minutos com FASE

## <i class="fa fa-list-check"></i> Visão Geral do Projeto

Você quer criar uma ferramenta de linha de comando (CLI) que:
- Executa um timer Pomodoro (25 min trabalho, 5 min pausa)
- Mostra tempo restante no terminal
- Toca um som quando o tempo acaba
- Rastreia sessões completadas

## <i class="fa fa-arrows-rotate"></i> Fluxo FASE Usado

### Passo 1: Inicializar o Projeto

```bash
cd meu-projeto-pomodoro
npx fase-ai --claude
/fase-novo-projeto
```

**Respostas esperadas:**
- Título: "Pomodoro Timer CLI"
- Descrição: "Timer CLI com notificações sonoras"
- Tecnologia: "Node.js 18+"

### Passo 2: Ver o Roadmap Inicial

```bash
/fase-progresso
```

FASE gera `ROADMAP.md` com fases sugeridas.

### Passo 3: Planejar a Etapa 1

```bash
/fase-planejar-fase 1
```

**O que FASE faz:**
- Quebra a Etapa 1 em tarefas
- Cria um PLAN.md com requisitos específicos
- Gera checklist de validação

### Passo 4: Executar

```bash
/fase-executar-fase 1
```

Você interage com Claude Code para implementar a Etapa 1.

### Passo 5: Validar

```bash
/fase-verificar-fase 1
```

FASE verifica se a Etapa 1 está completa.

---

## 📁 Estrutura de Arquivos

Este exemplo contém:

```
01-cli-pomodoro/
├── README.md          (este arquivo)
└── .fase-ai-local/
    └── ROADMAP.md     (exemplo real de roadmap gerado)
```

Não temos o código-fonte aqui — o ponto é mostrar como **FASE organiza o trabalho**, não o resultado final.

---

## 📖 Inspeccione a ROADMAP

Abra `.fase-ai-local/ROADMAP.md` para ver:
- <i class="fa fa-check-circle"></i> Fases propostas
- <i class="fa fa-check-circle"></i> Dependências entre fases
- <i class="fa fa-check-circle"></i> Critérios de sucesso
- <i class="fa fa-check-circle"></i> Progresso rastreado

```bash
cat .fase-ai-local/ROADMAP.md
```

---

## 💡 Lições Aprendidas

1. **FASE estrutura automaticamente** — Você descreve o que quer, FASE propõe as fases
2. **Cada fase é independente** — Você pode trabalhar em paralelo com múltiplas IA
3. **Validação contínua** — FASE garante que cada fase atenda aos critérios
4. **Rastreamento** — Roadmap é atualizado conforme você avança

---

## <i class="fa fa-bullseye"></i> Próximos Passos

- Tente com seu próprio projeto
- Use a mesma estrutura de fases
- Consulte a [documentação de comandos](https://isaaceliape.github.io/FASE/docs/reference/commands/)

---

**Quer ver mais exemplos?** → [Voltar para a lista](../README.md)
