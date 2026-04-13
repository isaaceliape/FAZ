# 📚 Documentação do FASE

> **Versão**: 3.3.1 | Última atualização: 2026-04-10

Bem-vindo ao centro de documentação do FASE! Aqui você encontra tudo que precisa para instalar, usar e contribuir ao projeto.

## 📖 Documentos Principais

### Para Usuários

| Documento | Descrição |
|-----------|-----------|
| [**Guia do Usuário**](guia-do-usuario.html) | Guia completo de instalação e uso do FASE |
| [**Comandos**](COMANDOS.html) | Lista com todos os 32 comandos disponíveis |
| [**NPM Registry**](NPM-REGISTRY.html) | Configuração do npm registry e instalação |
| [**Verificação de Versão**](VERIFICAR-VERSAO.html) | Sistema automático de verificação de atualizações |

### Para Desenvolvedores

| Documento | Descrição |
|-----------|-----------|
| [**Guia de Contribuição**](CONTRIBUINDO.html) | Como contribuir para o FASE (bugs, features, traduções) |
| [**Git Hooks**](HOOKS.html) | Git hooks e verificações de segurança |
| [**Padronização de Caminhos**](technical/padronizacao-caminhos.html) | Mecanismo de padronização de caminhos |

## <i class="fa fa-bullseye"></i> Começar Por Aqui

### Sou um Usuário

1. Leia [Guia do Usuário](guia-do-usuario.html) para instalação
2. Explore [Comandos](COMANDOS.html) para ver o que está disponível

### Quero Contribuir

1. Abra uma issue descrevendo sua ideia
2. Leia [Guia de Contribuição](CONTRIBUINDO.html)
3. Siga o setup local
4. Abra um Pull Request

### Encontrei um Bug

1. Procure em [GitHub Issues](https://github.com/isaaceliape/FASE/issues) por issue similar
2. Abra uma nova issue com os detalhes

## <i class="fa fa-list-check"></i> Estrutura de Arquivos

```
docs/
├── README.md              # Este arquivo (índice)
├── guia-do-usuario.md     # Guia para usuários
├── COMANDOS.md            # Lista de comandos
├── CONTRIBUINDO.md        # Guia de contribuição
├── HOOKS.md               # Git hooks documentation
├── NPM-REGISTRY.md        # Configuração npm
├── technical/
│   └── padronizacao-caminhos.md   # Path standardization
└── maintainers/
    └── MANTENEDORES.md     # Informações para maintainers
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

### v3.3.0 (Abril 2026)

**Verificação Automática de Versão**
- <i class="fa fa-check-circle"></i> Hook `SessionStart` verifica automaticamente por atualizações no npm
- <i class="fa fa-check-circle"></i> Notificação estilizada mostra versão atual vs disponível
- <i class="fa fa-check-circle"></i> Prompt interativo pergunta se deseja atualizar
- <i class="fa fa-check-circle"></i> Statusline mostra indicador `⬆ /fase:atualizar` quando há atualização
- <i class="fa fa-check-circle"></i> Cache local em `~/.claude/cache/fase-update-check.json`

### v3.2.0 (Março 2026)

**Path Standardization & Multi-Runtime Architecture**
- <i class="fa fa-check-circle"></i> Todos os comandos e agentes agora usam padrão universal `@~/.fase/`
- <i class="fa fa-check-circle"></i> Installer converte automaticamente para caminhos específicos de cada runtime
- <i class="fa fa-check-circle"></i> 129 testes unitários com cobertura completa
- <i class="fa fa-check-circle"></i> Documentação expandida sobre path standardization
- <i class="fa fa-check-circle"></i> Renomeação de arquivos: `.pt.md` → `.md` para consistência

**Novos Documentos:**
- 📚 [Padronização de Caminhos](technical/padronizacao-caminhos.html) - Explicação do mecanismo de padronização de caminhos
- 📚 Seções expandidas em [bin/test/README.md](https://github.com/isaaceliape/FASE/blob/main/bin/test/README.md) e [bin/test/TESTING.md](https://github.com/isaaceliape/FASE/blob/main/bin/test/TESTING.md)

**Ver também:** [CHANGELOG.md](https://github.com/isaaceliape/FASE/blob/main/CHANGELOG.md) para histórico completo de versões

### v2.4.0 (Março 2026)

- <i class="fa fa-check-circle"></i> Adicionado pre-commit hooks para validação de pacote npm
- <i class="fa fa-check-circle"></i> Criado GitHub Actions para publicação automática
- <i class="fa fa-check-circle"></i> Templates de issues para bug reports e features
- <i class="fa fa-check-circle"></i> CONTRIBUTING.md com instruções detalhadas
- <i class="fa fa-check-circle"></i> Este índice de documentação

## 📞 Contato

- **GitHub**: [isaaceliape/FASE](https://github.com/isaaceliape/FASE)
- **Issues**: [GitHub Issues](https://github.com/isaaceliape/FASE/issues)
- **Email**: Via issue (por favor, não compartilhar emails publicamente)

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
