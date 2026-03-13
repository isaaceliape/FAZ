# 👨‍💼 Guia para Maintainers

Documentação interna para quem mantém o FASE.

## 👥 Maintainers Atuais

- **Isaac Eliape** — Criador e maintainer principal [@isaaceliape](https://github.com/isaaceliape)

## 🔄 Processo de Release

### Antes de Publicar

```bash
# 1. Verify everything
./scripts/verificar-release.sh

# 2. Run local tests
./scripts/testar-local.sh

# 3. Review changelog
vim CHANGELOG.md
```

### Publicando (Automático)

```bash
# 1. Tag the release
git tag -a v2.5.0 -m "Release v2.5.0: Descrição aqui"

# 2. Push tags
git push origin main --tags

# 3. GitHub Actions publica automaticamente
# Verifique: https://github.com/isaaceliape/FASE/actions
```

### Pós-Release

- ✅ Verificar publicação no npm: https://www.npmjs.com/package/fase-ai
- ✅ Atualizar release notes no GitHub
- ✅ Anunciar em comunidades (se relevante)

## 📋 Checklist de Manutenção

### Semanal

- [ ] Revisar issues abertas
- [ ] Responder a pull requests
- [ ] Verificar se há vulnerabilidades de dependências

### Mensal

- [ ] Executar `npm audit` em bin/
- [ ] Revisar CONTRIBUTING.md para clareza
- [ ] Verificar estatísticas de uso (npm downloads)

### Trimestral

- [ ] Planejar features para próxima versão
- [ ] Revisar documentação inteira
- [ ] Atualizar dependências devDependencies

## 🐛 Processamento de Issues

### Bug Reports

1. **Triage**
   - Verificar se é realmente um bug
   - Solicitar mais informações se necessário
   - Tag com `bug` e prioridade

2. **Investigação**
   - Reproduzir o bug localmente
   - Identificar a causa
   - Criar PR com fix

3. **Resolução**
   - Merge do PR
   - Fechar a issue
   - Mencionar versão que contém o fix

### Feature Requests

1. **Discussão**
   - Avaliar alinhamento com visão do projeto
   - Discussão pública na issue
   - Decidir se aceita

2. **Implementação** (se aprovado)
   - Criar label `accepted`
   - Dar prioridade
   - Implementar ou aguardar PR

## 🔐 Segurança

### Vulnerabilidades Reportadas

1. **Responda em privado** — Não abrir issue pública
2. **Investigar** — Confirmar e avaliar impacto
3. **Fixar** — Criar PR com fix
4. **Publicar** — Release com fix
5. **Divulgar** — Comunicar a vulnerabilidade após fix publicado

Ver [SECURITY.md](SECURITY.md) para mais detalhes.

## 📚 Documentação

### Quando Atualizar

- ✅ Novo comando adicionado → Atualizar COMANDOS.md
- ✅ Feature nova → Atualizar USER-GUIDE.md
- ✅ Breaking change → Nota clara em CHANGELOG.md

### Padrão de Escrita

- Português brasileiro em toda documentação
- Termos técnicos em inglês quando necessário
- Exemplos com real-world use cases

## 🧙‍♂️ Dicas e Tricks

### Testar Localmente

```bash
# Instalação local para desenvolvimento
node bin/install.js --claude --local

# Verificar arquivo gerado
ls -la .claude/command/
```

### Debug do Install Script

```bash
# Ver todos os logs
node bin/install.js --claude --local 2>&1 | tee /tmp/install.log

# Validar JSON do package.json
jq empty bin/package.json
```

### Gerenciar Dependências

Manter devDependencies atualizadas:

```bash
npm outdated
npm update
```

## 📞 Comunicação

- **Issues**: [GitHub Issues](https://github.com/isaaceliape/FASE/issues)
- **Discussions**: [GitHub Discussions](https://github.com/isaaceliape/FASE/discussions)
- **Email**: Via issue privada (não publicar emails)

## 📈 Métricas de Sucesso

Rastreie estas métricas para avaliar saúde do projeto:

- 📊 npm downloads/month
- ⭐ GitHub stars
- 🐛 Taxa de bugs reportados vs. resolvidos
- 👥 Contribuidores ativos
- 📝 Issues abertas vs. fechadas

## 🚀 Roadmap de Longo Termo

Visão para o FASE:

1. **v2.5+**: Melhorias de infra (hooks, CI/CD, templates)
2. **v3.0**: Possível refactor para TypeScript
3. **Futuro**: Suporte a mais runtimes (mais IDEs de AI)

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
**Mantido por**: Isaac Eliape
