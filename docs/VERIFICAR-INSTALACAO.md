# Verificar Instalação - Documentação

> **Versão**: 3.2.0 | Última atualização: 2026-03-25

## Visão Geral

O comando `verificar-instalacao` é uma ferramenta de diagnóstico que verifica o status da instalação do F.A.S.E. no sistema e gera um relatório detalhado com problemas encontrados e ações corretivas sugeridas.

## Uso

### Via npm (recomendado)

```bash
npm run verificar-instalacao
```

### Direto

```bash
node bin/verificar-instalacao.js
```

### Dentro do FASE (após instalação)

```bash
/fase-verificar-instalacao
```

## O Que É Verificado

### 1. Instalação do Pacote
- ✅ Verifica se `fase-ai` está instalado globalmente via npm
- ✅ Mostra a versão instalada
- ✅ Mostra o local de instalação

### 2. Runtimes Configurados
Para cada runtime suportado:

**Claude Code:**
- Diretório `~/.claude`
- Arquivo `settings.json`
- Comandos FASE (`fase-*.md`)
- Hooks FASE (`fase-*.js`)

**OpenCode:**
- Diretório `~/.config/opencode`
- Arquivo `opencode.json`
- Comandos FASE (`fase-*.md`)

**Gemini:**
- Diretório `~/.gemini`
- Arquivo `settings.json`
- Comandos FASE (`fase-*.toml`)

**Codex:**
- Diretório `~/.codex`
- Arquivo `config.toml`
- Skills FASE (`fase-*/SKILL.md`)

### 3. Workflows FASE
- Diretório `~/.fase`
- Subdiretório `~/.fase/workflows`
- Arquivos de workflow (`.md`)

## Saída do Relatório

O relatório é dividido em seções:

```
═══════════════════════════════════════════════════════════
  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v3.0.2
═══════════════════════════════════════════════════════════

📦 INSTALAÇÃO DO PACOTE
  Status: INSTALADO/NÃO INSTALADO
  Versão: X.Y.Z
  Localização: /caminho/para/pacote

🔧 RUNTIMES CONFIGURADOS
  Claude Code: CONFIGURADO/NÃO_CONFIGURADO
    - Settings: OK/MISSING
    - Comandos FASE: N encontrados
    - Hooks: N encontrados
  
  OpenCode: CONFIGURADO/NÃO_CONFIGURADO
    - Settings: OK/MISSING
    - Comandos FASE: N encontrados
  
  Gemini: CONFIGURADO/NÃO_CONFIGURADO
    - Settings: OK/MISSING
    - Comandos FASE: N encontrados
  
  Codex: CONFIGURADO/NÃO_CONFIGURADO
    - Config: OK/MISSING
    - Skills FASE: N encontradas

📁 WORKFLOWS FASE
  Diretório ~/.fase: EXISTS/MISSING
  Workflows disponíveis: N

⚠️ PROBLEMAS ENCONTRADOS
  1. Problema 1
  2. Problema 2
  ...

💡 AÇÕES SUGERIDAS
  1. Problema
     Comando: comando-para-corrigir
     Descrição

═══════════════════════════════════════════════════════════
```

## Critérios de Saúde

### ✅ Instalação Saudável
- Pacote instalado globalmente
- Pelo menos um runtime configurado
- Comandos FASE presentes no runtime configurado
- Workflows disponíveis

### ⚠️ Instalação Parcial
- Pacote instalado mas nenhum runtime configurado
- Runtime configurado mas sem comandos FASE
- Workflows ausentes

### ❌ Instalação Problemática
- Pacote não instalado
- Múltiplos problemas de configuração
- Conflitos de versão detectados

## Ações Corretivas Comuns

### Pacote Não Instalado
```bash
npm install -g fase-ai@latest
```

### Claude Code Sem Comandos
```bash
npx fase-ai --claude
```

### OpenCode Sem Comandos
```bash
npx fase-ai --opencode
```

### Gemini Sem Comandos
```bash
npx fase-ai --gemini
```

### Codex Sem Comandos
```bash
npx fase-ai --codex
```

### Workflows Ausentes
```bash
mkdir -p ~/.fase/workflows
# Copiar workflows do projeto ou reinstalar
npx fase-ai
```

### Atualizar Versão
```bash
npm update -g fase-ai
# Ou dentro do assistente:
/fase-atualizar
```

### Reinstalação Completa
```bash
npm uninstall -g fase-ai
npm install -g fase-ai@latest
npx fase-ai --all
```

## Código de Saída

- `0` - Instalação saudável, sem problemas
- `1` - Problemas encontrados (ver relatório)

## Exemplo de Saída

### Instalação Saudável

```
═══════════════════════════════════════════════════════════
  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v3.0.2
═══════════════════════════════════════════════════════════

📦 INSTALAÇÃO DO PACOTE
  ✓ Status: INSTALADO
  ✓ Versão: 3.0.2
  ✓ Localização: /usr/local/lib/node_modules/fase-ai

🔧 RUNTIMES CONFIGURADOS

  Claude Code: CONFIGURADO
    ✓ Settings: OK
    ✓ Comandos FASE: 32 encontrados
    ✓ Hooks: 6 encontrados

  OpenCode: NÃO_CONFIGURADO
    - Settings: MISSING
    - Comandos FASE: 0 encontrados

  Gemini: CONFIGURADO
    ✓ Settings: OK
    ✓ Comandos FASE: 32 encontrados

  Codex: NÃO_CONFIGURADO
    - Config: MISSING
    - Skills FASE: 0 encontradas

📁 WORKFLOWS FASE
  ✓ Diretório ~/.fase: EXISTS
  ✓ Workflows disponíveis: 12

═══════════════════════════════════════════════════════════

  ✅ F.A.S.E. está instalado e configurado corretamente!

═══════════════════════════════════════════════════════════
```

### Instalação com Problemas

```
═══════════════════════════════════════════════════════════
  RELATÓRIO DE VERIFICAÇÃO F.A.S.E. v3.0.2
═══════════════════════════════════════════════════════════

📦 INSTALAÇÃO DO PACOTE
  ✗ Status: NÃO INSTALADO

🔧 RUNTIMES CONFIGURADOS

  Claude Code: CONFIGURADO
    ✓ Settings: OK
    ✗ Comandos FASE: 0 encontrados
    ⚠ Hooks: 0 encontrados

  [...]

═══════════════════════════════════════════════════════════

  ⚠️  6 PROBLEMA(S) ENCONTRADO(S):

  1. Pacote fase-ai não instalado globalmente
  2. Claude Code: Sem comandos FASE instalados
  3. OpenCode: Sem comandos FASE instalados
  4. Gemini: Sem comandos FASE instalados
  5. Codex: Sem comandos FASE instalados
  6. Diretório ~/.fase não existe

  💡 AÇÕES SUGERIDAS:

  1. Pacote não instalado
     Comando: npm install -g fase-ai@latest
     Instalar FASE globalmente

  2. Claude Code sem comandos
     Comando: npx fase-ai --claude
     Instalar comandos FASE para Claude Code

  [...]

═══════════════════════════════════════════════════════════
```

## Desenvolvimento

### Estrutura do Arquivo

- `bin/verificar-instalacao.js` - Script principal
- `bin/test/verificar-instalacao.test.js` - Testes
- `comandos/verificar-instalacao.md` - Comando em português
- `bin/comandos/check-installation.md` - Comando em inglês (deprecated)

### Executar Testes

```bash
cd bin
npm test -- test/verificar-instalacao.test.js
```

### Adicionar Novas Verificações

1. Adicione a lógica de verificação em `verificar-instalacao.js`
2. Adicione entradas na lista de `issues` se problema encontrado
3. Adicione sugestões na lista de `suggestions`
4. Atualize os testes
5. Atualize esta documentação

## Integração com Comandos FASE

O comando também está disponível como `/fase-verificar-instalacao` dentro dos assistentes, permitindo que o próprio FASE verifique sua instalação e sugira correções.

## Troubleshooting

### Permissões de Escrita

Se receber erros de permissão, execute com `sudo`:

```bash
sudo npm run verificar-instalacao
```

### Caminhos Customizados

Se seus runtimes usam caminhos customizados, o comando ainda verifica os caminhos padrão. Para verificar caminhos customizados, use:

```bash
CLAUDE_CONFIG_DIR=/custom/path node bin/verificar-instalacao.js
```

### Falso Positivo

Às vezes o comando pode reportar 0 comandos mesmo após instalação. Isso pode acontecer se:
- Instalação foi feita em diretório customizado
- Permissões de arquivo estão incorretas
- Links simbólicos estão quebrados

Nesses casos, verifique manualmente:

```bash
ls ~/.claude/commands/fase-*.md
```

## FAQ

**P: Por que mostra 0 comandos mesmo após instalar?**
R: Verifique se instalou para o runtime correto. Execute `npx fase-ai --claude` (ou outro runtime).

**P: O que fazer se múltiplos runtimes têm problemas?**
R: Use `npx fase-ai --all` para instalar para todos de uma vez.

**P: Workflows são obrigatórios?**
R: Não, mas são altamente recomendados. Muitos comandos FASE dependem deles.

**P: Posso usar em CI/CD?**
R: Sim! O código de saída `0` ou `1` permite integração com pipelines.

---

**Versão:** 1.0.0  
**Última atualização:** Março 2026
