# <i class="fa fa-wrench"></i> Comandos do F.A.S.E.

> **Versão**: 4.0.0 ✅ | Última atualização: 2026-04-20

**34 comandos em português brasileiro para Claude Code.**

---

## <i class="fa fa-list-check"></i> Índice

- [Essenciais](#essenciais) — Comandos principais
- [Planejamento](#planejamento) — Planejamento e milestones
- [Pesquisa](#pesquisa) — Pesquisa e mapeamento
- [Verificação](#verificação) — Verificação e validação
- [Depuração](#depuração) — Debug e troubleshooting
- [Discussão](#discussão) — Discussão e conclusão
- [Arquitetura e Contexto](#arquitetura-e-contexto) — Decisões arquiteturais e contexto de sessão
- [Utilitários](#utilitários) — Utilitários diversos

---

## Essenciais

Comandos essenciais para começar e executar projetos.

### `/fase-ajuda`

Mostra ajuda geral e lista de comandos disponíveis.

**Aliases:** `help`, `h`

**Exemplo:**
```bash
/fase-ajuda
/fase-ajuda novo-projeto  # Ajuda específica de um comando
```

---

### `/fase-novo-projeto`

Inicia um novo projeto F.A.S.E. no diretório atual.

**O que faz:**
- Cria estrutura de pastas `.fase-ai-local/`
- Inicializa STATE.md, ROADMAP.md, REQUIREMENTS.md
- Configura contexto do projeto

**Exemplo:**
```bash
/fase-novo-projeto "Sistema de autenticação JWT"
```

---

### `/fase-planejar-fase`

Cria um plano detalhado para uma fase específica.

**O que faz:**
- Analisa o objetivo da fase
- Quebra em tarefas atômicas
- Define critérios de sucesso
- Estima complexidade

**Exemplo:**
```bash
/fase-planejar-fase "Implementar login com email/senha"
```

---

### `/fase-executar-fase`

Executa o plano de uma fase, tarefa por tarefa.

**O que faz:**
- Executa tarefas na ordem
- Cria commits atômicos por tarefa
- Lida com desvios automaticamente
- Pausa em checkpoints quando necessário

**Exemplo:**
```bash
/fase-executar-fase "fase-1"
```

---

### `/fase-configuracoes`

Mostra e ajusta configurações do F.A.S.E.

**O que faz:**
- Lista configurações atuais
- Permite alterar preferências
- Gerencia perfis de modelo

**Exemplo:**
```bash
/fase-configuracoes
/fase-configuracoes set modelo padrao claude-sonnet
```

---

## Planejamento

Comandos para planejar e gerenciar milestones e fases.

### `/fase-novo-marco`

Cria um novo marco (milestone) no roadmap.

**O que faz:**
- Define objetivo do marco
- Estabelece critérios de conclusão
- Linka com requirements

**Exemplo:**
```bash
/fase-novo-marco "MVP funcional até sexta"
```

---

### `/fase-adicionar-fase`

Adiciona uma nova fase ao projeto.

**O que faz:**
- Cria fase com nome e descrição
- Define posição no roadmap
- Linka com marco relevante

**Exemplo:**
```bash
/fase-adicionar-fase "Autenticação de usuários"
```

---

### `/fase-inserir-fase`

Insere uma fase em uma posição específica (entre outras fases).

**O que faz:**
- Insere fase em posição personalizada
- Recalcula ordem das fases existentes
- Ajusta dependências

**Exemplo:**
```bash
/fase-inserir-fase "Validação de inputs" --depois "fase-2"
```

---

### `/fase-remover-fase`

Remove uma fase do projeto.

**O que faz:**
- Remove fase do roadmap
- Ajusta ordem das fases restantes
- Arquiva plano da fase removida

**Exemplo:**
```bash
/fase-remover-fase "fase-3"
```

---

### `/fase-pausar-trabalho`

Pausa o trabalho atual e salva o estado.

**O que faz:**
- Salva estado atual da execução
- Marca ponto de retomada
- Libera contexto para outras tarefas

**Exemplo:**
```bash
/fase-pausar-trabalho "Preciso sair, continuo depois"
```

---

### `/fase-retomar-trabalho`

Retoma trabalho de onde parou.

**O que faz:**
- Carrega estado salvo
- Restaura contexto da execução
- Continua da tarefa pendente

**Exemplo:**
```bash
/fase-retomar-trabalho
```

---

### `/fase-progresso`

Mostra o progresso atual do projeto.

**O que faz:**
- Exibe status das fases
- Mostra tarefas completadas vs pendentes
- Calcula porcentagem geral

**Exemplo:**
```bash
/fase-progresso
```

---

## Pesquisa

Comandos para pesquisar e mapear o projeto.

### `/fase-pesquisar-fase`

Realiza pesquisa para embasar uma fase.

**O que faz:**
- Pesquisa tecnologias relevantes
- Identifica melhores práticas
- Lista potenciais armadilhas
- Cria documento de pesquisa

**Exemplo:**
```bash
/fase-pesquisar-fase "Implementar WebSockets para chat em tempo real"
```

---

### `/fase-mapear-codigo`

Mapeia um codebase existente.

**O que faz:**
- Analisa estrutura de pastas
- Identifica padrões de arquitetura
- Mapeia dependências
- Documenta convenções do projeto

**Exemplo:**
```bash
/fase-mapear-codigo
```

**Output:**
- `CODEBASE/stack.md` — Tecnologias usadas
- `CODEBASE/architecture.md` — Padrão arquitetural
- `CODEBASE/conventions.md` — Convenções de código
- `CODEBASE/integrations.md` — Integrações externas

---

### `/fase-listar-premissas`

Lista todas as premissas de uma fase.

**O que faz:**
- Extrai premissas do plano
- Mostra suposições feitas
- Identifica riscos potenciais

**Exemplo:**
```bash
/fase-listar-premissas "fase-2"
```

---

## Verificação

Comandos para verificar e validar o trabalho.

### `/fase-verificar-trabalho`

Verifica se o trabalho foi feito corretamente.

**O que faz:**
- Revisa código implementado
- Confirma critérios de sucesso
- Identifica issues pendentes
- Gera relatório de verificação

**Exemplo:**
```bash
/fase-verificar-trabalho "fase-1"
```

---

### `/fase-validar-fase`

Valida que uma fase está completa e pronta.

**O que faz:**
- Confirma todas as tarefas feitas
- Verifica testes passando
- Valida integração com outras fases
- Aprova para próximo passo

**Exemplo:**
```bash
/fase-validar-fase "fase-1"
```

---

### `/fase-auditar-marco`

Realiza auditoria de um marco.

**O que faz:**
- Revisa todos os requirements do marco
- Confirma critérios de aceitação
- Gera relatório de auditoria
- Identifica gaps restantes

**Exemplo:**
```bash
/fase-auditar-marco "MVP"
```

---

## Depuração

Comandos para debug e troubleshooting.

### `/fase-debug`

Inicia sessão de debug estruturado.

**O que faz:**
- Coleta informações do erro
- Analisa stack traces
- Identifica causa raiz
- Sugere correções

**Exemplo:**
```bash
/fase-debug "Erro 500 ao fazer login"
```

---

### `/fase-checar-tarefas`

Lista todas as tarefas do projeto.

**O que faz:**
- Varre código por tarefas pendentes
- Agrupa por arquivo/fase
- Mostra status de cada uma

**Exemplo:**
```bash
/fase-checar-tarefas
```

---

### `/fase-adicionar-tarefa`

Adiciona uma tarefa ao projeto.

**O que faz:**
- Cria entrada na lista de tarefas
- Linka com fase relevante
- Define prioridade

**Exemplo:**
```bash
/fase-adicionar-tarefa "Adicionar rate limiting no login" --prioridade alta
```

---

### `/fase-adicionar-testes`

Adiciona testes para uma funcionalidade.

**O que faz:**
- Identifica funcionalidade sem testes
- Gera testes unitários
- Gera testes de integração
- Adiciona ao plano de testes

**Exemplo:**
```bash
/fase-adicionar-testes "Autenticação JWT"
```

---

## Discussão

Comandos para discussão e conclusão.

### `/fase-discutir-fase`

Inicia discussão sobre uma fase.

**O que faz:**
- Lista pontos de decisão
- Mostra alternativas
- Coleta prós e contras
- Prepara para decisão humana

**Exemplo:**
```bash
/fase-discutir-fase "Autenticação: JWT vs Session"
```

---

### `/fase-completar-marco`

Marca um marco como completado.

**O que faz:**
- Verifica todos os requirements
- Arquiva fases relacionadas
- Atualiza ROADMAP.md
- Celebra conquista! 🎉

**Exemplo:**
```bash
/fase-completar-marco "MVP"
```

---

### `/fase-planejar-lacunas`

Identifica e planeja como fechar lacunas de um marco.

**O que faz:**
- Compara realizado vs planejado
- Identifica gaps
- Cria plano para fechar cada gap
- Prioriza por impacto

**Exemplo:**
```bash
/fase-planejar-lacunas "MVP"
```

---

## Arquitetura e Contexto

Comandos para decisões arquiteturais e gerenciamento de contexto de sessão.

### `/fase-arquitetar`

Registra e gerencia decisões arquiteturais do projeto.

**O que faz:**
- Analisa o estado atual do projeto
- Propõe ADRs (Architecture Decision Records)
- Documenta contratos de API, limites de módulo e modelo de dados
- Produz `ARQUITETURA.md` com decisões justificadas

**Exemplo:**
```bash
/fase-arquitetar "Definir estratégia de autenticação"
/fase-arquitetar                    # Revisar decisões existentes
```

---

### `/fase-contexto`

Exibe e gerencia o contexto persistente da sessão atual.

**O que faz:**
- Sem argumentos: mostra o `.fase-ai-local/CONTEXTO.md` atual
- `--limpar`: apaga o contexto da sessão
- `--resumo`: gera um resumo compacto do estado atual

**Exemplo:**
```bash
/fase-contexto                      # Ver contexto atual
/fase-contexto --limpar             # Apagar contexto
/fase-contexto --resumo             # Gerar resumo
```

---

## Utilitários

Comandos utilitários diversos.

### `/fase-limpar`

Limpa arquivos temporários e cache.

**O que faz:**
- Remove arquivos `.tmp`
- Limpa cache de builds
- Remove logs antigos

**Exemplo:**
```bash
/fase-limpar
```

---

### `/fase-saude`

Realiza checkup de saúde do projeto.

**O que faz:**
- Verifica dependências
- Checa testes passando
- Identifica code smells
- Sugere melhorias

**Exemplo:**
```bash
/fase-saude
```

---

### `/fase-atualizar`

Atualiza o F.A.S.E. para a versão mais recente.

**O que faz:**
- Verifica versão instalada
- Baixa atualizações disponíveis
- Aplica patches
- Reinicia se necessário

**Exemplo:**
```bash
/fase-atualizar
```

---

### `/fase-rapido`

Modo rápido para tarefas simples.

**O que faz:**
- Pula cerimônias desnecessárias
- Executa direto ao ponto
- Ideal para mudanças pequenas

**Exemplo:**
```bash
/fase-rapido "Adiciona log no endpoint de login"
```

---

---

### `/fase-reaplicar-patches`

Reaplica patches que falharam anteriormente.

**O que faz:**
- Lista patches pendentes
- Tenta reaplicar cada um
- Reporta conflitos
- Sugere resoluções

**Exemplo:**
```bash
/fase-reaplicar-patches
```

---

### `/fase-definir-perfil`

Define o perfil de modelo a ser usado.

**O que faz:**
- Lista perfis disponíveis
- Define modelo padrão
- Ajusta configurações por tipo de tarefa

**Exemplo:**
```bash
/fase-definir-perfil claude-sonnet
/fase-definir-perfil lista
```

---

## 📞 Suporte

**Problemas com algum comando?**

- 📖 [Guia do Usuário](guia-do-usuario.html)
- 🐛 [Reportar bug](https://github.com/isaaceliape/FASE/issues)

---

**"Chega de enrolação. Descreve o que quer e FASE acontecer."** 🇧🇷<i class="fa fa-rocket"></i>
