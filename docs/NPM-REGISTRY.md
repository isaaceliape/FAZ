# 📦 Configuração do npm Registry

> **Versão**: 3.2.0 | Última atualização: 2026-03-25

O FASE está configurado para usar o **npm registry oficial** como fonte única de verdade para publicação e instalação.

## 🔧 Configuração Atual

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

## 🚀 Instalação do FASE

### Via npm (recomendado)

```bash
# Usar npm padrão - sempre busca do registry oficial
npm install -g fase-ai

# Ou específico
npm install -g fase-ai@latest
```

### Se estiver usando cnpm

```bash
# Especificar registry explicitamente
npm install -g fase-ai --registry=https://registry.npmjs.org/

# Ou configurar como default
npm config set registry https://registry.npmjs.org/
```

---

## ✅ Verificação

Para confirmar que está usando o registry correto:

```bash
# Ver registry configurado
npm config get registry

# Deve exibir:
# https://registry.npmjs.org/
```

---

## 📋 Para Contribuidores

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

## 📊 Informações do Pacote

- **Pacote**: fase-ai
- **Registry Oficial**: https://registry.npmjs.org/
- **URL npm**: https://www.npmjs.com/package/fase-ai
- **Escopo**: Public (qualquer um pode instalar)

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
