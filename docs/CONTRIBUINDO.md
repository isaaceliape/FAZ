# 🤝 Guia de Contribuição

> **Versão**: 4.0.0 ✅ | Última atualização: 2026-04-20

Obrigado por considerar contribuir ao FASE! Este documento oferece diretrizes e instruções para participar do projeto.

## <i class="fa fa-list-check"></i> Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo. Comportamento abusivo deve ser reportado para maintainers.

## <i class="fa fa-bullseye"></i> Tipos de Contribuição

### 1. **Traduções** (Novos idiomas)

Se quiser traduzir FASE para outro idioma:

```bash
# Duplicar estrutura para novo idioma
cp -r bin/agentes bin/agentes-es    # Exemplo: espanhol
cp -r bin/comandos bin/comandos-es
```

1. Traduzir os arquivos `.md` no novo idioma
2. Criar issue descrevendo o idioma
3. Abrir PR com a tradução
4. Aguardar revisão

**Estrutura esperada:**
```
bin/agentes-{idioma}/
  ├── fase-planejador.{idioma}.md
  ├── fase-executor.{idioma}.md
  └── ...

bin/comandos-{idioma}/
  ├── ajuda.{idioma}.md
  ├── novo-projeto.{idioma}.md
  └── ...
```

### 2. **Novos Comandos**

Adicionar um novo comando ao FASE:

1. **Criar arquivo** em `bin/comandos/seu-comando.md`

```markdown
---
name: seu-comando
description: Descrição breve do que o comando faz
type: command
---

# /fase-seu-comando

Descrição detalhada.

## Uso

```bash
/fase-seu-comando [opções]
```

## Opções

- `--flag`: Descrição

## Exemplos

[Exemplos de uso]
```

2. **Atualizar** `bin/lib/commands.cjs` para registrar o comando
3. **Testar** localmente antes de submeter PR
4. **Documentar** em `docs/COMANDOS.md`

### 3. **Correções de Bugs**

1. Abrir issue descrevendo o bug
2. Forkar o repositório
3. Criar branch: `git checkout -b fix/descricao-do-bug`
4. Fazer commit com mensagem descritiva
5. Push para a branch: `git push origin fix/descricao-do-bug`
6. Abrir PR com detalhes

### 4. **Melhorias e Features**

1. Discutir no issue primeiro (para evitar trabalho duplicado)
2. Forkar e criar branch descritiva
3. Implementar com mensagens de commit claras
4. Adicionar testes se aplicável
5. Abrir PR com contextualização

## <i class="fa fa-wrench"></i> Setup Local

### Pré-requisitos

- Node.js >= 14.0.0
- Git
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/FASE.git
cd FASE

# Instalar dependências
npm install

# Instalar git hooks
npx husky install
```

### Teste o Instalador Localmente

```bash
# Teste com flags
node bin/install.js --help
node bin/install.js --claude --local

# Verifique se o pacote foi criado corretamente
npm run verificar
```

## 📝 Convenções de Commit

Siga o formato [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada opcional>

<footer opcional>
```

### Tipos

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças em documentação
- `style:` Formatação, sem mudança lógica
- `refactor:` Refatoração de código
- `test:` Adicionar ou atualizar testes
- `chore:` Tarefas de build, dependências

### Exemplos

```bash
# Feature nova
git commit -m "feat(comandos): adicionar /fase-novo-comando

Implementa novo comando que permite..."

# Correção
git commit -m "fix(install.js): corrigir bug ao criar diretório

Problema: o hook falhava ao criar .claude/
Solução: verificar se diretório existe antes"

# Documentação
git commit -m "docs: atualizar guia de instalação"
```

## 🧪 Testing

### Verificar Integridade do Pacote

```bash
cd bin
npm pack --dry-run
```

Isso simula a publicação no npm e mostra:
- <i class="fa fa-check-circle"></i> Quais arquivos serão inclusos
- <i class="fa fa-times-circle"></i> Erros de configuração
- <i class="fa fa-chart-bar"></i> Tamanho do pacote

### Testar Instalação

```bash
# Instalação local (projeto atual)
node bin/install.js --claude --local

# Instalar globalmente (seu computador)
node bin/install.js --claude --global

# Uninstall
node bin/install.js --uninstall
```

## 📖 Documentação

### Padrão de Escrita

- **Português brasileiro** em toda documentação em `.md`
- **Inglês** apenas para termos técnicos consagrados
- **Código e comandos** sempre em inglês (invariável)

### Estrutura de Documentação

```
docs/
├── GUIA-DO-USUARIO.md       # Guia para usuários
├── COMANDOS.md              # Lista de comandos
├── HOOKS.md                 # Git hooks setup
├── CONTEXT-MONITOR.md       # Monitoramento de contexto
└── CONTRIBUINDO.md          # Este arquivo
```

## <i class="fa fa-check-circle"></i> Checklist para PRs

Antes de submeter um PR, verifique:

- [ ] Branch criada a partir de `main`
- [ ] Commits seguem Conventional Commits
- [ ] Documentação atualizada
- [ ] Sem conflitos com `main`
- [ ] `npm pack --dry-run` passa sem erros
- [ ] Pre-commit hooks não falharam
- [ ] **Testes passando**: `npm run build && npm test`

## 🧪 Rodando Testes

FASE possui dois conjuntos de testes:

### Testes de Edge Cases (test/)
```bash
npm test                    # 41 testes de edge cases
npm run test:edge-cases     # Mesmo comando
```

### Testes Legacy (testes/)
```bash
npm run test:teses          # 17 arquivos de testes legacy
```

### Todos os Testes
```bash
npm run test:all            # Executa ambos os conjuntos
```

### Pré-requisitos
Os testes requerem build prévio:
```bash
npm run build && npm test
```

O helper de testes (`testes/test-helper.cjs`) valida automaticamente que o build foi executado.

### Escrevendo Novos Testes
Adicione novos testes em `test/` seguindo o padrão em `edge-cases.test.cjs`.
Veja [docs/TESTING.md](TESTING.md) para guia completo.

---

## <i class="fa fa-check-circle"></i> Checklist para PRs

1. **Automático**: GitHub Actions verifica integridade do pacote
2. **Automático**: Pre-commit hooks validam mudanças
3. **Manual**: Um maintainer revisa o código
4. **Merge**: Se aprovado, seu PR será merged

## 📞 Precisa de Ajuda?

- **Issues**: [GitHub Issues](https://github.com/isaaceliape/FASE/issues)
- **Discussões**: [GitHub Discussions](https://github.com/isaaceliape/FASE/discussions)
- **Email**: Abrir issue para contato

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](https://github.com/isaaceliape/FASE/blob/main/LICENSE).

---

**Obrigado por contribuir! 🙌**

Cada contribuição, pequena ou grande, ajuda a melhorar FASE para a comunidade brasileira.
