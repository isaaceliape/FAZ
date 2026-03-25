---
name: fase:atualizar
description: Atualizar FASE para versão mais recente com verificação de compatibilidade e migração
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - AskUserQuestion
---

<objective>
Atualizar FASE para a versão mais recente, executar migrações necessárias e verificar que o
framework continua funcionando corretamente em todos os runtimes instalados.
</objective>

<process>

## Fase 1: Diagnóstico de Versão

Verificar versão instalada e disponível:

```bash
# Versão instalada no runtime atual
cat ./.claude/fase-ai/VERSION 2>/dev/null || \
  cat ./.opencode/fase-ai/VERSION 2>/dev/null || \
  cat ./.gemini/fase-ai/VERSION 2>/dev/null || \
  cat ./.codex/fase-ai/VERSION 2>/dev/null || \
  echo "versão não encontrada"

# Versão mais recente no npm
npm view fase-ai version 2>/dev/null || echo "sem conectividade npm"
```

Se as versões coincidirem, confirmar com o usuário se deseja forçar a reinstalação
para garantir integridade dos arquivos mesmo assim.

## Fase 2: Detectar Runtimes Instalados

```bash
# Detectar quais runtimes têm FASE instalado neste projeto
for dir in .claude .opencode .gemini .codex; do
  if ls "$dir/agents/fase-"*.md 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/agents/fase-"*.toml 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/skills/fase-"* 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/command/fase-"*.md 2>/dev/null | head -1 > /dev/null; then
    echo "INSTALADO: $dir"
  fi
done
```

## Fase 3: Migrações Necessárias

### 3.1 Renomear `.planejamento` → `.fase-ai-local` (se legado existir)

```bash
test -d .planejamento && echo "MIGRAÇÃO NECESSÁRIA" || echo "ok — já usa .fase-ai-local ou não iniciado"
```

Se `.planejamento` existir:
1. Renomear o diretório:
   ```bash
   mv .planejamento .fase-ai-local
   ```
2. Corrigir referências em arquivos do projeto:
   ```bash
   grep -rl "\.planejamento" . \
     --include="*.md" --include="*.json" --include="*.js" --include="*.ts" \
     --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.claude \
     --exclude-dir=.opencode --exclude-dir=.gemini --exclude-dir=.codex
   ```
   Para cada arquivo encontrado, substituir `.planejamento` por `.fase-ai-local`.

3. Atualizar `.gitignore` se necessário:
   ```bash
   grep -n "planejamento\|fase-ai-local" .gitignore 2>/dev/null
   ```
   Verificar se `.fase-ai-local` está ignorado corretamente (substitui entrada antiga).

### 3.2 Verificar referências de path nos arquivos instalados

```bash
# Checar se agentes instalados têm referências obsoletas
grep -l "\.planejamento\|~/.claude/fase\|~/.config/opencode/fase\|~/.gemini/fase\|~/.codex/fase" \
  .claude/agents/fase-*.md .opencode/agents/fase-*.md \
  .gemini/agents/fase-*.md .codex/agents/*.toml 2>/dev/null
```

Referências obsoletas indicam instalação desatualizada — a atualização corrigirá.

## Fase 4: Executar Atualização

Usar o CLI do FASE para reinstalar todos os runtimes detectados:

```bash
# Atualizar todos os runtimes instalados (auto-detecta)
npx fase-ai --atualizar

# Ou especificar runtimes manualmente:
# npx fase-ai --claude --atualizar
# npx fase-ai --opencode --atualizar
# npx fase-ai --claude --opencode --atualizar
# npx fase-ai --all --atualizar
```

O comando `--atualizar`:
- Detecta automaticamente os runtimes instalados neste projeto
- Verifica versão no npm e informa se há nova versão disponível
- Reinstala os agentes, comandos e hooks atualizados
- Executa `--verificar` automaticamente ao final

## Fase 5: Verificação de Integridade Pós-Atualização

```bash
# Verificação completa de instalação
npx fase-ai --verificar
```

Checklist manual adicional:

```bash
# 1. Agentes instalados existem e têm conteúdo
ls -la .claude/agents/fase-*.md 2>/dev/null | wc -l

# 2. Comandos instalados existem
ls -la .claude/commands/fase/*.md 2>/dev/null | wc -l

# 3. Nenhuma referência a .planejamento nos arquivos instalados
grep -r "\.planejamento" .claude/ .opencode/ .gemini/ .codex/ 2>/dev/null | grep -v ".git"

# 4. Hooks configurados (Claude Code)
cat .claude/settings.json 2>/dev/null | grep -A2 "hooks"

# 5. VERSION atualizado
cat .claude/fase-ai/VERSION 2>/dev/null
```

## Fase 6: Relatório Final

Exibir para o usuário:

- ✅ Versão anterior → versão atual instalada
- ✅ Runtimes atualizados: [lista]
- ✅ Migrações executadas: [lista ou "nenhuma necessária"]
- ⚠️ Itens que precisam de atenção (se houver)

**IMPORTANTE:** Orientar o usuário a **reiniciar o runtime** após a atualização:
- Claude Code: fechar todas as janelas e reabrir
- OpenCode: reiniciar o processo
- Gemini / Codex: reiniciar conforme documentação do provider

Sem reiniciar, os novos comandos e agentes não serão carregados.

</process>
