# CI/CD Pipeline - Configuração de Branch Protection

**Data:** 2026-04-23  
**Requisito:** REQ-017 - Tests required before merge  
**Status:** Guia de configuração para GitHub Settings

---

## Visão Geral

Este documento descreve como configurar **Branch Protection Rules** no GitHub para garantir que todo código mergeado na branch `main` passe pelos checks de qualidade automatizados.

### Propósito

- **Quality Gate:** Impedir merge de código que não passe nos testes
- **Fail-Fast:** Lint/format check roda ANTES dos testes (feedback mais rápido)
- **Multi-Platform:** Testes em Linux e macOS, Node 20 e 22
- **Coverage:** Relatórios de coverage em pushes para main

### Escopo

- Branch: `main`
- Tipo: GitHub Repository Settings (não código)
- Requer: Acesso de administrador ao repositório

---

## Required Status Checks

Os seguintes jobs DEVEM passar antes do merge:

### 1. Lint & Format Check

| Job Name | Descrição | Workflow |
|----------|-----------|----------|
| `lint` | ESLint + Prettier check | `.github/workflows/test.yml` |

**O que verifica:**
- Código segue padrões ESLint
- Código está formatado com Prettier
- **Fail-Fast:** Se falhar, testes nem rodam

### 2. Testes Unitários - Linux

| Job Name | Node Version | OS |
|----------|--------------|-----|
| `test-linux (Node 20)` | Node 20.x | ubuntu-latest |
| `test-linux (Node 22)` | Node 22.x | ubuntu-latest |

**O que verifica:**
- Todos os testes unitários passam
- Compatibilidade com Node 20 e 22

### 3. Testes Unitários - macOS

| Job Name | Node Version | OS |
|----------|--------------|-----|
| `test-macos (Node 20)` | Node 20.x | macos-latest |
| `test-macos (Node 22)` | Node 22.x | macos-latest |

**O que verifica:**
- Todos os testes unitários passam
- Compatibilidade cross-platform

### 4. Testes de Integração

| Job Name | Descrição | Workflow |
|----------|-----------|----------|
| `integration-test` | Multi-provider tests | `.github/workflows/test.yml` |

**O que verifica:**
- Fluxos de instalação completos
- Integração entre providers

### 5. Coverage Report (Opcional)

| Job Name | Descrição | Trigger |
|----------|-----------|---------|
| `report` | Coverage aggregation | Push to main only |

**Nota:** Coverage job roda APÓS todos os testes passarem. Threshold de 80% é verificado apenas em pushes para main.

---

## Passo a Passo: Configuração no GitHub

### Pré-requisitos

- ✅ Acesso de **administrador** ao repositório
- ✅ Workflow `test.yml` configurado e funcionando
- ✅ Pelo menos um PR com workflow rodando (para popular lista de checks)

### Passo 1: Navegar para Settings

1. Acesse o repositório no GitHub
2. Clique na aba **Settings** (ícone de engrenagem)
3. No menu lateral esquerdo, clique em **Branches**

### Passo 2: Adicionar Branch Protection Rule

1. Clique no botão **"Add rule"** (ou "Add branch protection rule")
2. No campo **"Branch name pattern"**, digite: `main`

### Passo 3: Configurar Status Checks Obrigatórios

Na seção **"Protect matching branches"**:

#### 3.1. Require status checks to pass before merging

Marque esta opção ☑️

#### 3.2. Status checks that are required

Na caixa de busca, digite e selecione os seguintes checks:

```
lint
test-linux (Node 20)
test-linux (Node 22)
test-macos (Node 20)
test-macos (Node 22)
integration-test
```

> **Nota:** Os checks só aparecem na lista após o workflow rodar pelo menos uma vez. Crie um PR de teste se a lista estiver vazia.

#### 3.3. Require branches to be up to date before merging

Marque esta opção ☑️

Isso garante que a branch está atualizada com `main` antes do merge, evitando conflitos.

### Passo 4: Configurar Admin Override (Opcional, mas recomendado)

Na seção **"Rules applied to everyone including administrators"**:

#### Opção A: Allow specific actors to bypass branch protection (Recomendado)

1. Marque ☑️ **"Allow specific actors to bypass branch protection"**
2. Selecione o usuário/grupo que pode fazer bypass (ex: admin)
3. Útil para hotfixes emergenciais

#### Opção B: Include administrators (Mais restritivo)

Marque ☑️ **"Include administrators"** se quer que NINGUÉM possa bypass.

**Recomendação:** Use Opção A para manter flexibilidade em emergências.

### Passo 5: Configurar Branch Cleanup (Opcional, mas recomendado)

Na seção **"Clean up"**:

Marque ☑️ **"Automatically delete head branches"**

**Benefícios:**
- Branches são deletadas automaticamente após merge
- Mantém a lista de branches limpa
- Reduz clutter no repositório

### Passo 6: Configurar Reviews (Opcional - Team Size Dependent)

Na seção **"Require a pull request before merging"**:

**Para projetos individuais ou times pequenos:**
- ❌ NÃO marque "Require approvals" (iteração mais rápida)

**Para times maiores:**
- ☑️ Marque "Require approvals"
- Defina número mínimo de aprovadores (ex: 1 ou 2)
- Marque "Dismiss stale pull request approvals when new commits are pushed"

**Recomendação baseada em CONTEXTO.md:** 0 reviewers required (owner-only repo, faster iteration).

### Passo 7: Salvar a Rule

1. Role até o final da página
2. Clique no botão **"Create"** (ou "Save changes" se editando)

---

## Verificação

### Como Verificar que Branch Protection está Funcionando

#### Teste 1: PR com Código Inválido

1. Crie um branch de teste:
   ```bash
   git checkout -b test-branch-protection
   ```

2. Faça uma mudança que falhe lint:
   ```javascript
   // Adicione código com problema de formatação
   const x=1+2
   ```

3. Commit e push:
   ```bash
   git add .
   git commit -m "test: branch protection verification"
   git push origin test-branch-protection
   ```

4. Abra um Pull Request

5. **Verifique:**
   - ❌ Job `lint` deve falhar
   - ❌ Botão "Merge" deve estar **bloqueado**
   - ❌ Mensagem deve indicar: "Required status checks must pass"

#### Teste 2: PR com Código Válido

1. Corrija o problema:
   ```bash
   npm run lint -- --fix
   npm run format
   ```

2. Commit e push:
   ```bash
   git add .
   git commit -m "fix: resolve lint issues"
   git push origin test-branch-protection
   ```

3. **Verifique:**
   - ✅ Job `lint` deve passar
   - ✅ Jobs `test-linux` e `test-macos` devem rodar
   - ✅ Job `integration-test` deve rodar
   - ✅ Após todos passarem, botão "Merge" deve ficar **verde**

#### Teste 3: Branch Cleanup

1. Após merge, verifique se a branch foi automaticamente deletada
2. Vá para "Branches" no GitHub
3. A branch `test-branch-protection` não deve aparecer

### Checklist de Verificação

- [ ] Settings → Branches → Branch protection rules mostra rule para `main`
- [ ] "Require status checks to pass before merging" está marcado
- [ ] Todos os checks obrigatórios estão listados:
  - [ ] `lint`
  - [ ] `test-linux (Node 20)`
  - [ ] `test-linux (Node 22)`
  - [ ] `test-macos (Node 20)`
  - [ ] `test-macos (Node 22)`
  - [ ] `integration-test`
- [ ] "Require branches to be up to date before merging" está marcado
- [ ] Admin override configurado conforme preferência
- [ ] "Automatically delete head branches" está marcado
- [ ] PR de teste confirma bloqueio quando checks falham
- [ ] PR de teste confirma liberação quando todos checks passam

---

## Configuração Completa - Resumo

### Settings Aplicados

| Setting | Valor | Razão |
|---------|-------|-------|
| Branch name pattern | `main` | Proteger branch principal |
| Require status checks | ✅ | Quality gate obrigatório |
| Required checks | 6 checks | Todos os jobs críticos |
| Require up-to-date branches | ✅ | Evitar conflitos |
| Admin bypass | ✅ Permitido | Hotfixes emergenciais |
| Auto-delete branches | ✅ | Manter repositório limpo |
| Require reviews | ❌ | Owner-only repo, iteração rápida |

### Lista Final de Required Checks

```
☑ lint
☑ test-linux (Node 20)
☑ test-linux (Node 22)
☑ test-macos (Node 20)
☑ test-macos (Node 22)
☑ integration-test
```

---

## Workflows Relacionados

### test.yml (Test Workflow)

**Arquivo:** `.github/workflows/test.yml`

**Trigger:** Pull Request para `main`, Push para `main`

**Jobs:**
1. `lint` - Fail-fast check
2. `test-linux` - Unit tests (matrix: Node 20, 22)
3. `test-macos` - Unit tests (matrix: Node 20, 22)
4. `integration-test` - Integration tests
5. `report` - Coverage aggregation (main only)

**Dependências:**
- `test-linux`, `test-macos`, `integration-test` dependem de `lint`
- `report` depende de todos os testes

### release.yml (Release Workflow)

**Arquivo:** `.github/workflows/release.yml`

**Trigger:** Push de tags `v*`

**Jobs:**
1. Build e test
2. Publish to npm
3. Create GitHub Release

**Nota:** Branch protection não se aplica a tags, mas o release workflow valida qualidade antes de publicar.

---

## Troubleshooting

### Problema: "Required checks not found in list"

**Causa:** Workflow ainda não rodou no repositório.

**Solução:**
1. Crie um PR de teste
2. Deixe o workflow rodar
3. Os checks aparecerão na lista

### Problema: "Merge blocked even after checks pass"

**Causa:** Branch desatualizada com `main`.

**Solução:**
```bash
git checkout main
git pull origin main
git checkout seu-branch
git merge main
# Resolva conflitos se houver
git push origin seu-branch
```

### Problema: "Admin cannot merge without checks"

**Causa:** "Include administrators" está marcado.

**Solução:** Desmarque "Include administrators" ou use "Allow specific actors to bypass".

### Problema: "Checks taking too long"

**Causa:** Todos os jobs rodam em paralelo, mas dependem do `lint`.

**Otimização:** Se lint passa rápido, o gargalo são os testes. Considere:
- Paralelizar mais testes
- Dividir integration-test em menores
- Caching de dependências

---

## Próximos Passos

Após configurar branch protection:

1. **Verifique** que todos os checks estão passando no PR atual
2. **Comunique** o time sobre as novas regras
3. **Documente** o processo de PR no CONTRIBUTING.md
4. **Monitore** performance dos jobs (otimizar se necessário)

---

## Referências

- [GitHub Docs: About branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Require status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-status-checks)
- [CONTEXTO.md](/.fase-ai/fases/02-cicd-pipeline/02-CONTEXTO.md) - Decisões de implementação
- [ROTEIRO.md](/.fase-ai/ROTEIRO.md) - Roadmap de implementação

---

**Documento criado para REQ-017:** Tests required before merge  
**Autor:** FASE Executor  
**Data:** 2026-04-23