# 📚 Documentação do FASE

> **Nota:** Este diretório é uma cópia de distribuição. A fonte canônica é `/docs/` na raiz do repositório. Edite os arquivos em `/docs/` e copie aqui.

Bem-vindo ao centro de documentação do FASE! Aqui você encontra tudo que precisa para instalar, usar e contribuir ao projeto.

## 📖 Documentos Principais

### Para Usuários

| Documento | Descrição |
|-----------|-----------|
| [**GUIA-DO-USUARIO.md**](GUIA-DO-USUARIO.md) | Guia completo de instalação e uso do FASE |
| [**COMANDOS.md**](COMANDOS.md) | Lista com todos os 32 comandos disponíveis |
| [**NPM-REGISTRY.md**](NPM-REGISTRY.md) | Configuração do npm registry e instalação |

### Para Desenvolvedores

| Documento | Descrição |
|-----------|-----------|
| [**CONTRIBUTING.md**](https://github.com/isaaceliape/FASE/blob/main/CONTRIBUTING.md) | Como contribuir para o FASE (bugs, features, traduções) |
| [**HOOKS.md**](HOOKS.md) | Git hooks e verificações de segurança |
| [**SECURITY.md**](https://github.com/isaaceliape/FASE/blob/main/SECURITY.md) | Política de segurança e relatório de vulnerabilidades |

## <i class="fa fa-bullseye"></i> Começar Por Aqui

### Sou um Usuário

1. Leia [GUIA-DO-USUARIO.md](GUIA-DO-USUARIO.md) para instalação
2. Explore [COMANDOS.md](COMANDOS.md) para ver o que está disponível

### Quero Contribuir

1. Abra uma issue descrevendo sua ideia
2. Leia [CONTRIBUTING.md](https://github.com/isaaceliape/FASE/blob/main/CONTRIBUTING.md)
3. Siga o setup local
4. Abra um Pull Request

### Encontrei um Bug

1. Procure em [GitHub Issues](https://github.com/isaaceliape/FASE/issues) por issue similar
3. Abra uma nova issue com os detalhes

## <i class="fa fa-list-check"></i> Estrutura de Arquivos

```
docs/
├── README.md              # Este arquivo (índice)
├── GUIA-DO-USUARIO.md     # Guia para usuários
├── COMANDOS.md            # Lista de comandos
└── HOOKS.md               # Git hooks documentation
```

## 🌐 Documentos em Português

**Toda documentação do FASE é em português brasileiro:**
- <i class="fa fa-check-circle"></i> Guias de usuário
- <i class="fa fa-check-circle"></i> Documentação de development
- <i class="fa fa-check-circle"></i> Comentários no código
- <i class="fa fa-check-circle"></i> Mensagens de erro e output

**Exceções (em inglês):**
- <i class="fa fa-cog"></i> Termos técnicos consagrados (framework, hook, commit)
- <i class="fa fa-laptop"></i> Comandos e código
- <i class="fa fa-box"></i> Nomes de pacotes npm

## 🆘 Precisa de Ajuda?

- **Problema técnico**: Abra uma [issue](https://github.com/isaaceliape/FASE/issues) com tag `[help]`
- **Bug descoberto**: Reporte com template `bug_report.md`
- **Sugestão**: Use template `feature_request.md`

## <i class="fa fa-chart-line"></i> Melhorias Documentadas

### v3.2.0 (Março 2026)

**Path Standardization & Multi-Runtime Architecture**
- <i class="fa fa-check-circle"></i> Todos os comandos e agentes agora usam padrão universal `@~/.fase/`
- <i class="fa fa-check-circle"></i> Installer converte automaticamente para caminhos específicos de cada runtime
- <i class="fa fa-check-circle"></i> 129 testes unitários com cobertura completa
- <i class="fa fa-check-circle"></i> Documentação expandida sobre path standardization
- <i class="fa fa-check-circle"></i> Renomeação de arquivos: `.pt.md` → `.md` para consistência

**Novos Documentos:**
- 📚 [TEST_UPDATES_SUMMARY.md](https://github.com/isaaceliape/FASE/blob/main/TEST_UPDATES_SUMMARY.md) - Rastreamento detalhado de mudanças
- 📚 [COMMAND_PATHS.md](https://github.com/isaaceliape/FASE/blob/main/COMMAND_PATHS.md) - Explicação do mecanismo de path standardization
- 📚 Seções expandidas em [bin/test/README.md](https://github.com/isaaceliape/FASE/blob/main/bin/test/README.md) e [bin/test/TESTING.md](https://github.com/isaaceliape/FASE/blob/main/bin/test/TESTING.md)

**Ver também:** [CHANGELOG.md](https://github.com/isaaceliape/FASE/blob/main/CHANGELOG.md) para histórico completo de versões

### v2.4.0 (Março 2026)

- <i class="fa fa-check-circle"></i> Adicionado pre-commit hooks para validação de pacote npm
- <i class="fa fa-check-circle"></i> Criado GitHub Actions para publicação automática
- <i class="fa fa-check-circle"></i> Templates de issues para bug reports e features
- <i class="fa fa-check-circle"></i> CONTRIBUTING.md com instruções detalhadas
- <i class="fa fa-check-circle"></i> SECURITY.md com política de segurança
- <i class="fa fa-check-circle"></i> Este índice de documentação

## 📞 Contato

- **GitHub**: [isaaceliape/FASE](https://github.com/isaaceliape/FASE)
- **Issues**: [GitHub Issues](https://github.com/isaaceliape/FASE/issues)
- **Email**: Via issue (por favor, não compartilhar emails publicamente)

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
