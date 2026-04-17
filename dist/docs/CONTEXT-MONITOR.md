# Monitor de Janela de Contexto

Um hook post-tool (`PostToolUse` para Claude Code, `AfterTool` para Gemini CLI) que avisa o agente quando o uso da janela de contexto está alto.

## Problema

A statusline mostra o uso do contexto ao **usuário**, mas o **agente** não tem consciência dos limites de contexto. Quando o contexto está baixo, o agente continua trabalhando até atingir o limite — possivelmente no meio de uma tarefa sem nenhum estado salvo.

## Como Funciona

1. O hook de statusline escreve métricas de contexto em `/tmp/claude-ctx-{session_id}.json`
2. Após cada uso de ferramenta, o monitor de contexto lê essas métricas
3. Quando o contexto restante cai abaixo dos limites, ele injeta um aviso como `additionalContext`
4. O agente recebe o aviso em sua conversa e pode agir de acordo

## Limites

| Nível | Restante | Comportamento do Agente |
|-------|----------|------------------------|
| Normal | > 35% | Sem aviso |
| AVISO | <= 35% | Encerrar tarefa atual, evitar iniciar trabalho complexo novo |
| CRÍTICO | <= 25% | Parar imediatamente, salvar estado (`/fase-pausar-trabalho`) |

## Debounce

Para evitar spam de avisos repetidos ao agente:
- O primeiro aviso sempre dispara imediatamente
- Avisos subsequentes exigem 5 usos de ferramenta entre eles
- Escalada de severidade (AVISO -> CRÍTICO) ignora o debounce

## Arquitetura

```
Hook de Statusline (fase-statusline.js)
    | escreve
    v
/tmp/claude-ctx-{session_id}.json
    ^ lê
    |
Monitor de Contexto (fase-context-monitor.js, PostToolUse/AfterTool)
    | injeta
    v
additionalContext -> Agente vê o aviso
```

O arquivo bridge é um objeto JSON simples:

```json
{
  "session_id": "abc123",
  "remaining_percentage": 28.5,
  "used_pct": 71,
  "timestamp": 1708200000
}
```

## Integração com o FASE

O comando `/fase-pausar-trabalho` salva o estado de execução. A mensagem de AVISO sugere usá-lo. A mensagem CRÍTICA instrui o salvamento imediato do estado.

## Configuração

Ambos os hooks são registrados automaticamente durante a instalação via `npx fase-ai`:

- **Statusline** (escreve o arquivo bridge): Registrado como `statusLine` no settings.json
- **Monitor de Contexto** (lê o arquivo bridge): Registrado como hook `PostToolUse` no settings.json (`AfterTool` para Gemini)

**Nota:** Se os arquivos de hooks não existirem no diretório de instalação, os hooks não serão registrados automaticamente para evitar erros.

Registro manual em `~/.claude/settings.json` (Claude Code):

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hooks/fase-statusline.js"
  },
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/fase-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

Para Gemini CLI (`~/.gemini/settings.json`), use `AfterTool` em vez de `PostToolUse`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.gemini/hooks/fase-statusline.js"
  },
  "hooks": {
    "AfterTool": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.gemini/hooks/fase-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

## Segurança

- O hook envolve tudo em try/catch e sai silenciosamente em caso de erro
- Nunca bloqueia a execução de ferramentas — um monitor com problema não deve quebrar o fluxo de trabalho do agente
- Métricas obsoletas (mais de 60s) são ignoradas
- Arquivos bridge ausentes são tratados graciosamente (subagentes, sessões novas)
