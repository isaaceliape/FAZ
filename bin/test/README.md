# Testes de Instalação do FASE

Suite abrangente de testes para instalações do FASE em diferentes provedores (Claude Code, OpenCode, Gemini e Codex).

## Arquivos de Teste

### `install.test.js`
Testes de instalação central cobrindo:
- Criação de diretórios
- Escrita de arquivos e tratamento de erros
- Configuração de package.json
- Construção de caminhos
- Mensagens de erro e debug

**Executar com:**
```bash
npm run test:install
```

### `providers.test.js`
Testes de configuração específica de provedor cobrindo:
- Estrutura de diretório para cada provedor
- Tratamento de variáveis de ambiente
- Formatos de arquivo de configuração
- Configurações de atribuição
- Arquivos de hook
- Expansão de caminhos
- Prevenção de configuração duplicada
- Tratamento de permissões
- Instalações multi-provedor

**Executar com:**
```bash
npm run test:providers
```

### `integration.test.js`
Testes de integração cobrindo:
- Instalações globais
- Instalações locais (de projeto)
- Diretórios de configuração customizados
- Múltiplas instalações de provedor
- Gerenciamento de versão
- Persistência de configuração
- Desinstalação
- Cenários de tratamento de erro

**Executar com:**
```bash
npm run test:integration
```

### `docker-test.js`
Testes de simulação de ambiente Docker cobrindo:
- Instalações em container Alpine
- Instalações em container Ubuntu
- Instalações macOS ARM64
- Builds Docker multi-estágio
- Variáveis de ambiente em containers
- Configurações de volume mounting
- Scripts de instalação
- Suporte multiplataforma
- Health checks

**Executar com:**
```bash
npm run test:docker
```

## Executando Todos os Testes

Executar a suite completa de testes:
```bash
npm test
```

Modo watch (re-executar em mudanças de arquivo):
```bash
npm run test:watch
```

Gerar relatório de cobertura de testes:
```bash
npm run test:coverage
```

## Suporte de Provedor

### Claude Code
- Diretório: `~/.claude`
- Variável de Ambiente: `CLAUDE_CONFIG_DIR`
- Arquivo de Configuração: `settings.json`

### OpenCode
- Diretório: `~/.config/opencode` (padrão XDG)
- Variáveis de Ambiente: `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`
- Arquivo de Configuração: `opencode.json`

### Gemini
- Diretório: `~/.gemini`
- Variável de Ambiente: `GEMINI_CONFIG_DIR`
- Arquivo de Configuração: `settings.json`

### Codex
- Diretório: `~/.codex`
- Variável de Ambiente: `CODEX_HOME`
- Arquivo de Configuração: `settings.json`

## Padronização de Caminhos

FASE usa referências de caminho padronizadas em todos os arquivos de comando e agente:

### Caminhos Padrão
- **Comandos**: `comandos/*.md` usam `@~/.fase/` para todas as referências de workflow
- **Agentes**: `agentes/*.md` usam `@~/.fase/` para todas as referências de template
- **Installer**: Converte `@~/.fase/` para caminhos específicos de runtime durante a instalação

### Caminhos de Instalação
O installer (`bin/install.js`) converte caminhos de origem:
- Claude Code: `~/.claude/fase/`
- OpenCode: `~/.config/opencode/fase/`
- Gemini: `~/.gemini/fase/`
- Codex: `~/.codex/fase/`

### Verificação de Teste
- Todos os 32 comandos seguem a convenção `@~/.fase/`
- Todos os 12 agentes seguem a convenção `@~/.fase/`
- Substituição de caminho testada em install.test.js
- Convenção de nomenclatura de arquivo: todos `.md` (sem arquivos `.pt.md`)

## Testes com Docker

### Compilar e Testar em Docker

Executar testes em container Alpine Linux:
```bash
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm test
```

Executar testes em container Ubuntu:
```bash
docker run --rm -v $(pwd):/app -w /app node:18-ubuntu npm test
```

### Teste de Instalação em Docker

Testar instalação do Claude:
```bash
docker run --rm node:18-alpine sh -c "npm install -g fase-ai && fase-ai --claude --global"
```

Testar todos os provedores:
```bash
docker run --rm node:18-alpine sh -c "npm install -g fase-ai && fase-ai --all --global"
```

## Simulando Ambientes Limpos

A suite de testes simula ambientes Docker limpos sem requerer Docker real:

```javascript
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-test-'));
// Testes rodam em diretório temporário isolado
fs.rmSync(tempDir, { recursive: true });
```

Esta abordagem permite:
- <i class="fa fa-check"></i> Execução rápida de testes
- <i class="fa fa-check"></i> Sem instalação de Docker necessária
- <i class="fa fa-check"></i> Compatibilidade multiplataforma
- <i class="fa fa-check"></i> Fácil integração com CI/CD

## Cobertura de Testes

Cobertura atual:
- **Métodos de Instalação**: Local, Global, Diretórios customizados
- **Provedores**: Claude Code, OpenCode, Gemini, Codex
- **Cenários**: Instalações limpas, upgrades, desinstalações, múltiplos provedores
- **Ambientes**: Alpine, Ubuntu, macOS, caminhos Windows
- **Casos de Erro**: Erros de permissão, diretórios faltantes, arquivos corrompidos

## Adicionando Novos Testes

Para adicionar testes para um novo provedor:

1. Adicionar configuração de provedor a `providers.test.js`:
```javascript
{
  name: 'newprovider',
  dir: '.newprovider',
  env: 'NEWPROVIDER_CONFIG_DIR'
}
```

2. Adicionar testes de instalação a `integration.test.js`

3. Adicionar testes de simulação Docker a `docker-test.js`

## Resolução de Problemas

### Testes falham com erros de permissão
Garantir que o diretório temporário seja gravável:
```bash
ls -la /tmp | grep fase-test
```

### Testes expiram (timeout)
Aumentar timeout do Mocha:
```bash
npm test -- --timeout 10000
```

### Variáveis de ambiente interferem
Testes salvam e restauram o ambiente original:
```javascript
beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});
```

## Integração com CI/CD

### Exemplo GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: cd bin && npm install
      - run: cd bin && npm test
```

## Documentação Relacionada

- [Guia de Instalação](../../README.md)
- [Documentação de Arquitetura](../../www/docs)
- [Diretrizes de Contribuição](../../CONTRIBUTING.md)
