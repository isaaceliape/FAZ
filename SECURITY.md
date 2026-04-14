# Política de Segurança

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 3.x    | ✅        |
| < 3.0  | ❌        |

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

## Proteções de Segurança Implementadas

### v3.5.0+

- **Proteção contra path traversal via symlink**: Validação de caminhos com `realpathSync()` previne que symlinks apontem para fora do limite do projeto
- **Validação de espaço em disco**: Previne corrupção de dados quando disco está cheio
- **Limite de tamanho de input**: Hooks rejeitam inputs > 10MB para prevenir ataques de memória
- **Timeout em hooks**: Previne deadlocks com timeout de 10s

### Como Reportar

Se você encontrar uma vulnerabilidade que contorne estas proteções, siga o processo acima.

## Créditos

Agradecemos a todos os pesquisadores de segurança que reportam responsavelmente.
