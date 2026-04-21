# Guia de Testes do FASE

Suite completa de testes para FASE (Framework de Automação Sem Enrolação) em todos os provedores suportados e métodos de instalação.

## 📋 Visão Geral

Esta suite de testes oferece cobertura abrangente para:
- **4 Provedores**: Claude Code, OpenCode, Gemini, Codex
- **3 Métodos de Instalação**: Global, Local, Diretórios customizados
- **Múltiplos Ambientes**: Alpine, Ubuntu, macOS, caminhos Windows
- **Casos Extremos**: Symlinks, caminhos longos, caracteres especiais, permissões

## 🚀 Início Rápido

### Executar Todos os Testes
```bash
npm test
```

### Executar Suite Específica de Testes
```bash
npm run test:install      # Testes de instalação
npm run test:providers    # Testes de configuração de provedor
npm run test:integration  # Testes de integração
npm run test:docker       # Simulações de ambiente Docker
npm run test:edge-cases   # Casos extremos e cenários complexos
```

### Modo Watch (Auto-reload em mudanças)
```bash
npm run test:watch
```

## 🐳 Testes com Docker

### Pré-requisitos
- Docker instalado e rodando
- Docker Compose (opcional, para testes avançados)

### Executar Testes em Docker
```bash
# Executar todos os testes em Docker
npm run test:docker:all

# Executar testes específicos de provedor
cd test && bash run-docker-tests.sh --claude
cd test && bash run-docker-tests.sh --opencode
cd test && bash run-docker-tests.sh --gemini
cd test && bash run-docker-tests.sh --codex

# Testar todos os provedores
cd test && bash run-docker-tests.sh --all-providers

# Testar em SO específico
cd test && bash run-docker-tests.sh --ubuntu
cd test && bash run-docker-tests.sh --alpine

# Limpar containers de teste
npm run test:docker:clean
```

### Usando Docker Compose
```bash
# Executar serviço específico
docker-compose -f test/docker-compose.yml run --rm claude-test

# Executar todos os serviços
docker-compose -f test/docker-compose.yml up --abort-on-container-exit

# Ver logs
docker-compose -f test/docker-compose.yml logs -f
```

## 📁 Arquivos de Teste

### `install.test.js` (Instalação Básica)
- Criação de diretórios
- Escrita de arquivos e tratamento de erros
- Configuração de package.json
- Construção de caminhos
- Tratamento de erros e mensagens

**Executar:** `npm run test:install`

### `providers.test.js` (Configuração de Provedor)
- Estrutura de diretório por provedor
- Variáveis de ambiente (CLAUDE_CONFIG_DIR, OPENCODE_CONFIG_DIR, GEMINI_CONFIG_DIR, CODEX_HOME)
- Formatos de arquivo de configuração (JSON, compatibilidade INI)
- Configurações de atribuição e mensagens de commit
- Gerenciamento de arquivos de hook
- Expansão de caminhos (~/.claude, ~/.config/opencode, etc.)
- Prevenção de duplicatas
- Tratamento de permissões
- Instalações multi-provedor

**Executar:** `npm run test:providers`

### `integration.test.js` (Ponta-a-Ponta)
- Instalações globais
- Instalações locais/de projeto
- Diretórios de configuração customizados
- Instalações multi-provedor
- Gerenciamento de versão e atualizações
- Persistência de configuração
- Desinstalação e limpeza
- Cenários de recuperação de erros

**Executar:** `npm run test:integration`

### `docker-test.js` (Simulações Docker)
- Instalações limpas em container Alpine
- Instalações limpas em container Ubuntu
- Ambientes macOS ARM64
- Builds Docker multi-estágio
- Variáveis de ambiente em containers
- Cenários de volume mounting
- Scripts de instalação
- Tratamento de caminhos multiplataforma
- Health checks

**Executar:** `npm run test:docker`

### `edge-cases.test.js` (Cenários Complexos)
- Tratamento de symlinks
- Nomes de caminho longos (30+ níveis de profundidade)
- Caracteres especiais (espaços, hífens, pontos)
- Arquivos de configuração grandes (10KB+)
- Operações concorrentes
- Cenários de migração e rollback
- Casos extremos de espaço em disco
- Restrições de permissão
- Condições de corrida
- Tratamento de UTF-8 e emoji
- Compatibilidade retroativa

**Executar:** `npm run test:edge-cases`

## 🏗️ Arquivos Docker

### `Dockerfile.test`
Imagem de teste baseada em Alpine que:
- Instala dependências
- Executa suite completa de testes
- Testa cada provedor individualmente
- Verifica todas as instalações

Compilar e executar:
```bash
docker build -f test/Dockerfile.test -t fase-test ..
docker run --rm fase-test
```

### `docker-compose.yml`
Serviços para testar diferentes cenários:
- `test`: Suite completa de testes
- `claude-test`: Instalação apenas do Claude
- `opencode-test`: Instalação apenas do OpenCode
- `gemini-test`: Instalação apenas do Gemini
- `codex-test`: Instalação apenas do Codex
- `all-test`: Todos os provedores simultaneamente
- `ubuntu-test`: Testes baseados em Ubuntu
- `alpine-test`: Testes baseados em Alpine

### `run-docker-tests.sh`
Script runner inteligente com opções:

```bash
./test/run-docker-tests.sh --help

# Exemplos:
./test/run-docker-tests.sh --all              # Executar tudo
./test/run-docker-tests.sh --claude --opencode # Provedores específicos
./test/run-docker-tests.sh --ubuntu           # SO específico
./test/run-docker-tests.sh --cleanup          # Remover dados de teste
```

## 📊 Estrutura de Teste

Cada arquivo de teste segue este padrão:

```javascript
describe('Grupo de Funcionalidade', () => {
  beforeEach(() => {
    // Setup (criar diretório temporário, etc.)
  });

  afterEach(() => {
    // Limpeza (remover arquivos temporários, restaurar env)
  });

  describe('Suite de Teste Específica', () => {
    it('should do something specific', () => {
      // Arrange
      const expectedResult = 'value';

      // Act
      const actualResult = someFunction();

      // Assert
      assert.strictEqual(actualResult, expectedResult);
    });
  });
});
```

## 🔍 Detalhes de Provedor

### Claude Code
```
Config Dir:     ~/.claude
Env Var:        CLAUDE_CONFIG_DIR
Config File:    settings.json
Default Path:   /Users/<user>/.claude
Hook Example:   /Users/<user>/.claude/hooks/my-hook.js
```

### OpenCode
```
Config Dir:     ~/.config/opencode (padrão XDG)
Env Vars:       OPENCODE_CONFIG_DIR, OPENCODE_CONFIG, XDG_CONFIG_HOME
Config File:    opencode.json
Default Path:   /Users/<user>/.config/opencode
Hook Example:   /Users/<user>/.config/opencode/hooks/my-hook.js
```

### Gemini
```
Config Dir:     ~/.gemini
Env Var:        GEMINI_CONFIG_DIR
Config File:    settings.json
Default Path:   /Users/<user>/.gemini
Hook Example:   /Users/<user>/.gemini/hooks/my-hook.js
```

### Codex
```
Config Dir:     ~/.codex
Env Var:        CODEX_HOME
Config File:    settings.json
Default Path:   /Users/<user>/.codex
Hook Example:   /Users/<user>/.codex/hooks/my-hook.js
```

## 🔄 Testes de Padronização de Caminhos

Comandos e agentes do FASE usam referências de caminho padronizadas e agnósticas de ambiente que são convertidas durante a instalação:

### Convenção de Arquivo Fonte
- **Localização**: `.github/commands/*.md` e `.github/agents/*.md`
- **Padrão de Caminho**: `@~/.fase/workflows/`, `@~/.fase/templates/`, `$HOME/.fase/`
- **Propósito**: Referências universais que funcionam em todos os runtimes

### Substituição de Caminho do Installer
O installer (`dist/install.js`) converte caminhos de origem para localizações específicas de runtime:

| Runtime | Padrão de Origem | Caminho Instalado |
|---------|---|---|
| Claude Code | `@~/.fase/` | `~/.claude/fase/` |
| OpenCode | `@~/.fase/` | `~/.config/opencode/fase/` |
| Gemini | `@~/.fase/` | `~/.gemini/fase/` |
| Codex | `@~/.fase/` | `~/.codex/fase/` |

### Cobertura de Testes
- ✅ Todos os 32 arquivos de comando usam padrão `@~/.fase/`
- ✅ Todos os 12 arquivos de agente usam padrão `@~/.fase/`
- ✅ Nenhuma referência de arquivo `.pt.md` restante (todos renomeados para `.md`)
- ✅ Substituição de caminho funciona nas três funções de cópia do installer
- ✅ OpenCode recebe caminhos corretamente formatados `~/.config/opencode/fase/`

### Testes Relacionados
- **`testes/phase.test.cjs`** - Valida formatos de caminho de contexto de execução
- **`testes/agent-frontmatter.test.cjs`** - Valida consistência de arquivo de agente
- **`test/install.test.js`** - Testa construção básica de caminho e operações de arquivo

## 🛠️ Comandos Comuns

### Instalação Limpa
```bash
npm test                    # Executar todos os testes
npm run test:providers      # Verificar setup de provedor
npm run test:integration    # Testar fluxo completo
```

### Pipeline CI/CD
```bash
npm test                           # Testes unitários
npm run test:docker:all           # Testes Docker
npm run test:coverage             # Gerar relatório
```

### Desenvolvimento
```bash
npm run test:watch                # Modo watch
npm run test:providers            # Verificação rápida de provedor
npm run test:edge-cases           # Validação de casos extremos
```

### Debug
```bash
# Executar teste único
npx mocha test/install.test.js --grep "Directory Creation"

# Output verboso
npm test -- --reporter spec

# Mostrar testes lentos
npm test -- --reporter spec --slow 100
```

## 📈 Metas de Cobertura

Cobertura atual:
- ✅ Métodos de instalação: Local, Global, Customizado
- ✅ Provedores: Claude, OpenCode, Gemini, Codex
- ✅ Ambientes: Alpine, Ubuntu, macOS
- ✅ Cenários de erro: Permissões, diretórios faltantes, arquivos corrompidos
- ✅ Casos extremos: Symlinks, caminhos longos, caracteres especiais
- ✅ Concorrência: Múltiplas instalações, ciclos rápidos

Alvo: >90% de cobertura de código

Gerar relatório de cobertura:
```bash
npm run test:coverage
```

## 🐛 Resolução de Problemas

### Testes falham com erros de permissão
```bash
# Verificar permissões do diretório temporário
ls -la /tmp | grep fase-test

# Limpar diretórios de teste antigos
rm -rf /tmp/fase-*
```

### Testes Docker falham
```bash
# Verificar se Docker está rodando
docker ps

# Puxar imagens atualizadas
docker-compose pull

# Recompilar imagens
docker-compose build --no-cache
```

### Conflitos de variáveis de ambiente
Testes salvam e restauram automaticamente `process.env`:
```javascript
originalEnv = { ...process.env };
// ... testes rodam ...
process.env = originalEnv;
```

### Problemas de timeout
Aumentar timeout do Mocha (padrão 2000ms):
```bash
npx mocha test/*.test.js --timeout 10000
```

## 📝 Adicionando Novos Testes

1. **Criar arquivo de teste** no diretório `test/`
2. **Seguir nomenclatura**: `feature.test.js`
3. **Usar padrão padrão**:
   ```javascript
   const assert = require('assert');
   describe('Feature', () => {
     it('should do X', () => {
       assert.strictEqual(actual, expected);
     });
   });
   ```
4. **Adicionar aos scripts do package.json**:
   ```json
   "test:feature": "mocha test/feature.test.js"
   ```
5. **Atualizar este arquivo** com documentação de teste

## 🔗 Integração com CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: npm test

- name: Docker Tests
  run: bash test/run-docker-tests.sh --all
```

### GitLab CI
```yaml
test:
  image: node:18-alpine
  script:
    - npm install
    - npm test
```

## 📚 Documentação Relacionada

- [Guia de Instalação](../../README.md)
- [Diretrizes de Contribuição](../../CONTRIBUTING.md)
- [Documentação de Provedor](../../www/docs)

## 📞 Suporte

Para problemas de teste ou melhorias:
- Verificar seção [Resolução de Problemas](#-resolução-de-problemas)
- Revisar output de teste para mensagens de erro específicas
- Abrir uma issue no GitHub com logs de teste

---

**Última Atualização:** 2026-03-18
**Versão da Suite de Testes:** 1.0.0
**Provedores Suportados:** Claude Code, OpenCode, Gemini, Codex
