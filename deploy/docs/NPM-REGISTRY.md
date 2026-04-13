# <i class="fa fa-box"></i> Configuração do npm Registry

O FASE está configurado para usar o **npm registry oficial** como fonte única de verdade para publicação e instalação.

## <i class="fa fa-wrench"></i> Configuração Atual

### Arquivo: `.npmrc` (raiz)

```
registry=https://registry.npmjs.org/
audit=true
engine-strict=true
```

### Arquivo: `bin/.npmrc` (pacote)

```
registry=https://registry.npmjs.org/
audit=true
```

---

## <i class="fa fa-rocket"></i> Instalação do FASE

### Via npx (recomendado)

```bash
# Usar npx - sempre busca a versão mais recente do registry oficial
npx fase-ai

# Ou específico para um runtime
npx fase-ai --claude
npx fase-ai --opencode
npx fase-ai --gemini
npx fase-ai --codex
```

### Observação sobre instalação global

FASE agora é instalado **apenas localmente** (por projeto) via `npx`. Isso garante:

- <i class="fa fa-check-circle"></i> Cada projeto usa a versão de FASE que foi testada com ele
- <i class="fa fa-check-circle"></i> Sem conflitos entre diferentes versões do FASE
- <i class="fa fa-check-circle"></i> Atualizações controladas por projeto
- <i class="fa fa-check-circle"></i> Menos poluição global no sistema

Para atualizar, basta usar `npx fase-ai@latest` que sempre baixa a versão mais recente.

---

## <i class="fa fa-check-circle"></i> Verificação

Para confirmar que está usando o registry correto:

```bash
# Ver registry configurado
npm config get registry

# Deve exibir:
# https://registry.npmjs.org/
```

---

## <i class="fa fa-list-check"></i> Para Contribuidores

Se você está desenvolvendo o FASE localmente:

```bash
# Clonar repositório
git clone https://github.com/isaaceliape/FASE.git
cd FASE

# Instalar dependências - usará .npmrc automaticamente
npm install

# Testar instalador localmente
node bin/install.js --help
```

O arquivo `.npmrc` garante que todos os contribuidores usem o mesmo registry.

---

## <i class="fa fa-lock"></i> Publicação

Quando publicamos no npm:

1. <i class="fa fa-check-circle"></i> GitHub Actions valida o pacote
2. <i class="fa fa-check-circle"></i> Autentica com `NPM_TOKEN` secret
3. <i class="fa fa-check-circle"></i> Publica em `https://registry.npmjs.org/`
4. <i class="fa fa-check-circle"></i> Fica disponível globalmente em minutos

---

## <i class="fa fa-globe"></i> Para Usuários Chineses

Se você está na China e a instalação é lenta:

### Opção 1: Usar cnpm
```bash
cnpm install -g fase-ai
```

### Opção 2: Configurar npm temporariamente
```bash
npm install -g fase-ai --registry=https://registry.npmmirror.com
```

### Opção 3: Configurar como default
```bash
npm config set registry https://registry.npmmirror.com
# Depois restaurar
npm config set registry https://registry.npmjs.org/
```

---

## <i class="fa fa-chart-bar"></i> Informações do Pacote

- **Pacote**: fase-ai
- **Registry Oficial**: https://registry.npmjs.org/
- **URL npm**: https://www.npmjs.com/package/fase-ai
- **Escopo**: Public (qualquer um pode instalar)

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
