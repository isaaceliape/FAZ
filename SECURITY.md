# Política de Segurança

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 3.x    | <i class="fa fa-check-circle"></i>        |
| < 3.0  | <i class="fa fa-times-circle"></i>        |

## Reportar uma Vulnerabilidade

Se você encontrou uma vulnerabilidade de segurança no FASE, **não abra uma issue pública**.

### Como Reportar

1. Abra uma [Security Advisory](https://github.com/isaaceliape/FASE/security/advisories/new) no GitHub
2. Descreva o problema com o máximo de detalhes possível:
   - Tipo de vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Versão afetada

### O que Esperar

- Confirmação de recebimento em até 48 horas
- Avaliação do impacto e severidade
- Correção e divulgação coordenada

## Escopo

Este projeto é uma ferramenta de desenvolvimento local. Vulnerabilidades relevantes incluem:

- Execução arbitrária de código via configuração maliciosa
- Vazamento de dados de projetos locais
- Escalação de privilégios via hooks

## Práticas de Segurança Implementadas

### Operações de Arquivo Seguras
- <i class="fa fa-check-circle"></i> Operações atômicas em cache (arquivo temporário + rename) previnem corrupção
- <i class="fa fa-check-circle"></i> Limpeza de arquivos temporários em sinais de interrupção
- <i class="fa fa-check-circle"></i> Validação segura de caminhos de arquivo

### Tratamento de Erros
- <i class="fa fa-check-circle"></i> Logging de erros em blocos catch para melhor diagnóstico
- <i class="fa fa-check-circle"></i> Falhas silenciosas apropriadas sem comprometer segurança
- <i class="fa fa-check-circle"></i> Manipuladores de saída de processo para limpeza garantida

### Dependências
- <i class="fa fa-check-circle"></i> Versões exatas fixadas em package.json
- <i class="fa fa-check-circle"></i> Auditorias regulares com `npm audit`
- <i class="fa fa-check-circle"></i> Suporte apenas para Node.js >= 18.0.0

### Configurações
- <i class="fa fa-check-circle"></i> Suporte a variáveis de ambiente para caminhos customizáveis
- <i class="fa fa-check-circle"></i> Modo de sandbox para agentes Codex
- <i class="fa fa-check-circle"></i> Validação de entrada nos scripts de instalação

## Segurança de Sessão

O FASE rastreia contexto de sessão em arquivos temporários:
- Localização: `/tmp/claude-ctx-{SESSION_ID}.json`
- Permissões: Herdam do umask do usuário
- Limpeza: Automática após desligamento da sessão

Estes arquivos contêm apenas métricas de contexto, sem código ou conteúdo do projeto.

## Créditos

Agradecemos a todos os pesquisadores de segurança que reportam responsavelmente.
