---
name: fase:verificar-instalacao
description: Verifica a instalação do FASE e gera relatório com sugestões de correção
---
<objective>
Verifica o status da instalação do FASE no sistema e gera um relatório detalhado com problemas encontrados e ações corretivas sugeridas.
</objective>

<execution_context>
Este comando verifica:
1. Se o pacote fase-ai está disponível via npx
2. Se os arquivos de configuração do FASE existem
3. Se os comandos estão disponíveis no runtime
4. Se há conflitos ou problemas de versão
</execution_context>

<process>
Execute as verificações abaixo e apresente o relatório formatado.

## Verificações a Realizar

### 1. Verificar Disponibilidade do Pacote via npx
```bash
npx fase-ai --version 2>/dev/null || echo "NAO_DISPONIVEL"
```

### 2. Verificar Versão do Pacote
```bash
npx fase-ai --version 2>/dev/null || echo "VERSAO_INDISPONIVEL"
```

### 3. Verificar Diretórios de Configuração
Para cada runtime, verifique se o diretório existe:

**Claude Code:**
```bash
test -d ./.claude && echo "EXISTS" || echo "NAO_EXISTE"
test -f ./.claude/settings.json && echo "EXISTS" || echo "NAO_EXISTE"
```

**OpenCode:**
```bash
test -d ./.opencode && echo "EXISTS" || echo "NAO_EXISTE"
test -f ./.opencode/opencode.json && echo "EXISTS" || echo "NAO_EXISTE"
```

**Gemini:**
```bash
test -d ./.gemini && echo "EXISTS" || echo "NAO_EXISTE"
test -f ./.gemini/settings.json && echo "EXISTS" || echo "NAO_EXISTE"
```

**Codex:**
```bash
test -d ./.codex && echo "EXISTS" || echo "NAO_EXISTE"
test -f ./.codex/config.toml && echo "EXISTS" || echo "NAO_EXISTE"
```

### 4. Verificar Comandos FASE Instalados
Para cada runtime configurado, liste os comandos FASE:

**Claude Code:**
```bash
ls ./.claude/commands/fase-*.md 2>/dev/null | wc -l || echo "0"
```

**OpenCode:**
```bash
ls ./.opencode/command/fase-*.md 2>/dev/null | wc -l || echo "0"
```

**Gemini:**
```bash
ls ./.gemini/commands/fase-*.toml 2>/dev/null | wc -l || echo "0"
```

**Codex:**
```bash
ls ./.codex/skills/fase-*/SKILL.md 2>/dev/null | wc -l || echo "0"
```

### 5. Verificar Hooks do FASE (se aplicável)
```bash
ls ./.claude/hooks/fase-*.js 2>/dev/null | wc -l || echo "0"
```

### 6. Verificar Arquivos de Workflows
```bash
test -d ~/.fase && echo "EXISTS" || echo "NAO_EXISTE"
test -d ~/.fase/workflows && echo "EXISTS" || echo "NAO_EXISTE"
ls -la ~/.fase/workflows/*.md 2>/dev/null | wc -l || echo "0"
```

## Formato do Relatório

Apresente o relatório neste formato:

```
═══════════════════════════════════════════════════════════
  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v{versão}
═══════════════════════════════════════════════════════════

<i class="fa fa-box"></i> INSTALAÇÃO DO PACOTE
  Status: {INSTALADO/NÃO_INSTALADO}
  Versão: {versão}
  Localização: {caminho}

<i class="fa fa-wrench"></i> RUNTIMES CONFIGURADOS
  Claude Code: {CONFIGURADO/NÃO_CONFIGURADO}
    - Settings: {OK/MISSING}
    - Comandos FASE: {N} encontrados
    - Hooks: {N} encontrados
  
  OpenCode: {CONFIGURADO/NÃO_CONFIGURADO}
    - Settings: {OK/MISSING}
    - Comandos FASE: {N} encontrados
  
  Gemini: {CONFIGURADO/NÃO_CONFIGURADO}
    - Settings: {OK/MISSING}
    - Comandos FASE: {N} encontrados
  
  Codex: {CONFIGURADO/NÃO_CONFIGURADO}
    - Config: {OK/MISSING}
    - Skills FASE: {N} encontradas

📁 WORKFLOWS FASE
  Diretório ~/.fase: {EXISTS/MISSING}
  Workflows disponíveis: {N}

<i class="fa fa-warning"></i> PROBLEMAS ENCONTRADOS
  {Lista de problemas encontrados}

💡 AÇÕES SUGERIDAS
  {Ações corretivas em ordem de prioridade}

═══════════════════════════════════════════════════════════
```

## Ações Corretivas por Problema

### Se pacote não disponível via npx:
```bash
# FASE é usado via npx - sempre baixa a versão mais recente
npx fase-ai
```

### Se Claude Code configurado mas sem comandos:
```bash
npx fase-ai --claude
```

### Se OpenCode configurado mas sem comandos:
```bash
npx fase-ai --opencode
```

### Se Gemini configurado mas sem comandos:
```bash
npx fase-ai --gemini
```

### Se Codex configurado mas sem commands:
```bash
npx fase-ai --codex
```

### Se workflows ausentes:
```bash
mkdir -p ~/.fase/workflows
# Copiar workflows do projeto atual ou reinstalar
npx fase-ai
```

### Se hooks ausentes (Claude Code):
```bash
# Reinstalar FASE para Claude Code
npx fase-ai --claude
```

### Se versão desatualizada:
```bash
# npx sempre usa a versão mais recente
npx fase-ai@latest

# Ou dentro do assistente:
/fase-atualizar
```

### Se conflitos de versão detectados:
```bash
# Limpar cache do npm
npm cache clean --force

# Usar npx para instalar
npx fase-ai --all
```

## Critérios de Saúde

**<i class="fa fa-check-circle"></i> Instalação Saudável:**
- Pacote disponível via npx
- Pelo menos um runtime configurado
- Comandos FASE presentes no runtime configurado
- Workflows disponíveis

**<i class="fa fa-warning"></i> Instalação Parcial:**
- Pacote disponível mas nenhum runtime configurado
- Runtime configurado mas sem comandos FASE
- Workflows ausentes

**<i class="fa fa-times-circle"></i> Instalação Problemática:**
- Pacote não disponível via npx
- Múltiplos problemas de configuração
- Conflitos de versão detectados
</process>

<output_format>
Apresente o relatório formatado conforme especificado acima.

Se todos os checks passaram, exiba:
```
<i class="fa fa-check-circle"></i> F.A.S.E. está instalado e configurado corretamente!
```

Se problemas foram encontrados, liste em ordem de prioridade:
1. Problemas críticos (instalação do pacote)
2. Problemas de configuração (runtimes)
3. Problemas de funcionalidade (comandos/hooks)
4. Melhorias opcionais (workflows adicionais)

Para cada problema, inclua o comando exato para corrigir.
</output_format>

<examples>
Exemplo de uso:
```bash
/fase-verificar-instalacao
```

Saída esperada (instalação saudável):
```
═══════════════════════════════════════════════════════════
  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v3.0.2
═══════════════════════════════════════════════════════════

<i class="fa fa-box"></i> INSTALAÇÃO DO PACOTE
  Status: INSTALADO
  Versão: 3.0.2
  Localização: /usr/local/lib/node_modules/fase-ai

<i class="fa fa-wrench"></i> RUNTIMES CONFIGURADOS
  Claude Code: CONFIGURADO
    - Settings: OK
    - Comandos FASE: 31 encontrados
    - Hooks: 6 encontrados
  
  OpenCode: NÃO_CONFIGURADO
    - Settings: MISSING
    - Comandos FASE: 0 encontrados
  
  Gemini: CONFIGURADO
    - Settings: OK
    - Comandos FASE: 31 encontrados
  
  Codex: NÃO_CONFIGURADO
    - Config: MISSING
    - Skills FASE: 0 encontradas

📁 WORKFLOWS FASE
  Diretório ~/.fase: EXISTS
  Workflows disponíveis: 12

<i class="fa fa-check-circle"></i> F.A.S.E. está instalado e configurado corretamente!

═══════════════════════════════════════════════════════════
```
</examples>
