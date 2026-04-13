# Git Hooks - Segurança de Commits

Os hooks do git garantem que nenhum pacote quebrado seja publicado no npm.

## <i class="fa fa-lock"></i> O que é verificado

### Pre-commit Hook (`.husky/pre-commit`)

Antes de cada commit, o hook verifica:

1. <i class="fa fa-check-circle"></i> **Integridade do pacote npm**
   - Testa se `npm pack --dry-run` funciona
   - Verifica se há arquivos no pacote

2. <i class="fa fa-check-circle"></i> **Arquivos essenciais**
   - `install.js` (CLI principal)
   - `lib/core.cjs` e outros módulos
   - `package.json` (válido)

3. <i class="fa fa-check-circle"></i> **Diretórios obrigatórios**
   - `agentes/` (12 agent definitions)
   - `comandos/` (32 command definitions)

## <i class="fa fa-rocket"></i> Instalação

Os hooks são instalados automaticamente ao instalar dependências:

```bash
npm install
npm run prepare
```

## 🧪 Testar os hooks

Para verificar manualmente se tudo está correto:

```bash
cd bin
npm pack --dry-run

# Ou use o script:
npm run verificar
```

## <i class="fa fa-warning"></i> Contornar hooks (não recomendado)

Se você **realmente** precisa ignorar um hook:

```bash
git commit --no-verify
```

<i class="fa fa-warning"></i> **Use apenas em emergências!** Commits sem verificação podem quebrar a publicação.

## 📚 Referência

- [Husky - Git Hooks Simplificado](https://typicode.github.io/husky/)
- [Git Hooks Nativos](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

## 🆘 Troubleshooting

### Hook não está rodando

```bash
# Reinstalar hooks
npx husky install
```

### Permissão negada ao executar

```bash
# Garantir que o hook é executável
chmod +x .husky/pre-commit
```

### Hook falha mas quero commitar mesmo

Consulte <i class="fa fa-warning"></i> acima, mas first:
1. Abra uma issue descrevendo o problema
2. Execute `npm pack --dry-run` para ver o erro real
