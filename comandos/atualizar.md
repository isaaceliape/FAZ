---
name: fase:atualizar
description: Atualizar FASE para versão mais recente com backup, migração versionada e verificação profunda
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - AskUserQuestion
---

<objective>
Atualizar FASE para a versão mais recente, executar migrações pendentes, verificar integridade dos
arquivos instalados e garantir que o framework continua funcionando corretamente em todos os
runtimes instalados.
</objective>

<process>

## Fase 0: Backup Pré-Atualização

Antes de qualquer modificação, criar um snapshot dos arquivos instalados para permitir restauração
em caso de falha.

```bash
BACKUP_DIR=".fase-ai/.backup/pre-update-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copiar agentes e comandos instalados de cada runtime detectado
for runtime_dir in .claude .opencode .gemini .codex; do
  if [ -d "$runtime_dir" ]; then
    mkdir -p "$BACKUP_DIR/$runtime_dir"
    cp -r "$runtime_dir/agents" "$BACKUP_DIR/$runtime_dir/" 2>/dev/null || true
    cp -r "$runtime_dir/commands" "$BACKUP_DIR/$runtime_dir/" 2>/dev/null || true
    cp -r "$runtime_dir/command" "$BACKUP_DIR/$runtime_dir/" 2>/dev/null || true
    cp -r "$runtime_dir/skills" "$BACKUP_DIR/$runtime_dir/" 2>/dev/null || true
  fi
done

echo "Backup criado em: $BACKUP_DIR"
```

Registrar o caminho do backup — ele será usado na restauração automática se a atualização falhar.

**Procedimento de restauração em caso de falha:**
Se qualquer fase subsequente (3, 4 ou 5) retornar erro crítico, restaurar com:
```bash
# Restaurar runtimes afetados do backup
cp -r "$BACKUP_DIR/.claude/agents"   .claude/   2>/dev/null || true
cp -r "$BACKUP_DIR/.claude/commands" .claude/   2>/dev/null || true
cp -r "$BACKUP_DIR/.opencode/command" .opencode/ 2>/dev/null || true
# (repetir para gemini/codex se instalados)
echo "Restauração concluída. Verifique com /fase-verificar-instalacao"
```

## Fase 1: Diagnóstico de Versão

Verificar versão instalada e disponível:

```bash
# Versão instalada (lê do runtime com FASE detectado)
VERSAO_ATUAL=$(cat ./.claude/fase-ai/VERSION 2>/dev/null || \
               cat ./.opencode/fase-ai/VERSION 2>/dev/null || \
               cat ./.gemini/fase-ai/VERSION 2>/dev/null || \
               cat ./.codex/fase-ai/VERSION 2>/dev/null || \
               echo "não encontrada")

# Versão mais recente no npm
VERSAO_NPM=$(npm view fase-ai version 2>/dev/null || echo "sem conectividade npm")

echo "Versão instalada: $VERSAO_ATUAL"
echo "Versão npm:       $VERSAO_NPM"
```

Se as versões coincidirem, confirmar com o usuário se deseja forçar a reinstalação para garantir
integridade dos arquivos mesmo assim.

## Fase 2: Detectar Runtimes Instalados

```bash
RUNTIMES_INSTALADOS=()
for dir in .claude .opencode .gemini .codex; do
  if ls "$dir/agents/fase-"*.md 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/agents/fase-"*.toml 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/skills/fase-"* 2>/dev/null | head -1 > /dev/null || \
     ls "$dir/command/fase-"*.md 2>/dev/null | head -1 > /dev/null; then
    echo "INSTALADO: $dir"
    RUNTIMES_INSTALADOS+=("$dir")
  fi
done

if [ ${#RUNTIMES_INSTALADOS[@]} -eq 0 ]; then
  echo "AVISO: Nenhum runtime com FASE detectado. Execute npx fase-ai para instalar."
  exit 1
fi
```

## Fase 2.5: Resumo de Diff (Antes vs Depois)

Contar arquivos instalados antes da atualização para exibir delta após:

```bash
# Contagens pré-atualização por runtime
for dir in .claude .opencode .gemini .codex; do
  AGENTES_ANTES=$(ls "$dir/agents/fase-"*.md 2>/dev/null | wc -l | tr -d ' ')
  COMANDOS_ANTES=$(ls "$dir/commands/fase/"*.md "$dir/command/fase-"*.md 2>/dev/null | wc -l | tr -d ' ')
  [ "$AGENTES_ANTES" -gt 0 ] || [ "$COMANDOS_ANTES" -gt 0 ] && \
    echo "PRE|$dir|agentes=$AGENTES_ANTES|comandos=$COMANDOS_ANTES"
done
```

Guardar esses valores — após a atualização (Fase 4), executar as mesmas contagens e exibir o delta:

```
Resumo de alterações:
  .claude  — agentes: 13 → 14 (+1)  |  comandos: 31 → 33 (+2)
  .opencode — agentes: 13 → 14 (+1) |  comandos: 31 → 33 (+2)
```

## Fase 3: Migrações Versionadas

As migrações são rastreadas em `.fase-ai/migrations-applied`. Cada migração tem um
identificador único (M-NNN) e a versão em que foi introduzida.

```bash
MIGRATIONS_FILE=".fase-ai/migrations-applied"
touch "$MIGRATIONS_FILE" 2>/dev/null || mkdir -p .fase-ai && touch "$MIGRATIONS_FILE"

# Verificar quais migrações já foram aplicadas
migrations_aplicadas() { grep -q "$1" "$MIGRATIONS_FILE" 2>/dev/null; }
```

### M-001 — Renomear `.planejamento` → `.fase-ai` (introduzida em v2.x)

```bash
if ! migrations_aplicadas "M-001"; then
  if test -d .planejamento; then
    echo "M-001: Aplicando — renomear .planejamento → .fase-ai"
    mv .planejamento .fase-ai

    # Corrigir referências nos arquivos do projeto
    grep -rl "\.planejamento" . \
      --include="*.md" --include="*.json" --include="*.js" --include="*.ts" \
      --exclude-dir=node_modules --exclude-dir=.git \
      --exclude-dir=.claude --exclude-dir=.opencode \
      --exclude-dir=.gemini --exclude-dir=.codex | while read -r f; do
        sed -i '' 's/\.planejamento/.fase-ai/g' "$f"
    done

    # Atualizar .gitignore se necessário
    if ! grep -q "fase-ai-local" .gitignore 2>/dev/null; then
      sed -i '' 's/\.planejamento/.fase-ai/g' .gitignore 2>/dev/null || true
    fi

    echo "M-001" >> "$MIGRATIONS_FILE"
    echo "M-001: Concluída"
  else
    echo "M-001: Ignorada (.planejamento não existe)"
    echo "M-001" >> "$MIGRATIONS_FILE"
  fi
else
  echo "M-001: Já aplicada — ignorando"
fi
```

### M-002 — Corrigir referências de path nos agentes instalados (introduzida em v3.1)

```bash
if ! migrations_aplicadas "M-002"; then
  OBSOLETOS=$(grep -l \
    "\.planejamento\|~/.claude/fase\|~/.config/opencode/fase\|~/.gemini/fase\|~/.codex/fase" \
    .claude/agents/fase-*.md .opencode/agents/fase-*.md \
    .gemini/agents/fase-*.md .codex/agents/*.toml 2>/dev/null)

  if [ -n "$OBSOLETOS" ]; then
    echo "M-002: Referências obsoletas encontradas — a atualização (Fase 4) irá corrigir"
  else
    echo "M-002: Sem referências obsoletas"
  fi
  echo "M-002" >> "$MIGRATIONS_FILE"
fi
```

> **Adicionar novas migrações aqui** como M-003, M-004, etc. Seguir o padrão:
> verificar `migrations_aplicadas "M-NNN"`, aplicar a mudança, registrar no arquivo.

### 3.3 Verificar referências de path nos arquivos instalados

```bash
grep -l "\.planejamento\|~/.claude/fase\|~/.config/opencode/fase\|~/.gemini/fase\|~/.codex/fase" \
  .claude/agents/fase-*.md .opencode/agents/fase-*.md \
  .gemini/agents/fase-*.md .codex/agents/*.toml 2>/dev/null
```

Referências obsoletas indicam instalação desatualizada — a atualização na Fase 4 irá corrigir.

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

Se o comando falhar, restaurar o backup criado na Fase 0 e reportar o erro ao usuário.

**Após a atualização**, repetir as contagens de arquivos e exibir o resumo de diff (ver Fase 2.5).

## Fase 5: Verificação de Integridade Pós-Atualização

### 5.1 Contagens de arquivos

```bash
# Agentes instalados existem e têm conteúdo
ls -la .claude/agents/fase-*.md 2>/dev/null | wc -l

# Comandos instalados existem
ls -la .claude/commands/fase/*.md 2>/dev/null | wc -l

# Nenhuma referência a .planejamento nos arquivos instalados
grep -r "\.planejamento" .claude/ .opencode/ .gemini/ .codex/ 2>/dev/null | grep -v ".git"

# Hooks configurados (Claude Code)
cat .claude/settings.json 2>/dev/null | grep -A2 "hooks"

# VERSION atualizado
cat .claude/fase-ai/VERSION 2>/dev/null
```

### 5.2 Validação profunda de frontmatter

Para cada agente instalado, verificar que os campos obrigatórios estão presentes e não vazios.
Os campos obrigatórios são: `name`, `description`, `allowed-tools`.

```bash
ERROS_FRONTMATTER=0

for agent_file in .claude/agents/fase-*.md; do
  [ -f "$agent_file" ] || continue

  # Extrair bloco frontmatter (entre os dois ---)
  FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$agent_file" | head -30)

  NOME=$(echo "$FRONTMATTER" | grep '^name:' | head -1)
  DESC=$(echo "$FRONTMATTER" | grep '^description:' | head -1)
  TOOLS=$(echo "$FRONTMATTER" | grep -A5 '^allowed-tools:' | head -6)

  if [ -z "$NOME" ] || [ -z "$DESC" ] || [ -z "$TOOLS" ]; then
    echo "FRONTMATTER INVÁLIDO: $agent_file"
    [ -z "$NOME" ]  && echo "  - campo 'name' ausente"
    [ -z "$DESC" ]  && echo "  - campo 'description' ausente"
    [ -z "$TOOLS" ] && echo "  - campo 'allowed-tools' ausente"
    ERROS_FRONTMATTER=$((ERROS_FRONTMATTER + 1))
  fi
done

echo "Agentes com frontmatter inválido: $ERROS_FRONTMATTER"
```

Repetir a verificação para cada runtime detectado (`.opencode/agents/`, `.gemini/agents/`, etc.).
Agentes com frontmatter inválido são marcados como `⚠️` no relatório final; a atualização não é
considerada bem-sucedida enquanto houver erros críticos.

### 5.3 Verificar agentes críticos

Confirmar que os agentes mais importantes do pipeline têm conteúdo não-vazio:

```bash
for agent in fase-executor fase-verificador fase-planejador fase-pesquisador-fase; do
  FILE=".claude/agents/${agent}.md"
  LINHAS=$(wc -l < "$FILE" 2>/dev/null || echo 0)
  [ "$LINHAS" -gt 10 ] && echo "OK: $agent ($LINHAS linhas)" || echo "SUSPEITO: $agent ($LINHAS linhas)"
done
```

## Fase 6: Relatório Final

Exibir para o usuário:

- ✅ Versão anterior → versão atual instalada
- ✅ Runtimes atualizados: [lista]
- ✅ Migrações executadas: [lista com ID e descrição, ou "nenhuma pendente"]
- 📊 Alterações de arquivos: [resumo de diff por runtime]
- ✅ Frontmatter válido em todos os agentes (ou lista de problemas)
- ⚠️ Itens que precisam de atenção (se houver)
- 📍 Backup disponível em: `.fase-ai/.backup/pre-update-TIMESTAMP/`

**IMPORTANTE:** Orientar o usuário a **reiniciar o runtime** após a atualização:
- Claude Code: fechar todas as janelas e reabrir
- OpenCode: reiniciar o processo
- Gemini / Codex: reiniciar conforme documentação do provider

Sem reiniciar, os novos comandos e agentes não serão carregados.

</process>
